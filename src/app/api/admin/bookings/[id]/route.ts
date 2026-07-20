import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  sendBookingConfirmedEmail,
  sendBookingCancelledEmail,
} from "@/lib/email";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!status || !["CONFIRMED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        vehicle: true,
        user: { select: { name: true, email: true } },
      },
    });

    try {
      if (status === "CONFIRMED") {
        await sendBookingConfirmedEmail(booking);
      } else {
        await sendBookingCancelledEmail(booking);
      }
    } catch (e) {
      console.error("Email send failed:", e);
    }

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
