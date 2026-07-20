"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Car, Clock, User, Mail, Phone, Shield, ArrowRight } from "lucide-react";

type Booking = {
  id: string;
  status: string;
  rentalType: string;
  pickupDatetime: string;
  dropoffDatetime: string;
  totalEstimatedPrice: number;
  selectedPackage: { name: string; durationDays: number } | null;
  createdAt: string;
  vehicle: { modelName: string; type: string };
  accessories: { name: string }[];
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((data) => {
          setBookings(data.bookings || []);
          setLoading(false);
        });
    }
  }, [session]);

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);
  const totalSpent = bookings.filter((b) => b.status === "CONFIRMED").reduce((sum, b) => sum + b.totalEstimatedPrice, 0);

  const statusColor = (s: string) => {
    switch (s) {
      case "PENDING": return "bg-amber-100 text-amber-800";
      case "CONFIRMED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
              <h1 className="text-2xl font-bold text-gray-900">{session?.user?.name}</h1>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <Shield className="h-3 w-3" /> {(session?.user as { role: string })?.role || "USER"}
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
            <Car className="h-4 w-4" /> New Booking <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{bookings.filter((b) => b.status === "CONFIRMED").length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Confirmed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">₩{totalSpent.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Spent</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">My Bookings</h2>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["ALL", "PENDING", "CONFIRMED", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400"}`}>
            {s === "ALL" ? "All" : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No bookings found</p>
          <button onClick={() => router.push("/booking")} className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-flex items-center gap-1">
            Make your first booking <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{b.vehicle.modelName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(b.status)}`}>{b.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(b.pickupDatetime).toLocaleDateString()} → {new Date(b.dropoffDatetime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      {b.rentalType === "SELF_DRIVE" ? "Self-Drive" : "With Driver"}
                    </span>
                    {b.selectedPackage && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                        {b.selectedPackage.name}
                      </span>
                    )}
                    {b.accessories.length > 0 && <span className="text-gray-400">+{b.accessories.length} extras</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">₩{b.totalEstimatedPrice.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
