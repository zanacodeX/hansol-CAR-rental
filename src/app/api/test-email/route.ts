import { NextResponse } from "next/server";
import { sendBookingRequestEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendBookingRequestEmail({
      id: "test_booking_12345678",
      createdAt: new Date(),
      guestName: "Test Customer",
      guestEmail: "nenasadtv@gmail.com",
      guestPhone: "+82-10-1234-5678",
      guestWhatsappId: null,
      user: null,
      vehicle: { modelName: "Hyundai Tucson 2024", type: "SUV" },
      pickupDatetime: new Date("2026-07-25T10:00:00"),
      dropoffDatetime: new Date("2026-07-27T10:00:00"),
      rentalType: "SELF_DRIVE",
      pickupType: "GARAGE",
      pickupLocation: null,
      dropoffLocation: null,
      flightNumber: null,
      hasIdp: true,
      totalEstimatedPrice: 250000,
      selectedPackage: { name: "Weekend Special", durationDays: 3 },
      accessories: [{ name: "GPS Navigation", price: 10000 }],
    });
    return NextResponse.json({ success: true, message: "Test email sent! Check your inbox." });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
