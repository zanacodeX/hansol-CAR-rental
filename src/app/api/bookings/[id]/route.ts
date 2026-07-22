import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendBookingCancelledEmail } from "@/lib/email";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: true,
        accessories: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const session = await auth();
    if (
      session?.user &&
      (session.user as { role: string }).role !== "ADMIN" &&
      booking.userId !== (session.user as { id: string }).id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const body = await req.json();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const role = (session.user as { role: string }).role;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (role !== "ADMIN" && booking.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (role !== "ADMIN" && body.status === "CANCELLED" && booking.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending bookings can be cancelled" }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: body.status },
      include: {
        vehicle: true,
        accessories: true,
        selectedPackage: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (body.status === "CANCELLED") {
      try {
        await sendBookingCancelledEmail(updated);
      } catch (e) {
        console.error("Cancel email failed:", e);
      }
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
