"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, CheckCircle, XCircle, Clock, Car, Calendar, User, Plus, Pencil, Trash2, X, Package, LayoutDashboard, Settings } from "lucide-react";

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
  hasIdp: boolean;
  createdAt: string;
  vehicle: { modelName: string; type: string };
  accessories: { name: string }[];
  user: { name: string; email: string; phone: string | null } | null;
};

type PackageRate = {
  id: string;
  price: number;
  package: { id: string; name: string; durationDays: number };
};

type Vehicle = {
  id: string;
  modelName: string;
  type: string;
  transmission: string;
  status: string;
  dailyRate: number;
  imageUrl: string | null;
  photos: string | null;
  seatCount: number;
  description: string | null;
  features: string | null;
  packageRates: PackageRate[];
};

type PackageItem = {
  id: string;
  name: string;
  durationDays: number;
  isActive: boolean;
};

const defaultVehicleForm = {
  modelName: "",
  type: "Sedan",
  transmission: "Automatic",
  status: "AVAILABLE",
  dailyRate: "",
  imageUrl: "",
  photos: "[]",
  seatCount: 5,
  description: "",
  features: "",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bookings" | "fleet" | "packages">("bookings");

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fleet state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleForm, setVehicleForm] = useState(defaultVehicleForm);

  // Packages state
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [pkgForm, setPkgForm] = useState({ name: "", durationDays: "" });

  // Vehicle-Package assignment modal
  const [showVehiclePkgModal, setShowVehiclePkgModal] = useState(false);
  const [vehiclePkgTarget, setVehiclePkgTarget] = useState<Vehicle | null>(null);
  const [vehiclePkgRates, setVehiclePkgRates] = useState<Record<string, string>>({});
  const [newPkgId, setNewPkgId] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as { role: string })?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const fetchBookings = () => {
    fetch("/api/bookings").then((r) => r.json()).then((data) => {
      setBookings(data.bookings || []);
      setLoading(false);
    });
  };

  const fetchVehicles = () => {
    fetch("/api/vehicles").then((r) => r.json()).then((data) => {
      setVehicles(data);
      setLoading(false);
    });
  };

  const fetchPackages = () => {
    fetch("/api/packages").then((r) => r.json()).then((data) => setPackages(data));
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchBookings();
      fetchVehicles();
      fetchPackages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ─── Booking actions ───
  const handleBookingAction = async (bookingId: string, action: "CONFIRMED" | "CANCELLED") => {
    setActionLoading(bookingId);
    try {
      await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      fetchBookings();
    } catch {
      alert("Failed to update booking");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookingFilter === "ALL" ? bookings : bookings.filter((b) => b.status === bookingFilter);
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  // ─── Vehicle CRUD ───
  const openAddVehicle = () => { setVehicleForm(defaultVehicleForm); setEditingVehicleId(null); setShowVehicleModal(true); };
  const openEditVehicle = (v: Vehicle) => {
    setVehicleForm({ modelName: v.modelName, type: v.type, transmission: v.transmission, status: v.status, dailyRate: v.dailyRate.toString(), imageUrl: v.imageUrl || "", photos: v.photos || "[]", seatCount: v.seatCount, description: v.description || "", features: v.features || "" });
    setEditingVehicleId(v.id);
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = async () => {
    const url = editingVehicleId ? `/api/vehicles/${editingVehicleId}` : "/api/vehicles";
    const method = editingVehicleId ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(vehicleForm) });
      if (res.ok) { setShowVehicleModal(false); fetchVehicles(); } else { alert("Failed to save vehicle"); }
    } catch { alert("Error saving vehicle"); }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    try { const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" }); if (res.ok) fetchVehicles(); } catch { alert("Error deleting vehicle"); }
  };

  // ─── Package CRUD ───
  const handleSavePackage = async () => {
    if (!pkgForm.name || !pkgForm.durationDays) { alert("Name and duration are required"); return; }
    const url = editingPkgId ? `/api/packages/${editingPkgId}` : "/api/packages";
    const method = editingPkgId ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(pkgForm) });
      if (res.ok) { setShowPkgModal(false); fetchPackages(); } else { alert("Failed to save package"); }
    } catch { alert("Error saving package"); }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Delete this package? This will remove all vehicle rates for it.")) return;
    try { const res = await fetch(`/api/packages/${id}`, { method: "DELETE" }); if (res.ok) { fetchPackages(); fetchVehicles(); } } catch { alert("Error deleting package"); }
  };

  // ─── Vehicle-Package assignment ───
  const openVehiclePkgModal = (v: Vehicle) => {
    setVehiclePkgTarget(v);
    const rates: Record<string, string> = {};
    for (const pr of v.packageRates) rates[pr.package.id] = pr.price.toString();
    setVehiclePkgRates(rates);
    const unassigned = packages.filter((p) => p.isActive && !v.packageRates.some((pr) => pr.package.id === p.id));
    setNewPkgId(unassigned.length > 0 ? unassigned[0].id : "");
    setNewPkgPrice("");
    setShowVehiclePkgModal(true);
  };

  const handleSaveVehiclePackages = async () => {
    if (!vehiclePkgTarget) return;
    const rates = [];
    for (const p of packages) {
      const val = vehiclePkgRates[p.id];
      rates.push({ vehicleId: vehiclePkgTarget.id, packageId: p.id, price: val || null });
    }
    try {
      const res = await fetch("/api/vehicles/rates", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rates }) });
      if (res.ok) { setShowVehiclePkgModal(false); fetchVehicles(); } else { alert("Failed to save"); }
    } catch { alert("Error saving"); }
  };

  const handleAddPackageToVehicle = async () => {
    if (!vehiclePkgTarget || !newPkgId || !newPkgPrice) return;
    try {
      const res = await fetch("/api/vehicles/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: vehiclePkgTarget.id, packageId: newPkgId, price: newPkgPrice }),
      });
      if (res.ok) {
        setVehiclePkgRates((prev) => ({ ...prev, [newPkgId]: newPkgPrice }));
        setNewPkgPrice("");
        const remaining = packages.filter((p) => p.isActive && p.id !== newPkgId && !vehiclePkgRates[p.id] && p.id !== newPkgId);
        setNewPkgId(remaining.length > 0 ? remaining[0].id : "");
        fetchVehicles();
      }
    } catch { alert("Error"); }
  };

  const vehicleStatusColor = (s: string) => {
    switch (s) {
      case "AVAILABLE": return "bg-green-100 text-green-700";
      case "ON_REQUEST": return "bg-yellow-100 text-yellow-700";
      case "MAINTENANCE": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
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
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="bg-blue-600 rounded-xl p-3 mr-3">
          <Shield className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your fleet, packages, and bookings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mr-4 mb-4">
          <p className="text-sm text-gray-500">Total Vehicles</p>
          <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4 md:mr-4">
          <p className="text-sm text-gray-500">Packages</p>
          <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 shadow-sm border border-amber-100 mr-4">
          <p className="text-sm text-amber-600">Pending Bookings</p>
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-100">
          <p className="text-sm text-green-600">Confirmed</p>
          <p className="text-2xl font-bold text-green-700">{bookings.filter((b) => b.status === "CONFIRMED").length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
        {([
          { key: "bookings" as const, label: "Bookings", icon: Calendar, count: pendingCount },
          { key: "fleet" as const, label: "Fleet", icon: Car, count: vehicles.length },
          { key: "packages" as const, label: "Packages", icon: Package, count: packages.length },
        ]).map((tab, i, arr) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition ${i < arr.length - 1 ? "mr-1" : ""} ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            <span className="mr-2">{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════ BOOKINGS TAB ═══════════ */}
      {activeTab === "bookings" && (
        <>
          <div className="flex mb-6">
            {["ALL", "PENDING", "CONFIRMED", "CANCELLED"].map((s, i, arr) => (
              <button key={s} onClick={() => setBookingFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${i < arr.length - 1 ? "mr-2" : ""} ${bookingFilter === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400"}`}>
                {s === "ALL" ? "All" : s}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No bookings to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => {
                const customerName = b.user?.name || b.guestName || "Guest";
                const customerEmail = b.user?.email || b.guestEmail || "N/A";
                return (
                  <div key={b.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                        <div className="flex-1 mb-4 lg:mb-0 lg:mr-4">
                          <div className="flex items-center mb-3">
                          <h3 className="font-bold text-lg mr-3">#{b.id.slice(-8).toUpperCase()}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.status === "PENDING" ? "bg-amber-100 text-amber-800" : b.status === "CONFIRMED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 text-sm">
                          <div className="flex items-center mr-3 mb-3 text-gray-600">
                            <User className="h-4 w-4 flex-shrink-0 mr-2" />
                            <span>{customerName} ({customerEmail})</span>
                          </div>
                          <div className="flex items-center mb-3 text-gray-600">
                            <Car className="h-4 w-4 flex-shrink-0 mr-2" />
                            <span>{b.vehicle.modelName} ({b.vehicle.type})</span>
                          </div>
                          <div className="flex items-center mr-3 mb-3 text-gray-600">
                            <Calendar className="h-4 w-4 flex-shrink-0 mr-2" />
                            <span>{new Date(b.pickupDatetime).toLocaleString()} → {new Date(b.dropoffDatetime).toLocaleString()}</span>
                          </div>
                          <div className="text-gray-600 mb-3">
                            {b.rentalType === "SELF_DRIVE" ? "Self-Drive" : "With Driver"} · {b.pickupType === "GARAGE" ? "Garage" : "Service"}
                            {b.flightNumber ? ` · Flight: ${b.flightNumber}` : ""}
                          </div>
                          {b.selectedPackage && (
                            <div className="text-gray-600 mr-3">Package: {b.selectedPackage.name}</div>
                          )}
                          {b.accessories.length > 0 && (
                            <div className="text-gray-500 md:col-span-2">Extras: {b.accessories.map((a) => a.name).join(", ")}</div>
                          )}
                        </div>
                        <p className="text-xl font-bold text-blue-600 mt-3">₩{b.totalEstimatedPrice.toLocaleString()}</p>
                      </div>
                      {b.status === "PENDING" ? (
                        <div className="flex lg:flex-col">
                          <button onClick={() => handleBookingAction(b.id, "CONFIRMED")} disabled={actionLoading === b.id} className="flex items-center bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition mr-2 lg:mr-0 lg:mb-2">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {actionLoading === b.id ? "..." : "Confirm"}
                          </button>
                          <button onClick={() => handleBookingAction(b.id, "CANCELLED")} disabled={actionLoading === b.id} className="flex items-center bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition">
                            <XCircle className="h-4 w-4 mr-2" />
                            {actionLoading === b.id ? "..." : "Cancel"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="text-sm">{b.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══════════ FLEET TAB ═══════════ */}
      {activeTab === "fleet" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{vehicles.length} vehicles</p>
            <button onClick={openAddVehicle} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" /> Add Vehicle
            </button>
          </div>

          <div className="space-y-3">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition border border-gray-100">
                <div className="flex items-center">
                  <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden mr-4">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.modelName} className="w-full h-full object-cover" />
                    ) : (
                      <Car className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center">
                      <p className="font-bold truncate mr-2">{v.modelName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${vehicleStatusColor(v.status)}`}>{v.status}</span>
                    </div>
                    <p className="text-sm text-gray-500">{v.type} · {v.transmission} · {v.seatCount} seats · ₩{v.dailyRate.toLocaleString()}/day</p>
                    {v.packageRates.length > 0 ? (
                      <div className="flex flex-wrap mt-1.5">
                        {v.packageRates.map((pr, i, arr) => (
                          <span key={pr.id} className={`bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium ${i < arr.length - 1 ? "mr-1.5" : ""}`}>
                            {pr.package.name}: ₩{pr.price.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">No packages assigned</p>
                    )}
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    {packages.length > 0 && (
                      <button onClick={() => openVehiclePkgModal(v)} className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-sm flex items-center mr-2" title="Manage Packages">
                        <Package className="h-4 w-4 mr-1" /> Packages
                      </button>
                    )}
                    <button onClick={() => openEditVehicle(v)} className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm mr-2">
                      <Pencil className="h-4 w-4 inline" /> Edit
                    </button>
                    <button onClick={() => handleDeleteVehicle(v.id)} className="text-red-600 hover:text-red-800 px-2 py-1 rounded text-sm">
                      <Trash2 className="h-4 w-4 inline" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {vehicles.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No vehicles yet. Add one to get started.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════ PACKAGES TAB ═══════════ */}
      {activeTab === "packages" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{packages.length} packages</p>
            <button onClick={() => { setPkgForm({ name: "", durationDays: "" }); setEditingPkgId(null); setShowPkgModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" /> Add Package
            </button>
          </div>

          <div className="space-y-3">
            {packages.map((p) => {
              const assignedCount = vehicles.filter((v) => v.packageRates.some((pr) => pr.package.id === p.id)).length;
              return (
                <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition border border-gray-100">
                  <div>
                    <div className="flex items-center">
                      <p className="font-bold mr-2">{p.name}</p>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium mr-2">{p.durationDays} day(s)</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Assigned to {assignedCount} vehicle(s)</p>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => { setPkgForm({ name: p.name, durationDays: p.durationDays.toString() }); setEditingPkgId(p.id); setShowPkgModal(true); }} className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm mr-2">
                      <Pencil className="h-4 w-4 inline" /> Edit
                    </button>
                    <button onClick={() => handleDeletePackage(p.id)} className="text-red-600 hover:text-red-800 px-2 py-1 rounded text-sm">
                      <Trash2 className="h-4 w-4 inline" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {packages.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No packages yet. Add one to get started.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════ MODALS ═══════════ */}

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingVehicleId ? "Edit Vehicle" : "Add Vehicle"}</h2>
              <button onClick={() => setShowVehicleModal(false)}><X className="h-6 w-6 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name *</label>
                <input type="text" value={vehicleForm.modelName} onChange={(e) => setVehicleForm({ ...vehicleForm, modelName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Hyundai Tucson 2024" />
              </div>
              <div className="grid grid-cols-2">
                <div className="mr-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select value={vehicleForm.type} onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transmission *</label>
                  <select value={vehicleForm.transmission} onChange={(e) => setVehicleForm({ ...vehicleForm, transmission: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="mr-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (₩) *</label>
                  <input type="number" value={vehicleForm.dailyRate} onChange={(e) => setVehicleForm({ ...vehicleForm, dailyRate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 80000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                  <input type="number" value={vehicleForm.seatCount} onChange={(e) => setVehicleForm({ ...vehicleForm, seatCount: parseInt(e.target.value) || 5 })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={vehicleForm.status} onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_REQUEST">On Request</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={vehicleForm.description} onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" rows={2} placeholder="Short description of the vehicle..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
                <input type="text" value={vehicleForm.features} onChange={(e) => setVehicleForm({ ...vehicleForm, features: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Bluetooth, Leather Seats, AWD" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
                <div className="flex mb-2">
                  <input
                    id="photoUrlInput"
                    type="url"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mr-2"
                    placeholder="Paste image URL and press Add"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("photoUrlInput") as HTMLInputElement;
                      const url = input?.value?.trim();
                      if (!url) return;
                      const existing = JSON.parse(vehicleForm.photos || "[]");
                      setVehicleForm({ ...vehicleForm, photos: JSON.stringify([...existing, url]) });
                      input.value = "";
                    }}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                  >
                    Add
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    const resizeImage = (file: File): Promise<string> =>
                      new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement("canvas");
                            const MAX = 800;
                            let w = img.width;
                            let h = img.height;
                            if (w > MAX || h > MAX) {
                              if (w > h) { h = Math.round((h * MAX) / w); w = MAX; }
                              else { w = Math.round((w * MAX) / h); h = MAX; }
                            }
                            canvas.width = w;
                            canvas.height = h;
                            canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
                            resolve(canvas.toDataURL("image/jpeg", 0.7));
                          };
                          img.src = ev.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      });
                    const existing = JSON.parse(vehicleForm.photos || "[]");
                    const newPhotos: string[] = [];
                    for (let i = 0; i < files.length; i++) {
                      const dataUrl = await resizeImage(files[i]);
                      newPhotos.push(dataUrl);
                    }
                    setVehicleForm({ ...vehicleForm, photos: JSON.stringify([...existing, ...newPhotos]) });
                    e.target.value = "";
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {(() => {
                  const photos: string[] = JSON.parse(vehicleForm.photos || "[]");
                  if (photos.length === 0) return null;
                  return (
                    <div className="flex flex-wrap mt-2">
                      {photos.map((url, i) => (
                        <div key={i} className={`relative w-16 h-16 rounded-lg overflow-hidden border group ${i < photos.length - 1 ? "mr-2" : ""}`}>
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { const updated = photos.filter((_, j) => j !== i); setVehicleForm({ ...vehicleForm, photos: JSON.stringify(updated) }); }} className="absolute top-0 right-0 bg-red-600 text-white rounded-bl-lg px-1 text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <div className="flex pt-4">
                <button onClick={handleSaveVehicle} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mr-3">
                  {editingVehicleId ? "Save Changes" : "Add Vehicle"}
                </button>
                <button onClick={() => setShowVehicleModal(false)} className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {showPkgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingPkgId ? "Edit Package" : "Add Package"}</h2>
              <button onClick={() => setShowPkgModal(false)}><X className="h-6 w-6 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
                <input type="text" value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Weekend Special" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days) *</label>
                <input type="number" value={pkgForm.durationDays} onChange={(e) => setPkgForm({ ...pkgForm, durationDays: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 3" min="1" />
              </div>
              <div className="flex pt-4">
                <button onClick={handleSavePackage} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mr-3">
                  {editingPkgId ? "Save Changes" : "Add Package"}
                </button>
                <button onClick={() => setShowPkgModal(false)} className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle-Packages Assignment Modal */}
      {showVehiclePkgModal && vehiclePkgTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Manage Packages</h2>
                <p className="text-sm text-gray-500">{vehiclePkgTarget.modelName}</p>
              </div>
              <button onClick={() => setShowVehiclePkgModal(false)}><X className="h-6 w-6 text-gray-400 hover:text-gray-700" /></button>
            </div>

            <div className="space-y-3 mb-6">
              {vehiclePkgTarget.packageRates.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No packages assigned yet. Add one below.</p>
              )}
              {vehiclePkgTarget.packageRates.map((pr) => (
                <div key={pr.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 mr-3">
                    <p className="font-medium text-sm">{pr.package.name}</p>
                    <p className="text-xs text-gray-500">{pr.package.durationDays} day(s)</p>
                  </div>
                  <div className="flex items-center mr-3">
                    <span className="text-xs text-gray-500 mr-2">₩</span>
                    <input
                      type="number"
                      value={vehiclePkgRates[pr.package.id] || ""}
                      onChange={(e) => setVehiclePkgRates({ ...vehiclePkgRates, [pr.package.id]: e.target.value })}
                      className="w-28 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="price"
                    />
                  </div>
                  <button
                    onClick={() => setVehiclePkgRates((prev) => { const n = { ...prev }; delete n[pr.package.id]; return n; })}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {(() => {
              const unassigned = packages.filter((p) => p.isActive && !vehiclePkgTarget!.packageRates.some((pr) => pr.package.id === p.id) && !vehiclePkgRates[p.id]);
              if (unassigned.length === 0) return null;
              return (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Add a package to this vehicle:</p>
                  <div className="flex items-end">
                    <div className="flex-1 mr-2">
                      <select value={newPkgId} onChange={(e) => setNewPkgId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        {unassigned.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.durationDays}d)</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-28 mr-2">
                      <input
                        type="number"
                        value={newPkgPrice}
                        onChange={(e) => setNewPkgPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="₩ price"
                      />
                    </div>
                    <button
                      onClick={handleAddPackageToVehicle}
                      disabled={!newPkgId || !newPkgPrice}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="flex pt-6">
              <button onClick={handleSaveVehiclePackages} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mr-3">
                Save
              </button>
              <button onClick={() => setShowVehiclePkgModal(false)} className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
