import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "nenasadtv@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD || "",
  },
});

const EMAIL_FROM_NAME = "Hansol Car Rental";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nenasadtv@gmail.com";

type BookingEmailData = {
  id: string;
  createdAt?: Date;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestWhatsappId?: string | null;
  user?: { name: string; email: string; phone?: string | null } | null;
  vehicle: { modelName: string; type: string };
  pickupDatetime: Date;
  dropoffDatetime: Date;
  rentalType: string;
  pickupType: string;
  pickupLocation?: string | null;
  dropoffLocation?: string | null;
  flightNumber?: string | null;
  hasIdp?: boolean;
  totalEstimatedPrice: number;
  selectedPackage?: { name: string; durationDays: number } | null;
  accessories: { name: string; price?: number }[];
};

const fmt = (d: Date) =>
  new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${process.env.GMAIL_USER || "nenasadtv@gmail.com"}>`,
      to,
      subject,
      html,
    });
    console.log("[Email] Sent to:", to, "MessageId:", info.messageId);
    return true;
  } catch (e) {
    console.error("[Email] Failed to send to:", to, e);
    return false;
  }
}

export async function sendBookingRequestEmail(booking: BookingEmailData) {
  const customerName = booking.guestName || booking.user?.name || "Customer";
  const customerEmail = booking.guestEmail || booking.user?.email;
  if (!customerEmail) {
    console.warn("[Email] No customer email, skipping");
    return;
  }

  const ref = booking.id.slice(-8).toUpperCase();
  const createdAtStr = booking.createdAt ? fmt(booking.createdAt) : "N/A";

  const customerHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <h2 style="color:#1a365d;">Thank you for your booking request!</h2>
    <p>Dear ${customerName},</p>
    <p>We have received your booking request. Our team will review it and confirm shortly.</p>
    <div style="background:#f7fafc;padding:20px;border-radius:8px;margin:20px 0;">
      <h3 style="margin-top:0;">Booking Details</h3>
      <p><strong>Booking ID:</strong> #${ref}</p>
      <p><strong>Submitted:</strong> ${createdAtStr}</p>
      <p><strong>Vehicle:</strong> ${booking.vehicle.modelName} (${booking.vehicle.type})</p>
      <p><strong>Rental Type:</strong> ${booking.rentalType === "SELF_DRIVE" ? "Self-Drive" : "With Driver"}</p>
      <p><strong>Pickup:</strong> ${fmt(booking.pickupDatetime)}</p>
      <p><strong>Drop-off:</strong> ${fmt(booking.dropoffDatetime)}</p>
      <p><strong>Pickup Method:</strong> ${booking.pickupType === "GARAGE" ? "Garage Collection" : "Pick-up/Drop-off Service"}</p>
      ${booking.pickupLocation ? `<p><strong>Pickup Location:</strong> ${booking.pickupLocation}</p>` : ""}
      ${booking.dropoffLocation ? `<p><strong>Drop-off Location:</strong> ${booking.dropoffLocation}</p>` : ""}
      ${booking.selectedPackage ? `<p><strong>Package:</strong> ${booking.selectedPackage.name} (${booking.selectedPackage.durationDays} days)</p>` : ""}
      <p><strong>Estimated Total:</strong> ₩${booking.totalEstimatedPrice.toLocaleString()}</p>
    </div>
    <p style="color:#718096;">Hansol Car Rental Team</p>
  </div>`;

  const adminHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <h2 style="color:#1a365d;">New Booking Request</h2>
    <div style="background:#fffbeb;padding:20px;border-radius:8px;margin:20px 0;border:1px solid #f59e0b;">
      <h3 style="margin-top:0;">Booking #${ref}</h3>
      <p><strong>Submitted:</strong> ${createdAtStr}</p>
      <hr style="border:none;border-top:1px solid #f59e0b;margin:12px 0;" />
      <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
      ${booking.guestPhone ? `<p><strong>Phone:</strong> ${booking.guestPhone}</p>` : ""}
      ${booking.guestWhatsappId ? `<p><strong>WhatsApp/KakaoTalk:</strong> ${booking.guestWhatsappId}</p>` : ""}
      ${booking.user?.phone ? `<p><strong>Phone:</strong> ${booking.user.phone}</p>` : ""}
      <p><strong>IDP:</strong> ${booking.hasIdp ? "Yes" : "No"}</p>
      <hr style="border:none;border-top:1px solid #f59e0b;margin:12px 0;" />
      <p><strong>Vehicle:</strong> ${booking.vehicle.modelName} (${booking.vehicle.type})</p>
      <p><strong>Rental Type:</strong> ${booking.rentalType === "SELF_DRIVE" ? "Self-Drive" : "With Driver"}</p>
      ${booking.selectedPackage ? `<p><strong>Package:</strong> ${booking.selectedPackage.name} (${booking.selectedPackage.durationDays} days)</p>` : ""}
      <hr style="border:none;border-top:1px solid #f59e0b;margin:12px 0;" />
      <p><strong>Pickup:</strong> ${fmt(booking.pickupDatetime)}</p>
      <p><strong>Drop-off:</strong> ${fmt(booking.dropoffDatetime)}</p>
      <p><strong>Pickup Method:</strong> ${booking.pickupType === "GARAGE" ? "Garage Pickup" : "Service (delivery/return)"}</p>
      ${booking.pickupLocation ? `<p><strong>Pickup Location:</strong> ${booking.pickupLocation}</p>` : ""}
      ${booking.dropoffLocation ? `<p><strong>Drop-off Location:</strong> ${booking.dropoffLocation}</p>` : ""}
      ${booking.flightNumber ? `<p><strong>Flight Number:</strong> ${booking.flightNumber}</p>` : ""}
      ${booking.accessories.length > 0 ? `<p><strong>Accessories:</strong> ${booking.accessories.map((a) => `${a.name} (+₩${(a.price || 0).toLocaleString()})`).join(", ")}</p>` : ""}
      <hr style="border:none;border-top:1px solid #f59e0b;margin:12px 0;" />
      <p style="font-size:18px;"><strong>Estimated Total:</strong> ₩${booking.totalEstimatedPrice.toLocaleString()}</p>
    </div>
    <p>Please review and confirm or cancel this booking from the admin dashboard.</p>
  </div>`;

  // Send to customer
  await sendEmail(customerEmail, `Booking Request Received - #${ref}`, customerHtml);

  // Send to admin
  await sendEmail(ADMIN_EMAIL, `New Booking Request - #${ref}`, adminHtml);
}

export async function sendBookingConfirmedEmail(booking: {
  id: string;
  createdAt?: Date;
  confirmedAt?: Date | null;
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
  const confirmedStr = booking.confirmedAt ? fmt(booking.confirmedAt) : fmt(new Date());

  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <h2 style="color:#059669;">Your booking is confirmed!</h2>
    <p>Dear ${customerName},</p>
    <p>Your booking has been confirmed. Please proceed with manual payment as instructed below.</p>
    <div style="background:#f0fdf4;padding:20px;border-radius:8px;margin:20px 0;border:1px solid #059669;">
      <h3 style="margin-top:0;">Booking #${ref}</h3>
      ${booking.createdAt ? `<p><strong>Booked on:</strong> ${fmt(booking.createdAt)}</p>` : ""}
      <p><strong>Confirmed on:</strong> ${confirmedStr}</p>
      <p><strong>Vehicle:</strong> ${booking.vehicle.modelName}</p>
      <p><strong>Pickup:</strong> ${fmt(booking.pickupDatetime)}</p>
      <p><strong>Drop-off:</strong> ${fmt(booking.dropoffDatetime)}</p>
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
  </div>`;

  await sendEmail(customerEmail, `Booking Confirmed - #${ref}`, html);
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

  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <h2 style="color:#dc2626;">Booking Unavailable</h2>
    <p>Dear ${customerName},</p>
    <p>We regret to inform you that your booking for the <strong>${booking.vehicle.modelName}</strong> is unavailable at this time.</p>
    <p>Reference: #${ref}</p>
    <p>We apologize for the inconvenience. Please feel free to make a new reservation.</p>
    <p style="color:#718096;">Hansol Car Rental Team</p>
  </div>`;

  await sendEmail(customerEmail, `Booking Unavailable - #${ref}`, html);
}
