import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendBookingRequestEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (session?.user && (session.user as { role: string }).role === "ADMIN") {
      // Admin sees all bookings
    } else if (session?.user) {
      where.userId = (session.user as { id: string }).id;
    } else {
      return NextResponse.json({ bookings: [] });
    }

    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vehicle: true,
        accessories: true,
        selectedPackage: true,
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const {
      vehicleId,
      rentalType,
      pickupType,
      pickupLocation,
      dropoffLocation,
      pickupDatetime,
      dropoffDatetime,
      flightNumber,
      accessories,
      guestName,
      guestEmail,
      guestPhone,
      guestWhatsappId,
      hasIdp,
      totalEstimatedPrice,
      selectedPackageId,
    } = body;

    if (!vehicleId || !rentalType || !pickupType || !pickupDatetime || !dropoffDatetime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rentalType === "SELF_DRIVE" && !session?.user && !hasIdp) {
      return NextResponse.json(
        { error: "International Driving Permit (IDP Type B) is required for self-drive" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId: session?.user ? (session.user as { id: string }).id : null,
        vehicleId,
        rentalType,
        pickupType,
        pickupLocation: pickupLocation || null,
        dropoffLocation: dropoffLocation || null,
        pickupDatetime: new Date(pickupDatetime),
        dropoffDatetime: new Date(dropoffDatetime),
        flightNumber: flightNumber || null,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        guestWhatsappId: guestWhatsappId || null,
        hasIdp: hasIdp || false,
        selectedPackageId: selectedPackageId || null,
        totalEstimatedPrice: parseFloat(totalEstimatedPrice),
        status: "PENDING",
        accessories: {
          create:
            accessories?.map((a: { name: string; price: number }) => ({
              name: a.name,
              price: a.price || 0,
            })) || [],
        },
      },
      include: {
        vehicle: true,
        accessories: true,
        selectedPackage: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    try {
      await sendBookingRequestEmail(booking);
    } catch (e) {
      console.error("Email send failed:", e);
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (e) {
    console.error("Booking create error:", e);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
