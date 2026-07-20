import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

type BookingEmailData = {
  id: string;
  guestName?: string | null;
  guestEmail?: string | null;
  user?: { name: string; email: string } | null;
  vehicle: { modelName: string; type: string };
  pickupDatetime: Date;
  dropoffDatetime: Date;
  rentalType: string;
  pickupType: string;
  pickupLocation?: string | null;
  dropoffLocation?: string | null;
  totalEstimatedPrice: number;
  accessories: { name: string }[];
};

export async function sendBookingRequestEmail(booking: BookingEmailData) {
  const customerName = booking.guestName || booking.user?.name || "Customer";
  const customerEmail = booking.guestEmail || booking.user?.email;
  if (!customerEmail) return;

  const fmt = (d: Date) => new Date(d).toLocaleString("en-US");
  const accList =
    booking.accessories.length > 0
      ? booking.accessories.map((a) => a.name).join(", ")
      : "None";
  const ref = booking.id.slice(-8).toUpperCase();

  // Email to customer
  await getResend().emails.send({
    from: "Hansol Car Rental <noreply@hansolcarrental.com>",
    to: customerEmail,
    subject: `Booking Request Received - #${ref}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a365d;">Thank you for your booking request!</h2>
      <p>Dear ${customerName},</p>
      <p>We have received your booking request. Our team will review it and confirm shortly.</p>
      <div style="background:#f7fafc;padding:20px;border-radius:8px;margin:20px 0;">
        <h3 style="margin-top:0;">Booking Details</h3>
        <p><strong>Booking ID:</strong> #${ref}</p>
        <p><strong>Vehicle:</strong> ${booking.vehicle.modelName} (${booking.vehicle.type})</p>
        <p><strong>Rental Type:</strong> ${booking.rentalType === "SELF_DRIVE" ? "Self-Drive" : "With Driver"}</p>
        <p><strong>Pickup:</strong> ${fmt(booking.pickupDatetime)}</p>
        <p><strong>Drop-off:</strong> ${fmt(booking.dropoffDatetime)}</p>
        <p><strong>Pickup Method:</strong> ${booking.pickupType === "GARAGE" ? "Garage Collection" : "Pick-up/Drop-off Service"}</p>
        ${booking.pickupLocation ? `<p><strong>Pickup Location:</strong> ${booking.pickupLocation}</p>` : ""}
        ${booking.dropoffLocation ? `<p><strong>Drop-off Location:</strong> ${booking.dropoffLocation}</p>` : ""}
        <p><strong>Accessories:</strong> ${accList}</p>
        <p><strong>Estimated Total:</strong> ₩${booking.totalEstimatedPrice.toLocaleString()}</p>
      </div>
      <p style="color:#718096;">Hansol Car Rental Team</p>
    </div>`,
  });

  // Email to admin
  await getResend().emails.send({
    from: "Hansol Car Rental <noreply@hansolcarrental.com>",
    to: process.env.ADMIN_EMAIL || "admin@hansolcarrental.com",
    subject: `New Booking Request - #${ref}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a365d;">New Booking Request</h2>
      <div style="background:#fffbeb;padding:20px;border-radius:8px;margin:20px 0;border:1px solid #f59e0b;">
        <h3 style="margin-top:0;">Booking #${ref}</h3>
        <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
        <p><strong>Vehicle:</strong> ${booking.vehicle.modelName} (${booking.vehicle.type})</p>
        <p><strong>Rental Type:</strong> ${booking.rentalType === "SELF_DRIVE" ? "Self-Drive" : "With Driver"}</p>
        <p><strong>Pickup:</strong> ${fmt(booking.pickupDatetime)}</p>
        <p><strong>Drop-off:</strong> ${fmt(booking.dropoffDatetime)}</p>
        <p><strong>Estimated Total:</strong> ₩${booking.totalEstimatedPrice.toLocaleString()}</p>
      </div>
      <p>Please review and confirm or cancel this booking from the admin dashboard.</p>
    </div>`,
  });
}

export async function sendBookingConfirmedEmail(booking: {
  id: string;
  guestName?: string | null;
  guestEmail?: string | null;
  user?: { name: string; email: string } | null;
  vehicle: { modelName: string; type: string };
  pickupDatetime: Date;
  dropoffDatetime: Date;
  totalEstimatedPrice: number;
}) {
  const customerName = booking.guestName || booking.user?.name || "Customer";
  const customerEmail = booking.guestEmail || booking.user?.email;
  if (!customerEmail) return;

  const ref = booking.id.slice(-8).toUpperCase();

  await getResend().emails.send({
    from: "Hansol Car Rental <noreply@hansolcarrental.com>",
    to: customerEmail,
    subject: `Booking Confirmed - #${ref}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#059669;">Your booking is confirmed!</h2>
      <p>Dear ${customerName},</p>
      <p>Your booking has been confirmed. Please proceed with manual payment as instructed below.</p>
      <div style="background:#f0fdf4;padding:20px;border-radius:8px;margin:20px 0;border:1px solid #059669;">
        <h3 style="margin-top:0;">Booking #${ref}</h3>
        <p><strong>Vehicle:</strong> ${booking.vehicle.modelName}</p>
        <p><strong>Pickup:</strong> ${new Date(booking.pickupDatetime).toLocaleString()}</p>
        <p><strong>Drop-off:</strong> ${new Date(booking.dropoffDatetime).toLocaleString()}</p>
        <p><strong>Total:</strong> ₩${booking.totalEstimatedPrice.toLocaleString()}</p>
      </div>
      <h3>Payment Instructions</h3>
      <p>Please complete payment via bank transfer:</p>
      <ul>
        <li><strong>Bank:</strong> Woori Bank</li>
        <li><strong>Account:</strong> 123-456-789012</li>
        <li><strong>Holder:</strong> Hansol Car Rental</li>
      </ul>
      <p>Send the transfer receipt via WhatsApp/KakaoTalk.</p>
      <p style="color:#718096;">Hansol Car Rental Team</p>
    </div>`,
  });
}

export async function sendBookingCancelledEmail(booking: {
  id: string;
  guestName?: string | null;
  guestEmail?: string | null;
  user?: { name: string; email: string } | null;
  vehicle: { modelName: string; type: string };
}) {
  const customerName = booking.guestName || booking.user?.name || "Customer";
  const customerEmail = booking.guestEmail || booking.user?.email;
  if (!customerEmail) return;

  const ref = booking.id.slice(-8).toUpperCase();

  await getResend().emails.send({
    from: "Hansol Car Rental <noreply@hansolcarrental.com>",
    to: customerEmail,
    subject: `Booking Unavailable - #${ref}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#dc2626;">Booking Unavailable</h2>
      <p>Dear ${customerName},</p>
      <p>We regret to inform you that your booking for the <strong>${booking.vehicle.modelName}</strong> is unavailable at this time.</p>
      <p>Reference: #${ref}</p>
      <p>We apologize for the inconvenience. Please feel free to make a new reservation.</p>
      <p style="color:#718096;">Hansol Car Rental Team</p>
    </div>`,
  });
}
