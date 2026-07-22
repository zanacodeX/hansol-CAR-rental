"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  Car,
  Clock,
  User,
  Mail,
  Phone,
  Shield,
  ArrowRight,
  Eye,
  X,
  MessageCircle,
  MapPin,
  Check,
  XCircle,
} from "lucide-react";

type Booking = {
  id: string;
  status: string;
  rentalType: string;
  pickupType: string;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  pickupDatetime: string;
  dropoffDatetime: string;
  flightNumber: string | null;
  totalEstimatedPrice: number;
  selectedPackage: { name: string; durationDays: number } | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  guestWhatsappId: string | null;
  hasIdp: boolean;
  createdAt: string;
  vehicle: { modelName: string; type: string };
  accessories: { name: string; price: number }[];
  user: { name: string; email: string; phone: string | null } | null;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchBookings = () => {
    if (session?.user) {
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((data) => {
          setBookings(data.bookings || []);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        fetchBookings();
        setSelectedBooking(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to cancel booking");
      }
    } catch {
      alert("Failed to cancel booking");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);
  const totalSpent = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.totalEstimatedPrice, 0);

  const statusColor = (s: string) => {
    switch (s) {
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {session?.user?.name}
              </h1>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <Shield className="h-3 w-3" />{" "}
                {(session?.user as { role: string })?.role || "USER"}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {session?.user?.email}
              </span>
              {(session?.user as { phone?: string })?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {(session?.user as { phone?: string })?.phone}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => router.push("/booking")}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <Car className="h-4 w-4" /> New Booking{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {bookings.length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Total Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "CONFIRMED").length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Confirmed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              ₩{totalSpent.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Total Spent</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">My Bookings</h2>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["ALL", "PENDING", "CONFIRMED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400"
            }`}
          >
            {s === "ALL" ? "All" : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No bookings found</p>
          <button
            onClick={() => router.push("/booking")}
            className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-flex items-center gap-1"
          >
            Make your first booking <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition border border-gray-100"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{b.vehicle.modelName}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(b.pickupDatetime).toLocaleDateString()} →{" "}
                      {new Date(b.dropoffDatetime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      {b.rentalType === "SELF_DRIVE"
                        ? "Self-Drive"
                        : "With Driver"}
                    </span>
                    {b.selectedPackage && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                        {b.selectedPackage.name}
                      </span>
                    )}
                    {b.accessories.length > 0 && (
                      <span className="text-gray-400">
                        +{b.accessories.length} extras
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">
                      ₩{b.totalEstimatedPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium hover:bg-blue-200 transition text-sm"
                    >
                      <Eye className="h-4 w-4" /> View Details
                    </button>
                    {b.status === "PENDING" && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={actionLoading === b.id}
                        className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition text-sm"
                      >
                        <XCircle className="h-4 w-4" />
                        {actionLoading === b.id ? "..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ BOOKING DETAIL MODAL ═══════════ */}
      {selectedBooking &&
        (() => {
          const b = selectedBooking;
          const customerName = b.user?.name || b.guestName || "Guest";
          const customerEmail = b.user?.email || b.guestEmail || "N/A";
          const customerPhone = b.user?.phone || b.guestPhone || null;
          const whatsappId = b.guestWhatsappId || null;
          return (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
              onClick={() => setSelectedBooking(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-bold">
                      Booking #{b.id.slice(-8).toUpperCase()}
                    </h2>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${b.status === "PENDING" ? "bg-amber-100 text-amber-800" : b.status === "CONFIRMED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Customer Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Customer Information
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="font-medium text-gray-900">
                          {customerName}
                        </span>
                        {b.user ? (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full">
                            Registered
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full">
                            Walk-in
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{customerEmail}</span>
                      </div>
                      {customerPhone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">
                            {customerPhone}
                          </span>
                        </div>
                      )}
                      {whatsappId && (
                        <div className="flex items-center text-sm">
                          <MessageCircle className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{whatsappId}</span>
                        </div>
                      )}
                      {b.hasIdp && (
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">
                            Has International Driving Permit
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle & Rental */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Vehicle & Rental
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <Car className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">
                          {b.vehicle.modelName} ({b.vehicle.type})
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">
                          {new Date(b.pickupDatetime).toLocaleDateString()} —{" "}
                          {new Date(b.dropoffDatetime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">
                          {b.rentalType === "SELF_DRIVE"
                            ? "Self-Drive"
                            : "With Driver"}{" "}
                          ·{" "}
                          {b.pickupType === "GARAGE"
                            ? "Garage Pickup"
                            : "Service Pick-up/Drop-off"}
                        </span>
                      </div>
                      {b.flightNumber && (
                        <div className="flex items-center text-sm">
                          <span className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">
                            Flight: {b.flightNumber}
                          </span>
                        </div>
                      )}
                      {(b.pickupLocation || b.dropoffLocation) && (
                        <div className="flex items-start text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            {b.pickupLocation && (
                              <p className="text-gray-600">
                                Pickup: {b.pickupLocation}
                              </p>
                            )}
                            {b.dropoffLocation && (
                              <p className="text-gray-600">
                                Dropoff: {b.dropoffLocation}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Package & Extras */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Package & Extras
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      {b.selectedPackage ? (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            {b.selectedPackage.name}
                          </span>{" "}
                          ({b.selectedPackage.durationDays} days)
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          Daily rate
                        </div>
                      )}
                      {b.accessories.length > 0 ? (
                        <div className="flex flex-wrap">
                          {b.accessories.map((a, i) => (
                            <span
                              key={i}
                              className="bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg text-xs mr-2 mb-2"
                            >
                              {a.name}{" "}
                              {a.price > 0 &&
                                `(+₩${a.price.toLocaleString()})`}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No extras</p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Estimated Total
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₩{b.totalEstimatedPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Cancel Action */}
                  {b.status === "PENDING" && (
                    <div className="pt-2">
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={actionLoading === b.id}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                      >
                        <XCircle className="h-4 w-4" />
                        {actionLoading === b.id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
