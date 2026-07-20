"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Package,
  Car,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";

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
  packageRates: PackageRate[];
};

type AccessoryOption = {
  name: string;
  price: number;
  checked: boolean;
};

const ACCESSORY_OPTIONS: AccessoryOption[] = [
  { name: "English GPS", price: 5000, checked: false },
  { name: "Hi-Pass Toll", price: 3000, checked: false },
  { name: "Baby Seat (0-2yr)", price: 10000, checked: false },
  { name: "Child Seat (2-6yr)", price: 8000, checked: false },
  { name: "Winter Chains", price: 5000, checked: false },
];

function getVehicleThumb(v: { imageUrl: string | null; photos: string | null }): string | null {
  try {
    if (v.photos) {
      const arr = JSON.parse(v.photos);
      if (Array.isArray(arr) && arr.length > 0) return arr[0];
    }
  } catch { /* ignore */ }
  return v.imageUrl;
}

function BookingWizard() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVehicle = searchParams.get("vehicle");
  const preselectedPackageId = searchParams.get("packageId");

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [rentalType, setRentalType] = useState<"SELF_DRIVE" | "WITH_DRIVER">("SELF_DRIVE");
  const [pickupType, setPickupType] = useState<"GARAGE" | "SERVICE">("GARAGE");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [pickupDatetime, setPickupDatetime] = useState("");
  const [dropoffDatetime, setDropoffDatetime] = useState("");

  const [accessories, setAccessories] = useState<AccessoryOption[]>(ACCESSORY_OPTIONS);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(preselectedVehicle || "");
  const [selectedPackageRateId, setSelectedPackageRateId] = useState<string | null>(preselectedPackageId);
  const [isDailyRate, setIsDailyRate] = useState(!preselectedPackageId);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestWhatsapp, setGuestWhatsapp] = useState("");
  const [hasIdp, setHasIdp] = useState(false);

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendSuggestion, setExtendSuggestion] = useState<{ extraDays: number; newTotal: number; pkg: PackageRate } | null>(null);

  useEffect(() => {
    fetch("/api/vehicles").then((r) => r.json()).then((data) => setVehicles(data));
  }, []);

  useEffect(() => {
    if (session?.user) {
      setGuestName(session.user.name || "");
      setGuestEmail(session.user.email || "");
    }
  }, [session]);

  const toggleAccessory = (index: number) => {
    setAccessories((prev) =>
      prev.map((a, i) => (i === index ? { ...a, checked: !a.checked } : a))
    );
  };

  const selectedV = vehicles.find((v) => v.id === selectedVehicle);

  const calculateDays = () => {
    if (!pickupDatetime || !dropoffDatetime) return 0;
    const diff = new Date(dropoffDatetime).getTime() - new Date(pickupDatetime).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const rentalDays = calculateDays();

  const getMatchingPackages = (): { exact: PackageRate[]; shorter: PackageRate[]; longer: PackageRate[] } => {
    if (!selectedV || rentalDays === 0) return { exact: [], shorter: [], longer: [] };

    const exact: PackageRate[] = [];
    const shorter: PackageRate[] = [];
    const longer: PackageRate[] = [];

    for (const pr of selectedV.packageRates) {
      if (pr.package.durationDays === rentalDays) {
        exact.push(pr);
      } else if (pr.package.durationDays < rentalDays) {
        shorter.push(pr);
      } else {
        longer.push(pr);
      }
    }

    return { exact, shorter, longer };
  };

  const getSelectedPackageRate = (): PackageRate | undefined => {
    if (!selectedV || !selectedPackageRateId || isDailyRate) return undefined;
    return selectedV.packageRates.find((pr) => pr.id === selectedPackageRateId);
  };

  const calculateVehicleCost = (): { total: number; breakdown: string } => {
    if (!selectedV) return { total: 0, breakdown: "" };

    if (isDailyRate) {
      const total = selectedV.dailyRate * rentalDays;
      return { total, breakdown: `₩${selectedV.dailyRate.toLocaleString()} × ${rentalDays} days` };
    }

    const pkg = getSelectedPackageRate();
    if (!pkg) {
      const total = selectedV.dailyRate * rentalDays;
      return { total, breakdown: `₩${selectedV.dailyRate.toLocaleString()} × ${rentalDays} days` };
    }

    if (pkg.package.durationDays === rentalDays) {
      return { total: pkg.price, breakdown: `${pkg.package.name} (flat rate)` };
    }

    if (pkg.package.durationDays < rentalDays) {
      const remainingDays = rentalDays - pkg.package.durationDays;
      const dailyCost = selectedV.dailyRate * remainingDays;
      const total = pkg.price + dailyCost;
      return {
        total,
        breakdown: `${pkg.package.name} (₩${pkg.price.toLocaleString()}) + ${remainingDays} extra day(s) × ₩${selectedV.dailyRate.toLocaleString()}`,
      };
    }

    const total = selectedV.dailyRate * rentalDays;
    return { total, breakdown: `₩${selectedV.dailyRate.toLocaleString()} × ${rentalDays} days` };
  };

  const calculateTotal = () => {
    const { total: vehicleCost } = calculateVehicleCost();
    const accessoryCost = accessories.filter((a) => a.checked).reduce((sum, a) => sum + a.price, 0);
    return vehicleCost + accessoryCost;
  };

  const getSelectedPackageLabel = (): string => {
    if (isDailyRate) return "Daily Rate";
    const pkg = getSelectedPackageRate();
    return pkg ? pkg.package.name : "Daily Rate";
  };

  const handleSelectPackage = (pr: PackageRate | null) => {
    if (!pr) {
      setIsDailyRate(true);
      setSelectedPackageRateId(null);
      return;
    }

    if (pr.package.durationDays > rentalDays) {
      const extraDays = pr.package.durationDays - rentalDays;
      setExtendSuggestion({ extraDays, newTotal: pr.package.durationDays, pkg: pr });
      setShowExtendModal(true);
      return;
    }

    setIsDailyRate(false);
    setSelectedPackageRateId(pr.id);
  };

  const handleExtendDates = () => {
    if (!extendSuggestion || !pickupDatetime) return;
    const pickup = new Date(pickupDatetime);
    const newDropoff = new Date(pickup.getTime() + extendSuggestion.newTotal * 24 * 60 * 60 * 1000);
    setDropoffDatetime(newDropoff.toISOString().slice(0, 16));
    setIsDailyRate(false);
    setSelectedPackageRateId(extendSuggestion.pkg.id);
    setShowExtendModal(false);
    setExtendSuggestion(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          rentalType,
          pickupType,
          pickupLocation: pickupLocation || null,
          dropoffLocation: dropoffLocation || null,
          pickupDatetime,
          dropoffDatetime,
          flightNumber: flightNumber || null,
          accessories: accessories.filter((a) => a.checked).map((a) => ({ name: a.name, price: a.price })),
          guestName: session?.user ? null : guestName,
          guestEmail: session?.user ? null : guestEmail,
          guestPhone: session?.user ? null : guestPhone,
          guestWhatsappId: guestWhatsapp || null,
          hasIdp,
          selectedPackageId: isDailyRate ? null : selectedPackageRateId,
          totalEstimatedPrice: calculateTotal(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit booking");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10">
          <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-800 mb-4">Booking Request Submitted!</h1>
          <p className="text-green-700 mb-6">
            We&apos;ve received your booking request and sent you a confirmation email. Our team will review and confirm shortly.
          </p>
          <button onClick={() => router.push("/dashboard")} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { label: "Logistics", icon: MapPin },
    { label: "Extras", icon: Package },
    { label: "Vehicle", icon: Car },
    { label: "Checkout", icon: ClipboardCheck },
  ];

  const { exact: exactPackages, shorter: shorterPackages, longer: longerPackages } = getMatchingPackages();
  const { total: vehicleCostTotal, breakdown: vehicleBreakdown } = calculateVehicleCost();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Book Your Car</h1>

      <div className="flex items-center justify-center mb-10">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${
                step === i + 1 ? "bg-blue-600 text-white"
                  : step > i + 1 ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > i + 1 ? <Check className="h-4 w-4 mr-2" /> : <s.icon className="h-4 w-4 mr-2" />}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="h-5 w-5 text-gray-400 mx-1" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Rental Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rental Type</label>
              <div className="grid grid-cols-2">
                <button onClick={() => setRentalType("SELF_DRIVE")} className={`p-4 rounded-xl border-2 text-left transition mr-3 ${rentalType === "SELF_DRIVE" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-400"}`}>
                  <p className="font-semibold">Self-Drive</p>
                  <p className="text-sm text-gray-500">You drive with IDP</p>
                </button>
                <button onClick={() => setRentalType("WITH_DRIVER")} className={`p-4 rounded-xl border-2 text-left transition ${rentalType === "WITH_DRIVER" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-400"}`}>
                  <p className="font-semibold">With Driver</p>
                  <p className="text-sm text-gray-500">Professional driver included</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Method</label>
              <div className="grid grid-cols-2">
                <button onClick={() => setPickupType("GARAGE")} className={`p-4 rounded-xl border-2 text-left transition mr-3 ${pickupType === "GARAGE" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-400"}`}>
                  <p className="font-semibold">Garage Collection</p>
                  <p className="text-sm text-gray-500">Pick up at our location</p>
                </button>
                <button onClick={() => setPickupType("SERVICE")} className={`p-4 rounded-xl border-2 text-left transition ${pickupType === "SERVICE" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-400"}`}>
                  <p className="font-semibold">Pick-up / Drop-off</p>
                  <p className="text-sm text-gray-500">Airport or hotel delivery</p>
                </button>
              </div>
            </div>

            {pickupType === "SERVICE" && (
              <div className="grid md:grid-cols-2">
                <div className="mb-4 mr-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                  <input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Incheon Airport T1" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drop-off Location</label>
                  <input type="text" value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Gimpo Airport" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number (optional)</label>
                  <input type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. KE123" />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2">
              <div className="mr-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date & Time</label>
                <input type="datetime-local" value={pickupDatetime} onChange={(e) => setPickupDatetime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drop-off Date & Time</label>
                <input type="datetime-local" value={dropoffDatetime} onChange={(e) => setDropoffDatetime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            {rentalDays > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-blue-700 font-semibold">You selected {rentalDays} day(s) for rental</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Optional Extras</h2>
            <p className="text-gray-500 mb-4">Enhance your rental experience with these add-ons.</p>
            <div className="space-y-3">
              {accessories.map((acc, i) => (
                <label key={acc.name} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${acc.checked ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-400"}`}>
                  <div className="flex items-center">
                    <input type="checkbox" checked={acc.checked} onChange={() => toggleAccessory(i)} className="h-5 w-5 text-blue-600 rounded mr-3" />
                    <span className="font-medium">{acc.name}</span>
                  </div>
                  <span className="text-gray-600">+₩{acc.price.toLocaleString()}/rental</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Select Vehicle & Package</h2>
              {rentalDays > 0 && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {rentalDays} day(s) selected
                </span>
              )}
            </div>

            {!selectedVehicle && (
              <div className="grid">
                {vehicles.map((v) => (
                  <button key={v.id} onClick={() => setSelectedVehicle(v.id)} className={`flex items-center p-4 rounded-xl border-2 text-left transition mb-4 last:mb-0 ${selectedVehicle === v.id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-400"}`}>
                    <div className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                      {getVehicleThumb(v) ? (
                        <img src={getVehicleThumb(v)!} alt={v.modelName} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Car className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{v.modelName}</p>
                          <p className="text-sm text-gray-500">{v.type} · {v.transmission} · {v.seatCount} seats</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">₩{v.dailyRate.toLocaleString()}/day</p>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${v.status === "AVAILABLE" ? "bg-green-100 text-green-700" : v.status === "ON_REQUEST" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {v.status === "AVAILABLE" ? "Available" : v.status === "ON_REQUEST" ? "On Request" : "Maintenance"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {vehicles.length === 0 && <p className="text-gray-500 text-center py-8">No vehicles available.</p>}
              </div>
            )}

            {selectedVehicle && selectedV && (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    {getVehicleThumb(selectedV) ? (
                      <img src={getVehicleThumb(selectedV)!} alt={selectedV.modelName} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Car className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="mr-4">
                    <p className="font-bold">{selectedV.modelName}</p>
                    <p className="text-sm text-gray-500">{selectedV.type} · {selectedV.transmission} · {selectedV.seatCount} seats</p>
                  </div>
                  <button onClick={() => { setSelectedVehicle(""); setSelectedPackageRateId(null); setIsDailyRate(true); }} className="ml-auto text-sm text-blue-600 hover:underline">Change</button>
                </div>

                {/* Daily Rate */}
                <button
                  onClick={() => handleSelectPackage(null)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${isDailyRate ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">Daily Rate</p>
                      <p className="text-sm text-gray-500">Pay per day · No package commitment</p>
                    </div>
                    <p className="text-lg font-bold text-blue-600">₩{selectedV.dailyRate.toLocaleString()}/day</p>
                  </div>
                </button>

                {/* Exact match packages */}
                {exactPackages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-2">Perfect match for {rentalDays} days:</p>
                    {exactPackages.map((pr) => (
                      <button
                        key={pr.id}
                        onClick={() => handleSelectPackage(pr)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition mb-2 ${selectedPackageRateId === pr.id ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold">{pr.package.name}</p>
                            <p className="text-sm text-gray-500">Flat rate for {pr.package.durationDays} days</p>
                            {selectedV.dailyRate * pr.package.durationDays - pr.price > 0 && (
                              <p className="text-sm text-green-600 font-medium">Save ₩{(selectedV.dailyRate * pr.package.durationDays - pr.price).toLocaleString()}</p>
                            )}
                          </div>
                          <p className="text-lg font-bold text-green-600">₩{pr.price.toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Shorter packages (partial match) */}
                {shorterPackages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Partial packages (package + extra days at daily rate):</p>
                    {shorterPackages.map((pr) => {
                      const remainingDays = rentalDays - pr.package.durationDays;
                      const remainingCost = selectedV.dailyRate * remainingDays;
                      const totalCost = pr.price + remainingCost;
                      return (
                        <button
                          key={pr.id}
                          onClick={() => handleSelectPackage(pr)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition mb-2 ${selectedPackageRateId === pr.id ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold">{pr.package.name} + {remainingDays} extra day(s)</p>
                              <p className="text-sm text-gray-500">
                                ₩{pr.package.name}: ₩{pr.price.toLocaleString()} + {remainingDays} day(s): ₩{remainingCost.toLocaleString()}
                              </p>
                            </div>
                            <p className="text-lg font-bold text-purple-600">₩{totalCost.toLocaleString()}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Longer packages - show with extend suggestion */}
                {longerPackages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-amber-600 mb-2">Extend your rental to unlock these packages:</p>
                    {longerPackages.map((pr) => {
                      const extraDays = pr.package.durationDays - rentalDays;
                      return (
                        <button
                          key={pr.id}
                          onClick={() => handleSelectPackage(pr)}
                          className="w-full p-4 rounded-xl border-2 border-amber-200 hover:border-amber-400 text-left transition mb-2 bg-amber-50"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold">{pr.package.name}</p>
                              <p className="text-sm text-amber-700">Requires {pr.package.durationDays} days — extend by {extraDays} day(s)</p>
                            </div>
                            <p className="text-lg font-bold text-amber-600">₩{pr.price.toLocaleString()}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>

            {selectedV && (
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h3 className="font-semibold mb-3">Booking Summary</h3>
                <div className="grid grid-cols-2 text-sm">
                  <p className="text-gray-500">Vehicle:</p>
                  <p className="font-medium">{selectedV.modelName}</p>
                  <p className="text-gray-500">Package:</p>
                  <p className="font-medium">{getSelectedPackageLabel()}</p>
                  <p className="text-gray-500">Type:</p>
                  <p className="font-medium">{rentalType === "SELF_DRIVE" ? "Self-Drive" : "With Driver"}</p>
                  <p className="text-gray-500">Pickup:</p>
                  <p className="font-medium">{pickupType === "GARAGE" ? "Garage Collection" : "Pick-up/Drop-off Service"}</p>
                  <p className="text-gray-500">Dates:</p>
                  <p className="font-medium">
                    {pickupDatetime ? new Date(pickupDatetime).toLocaleDateString() : ""} → {dropoffDatetime ? new Date(dropoffDatetime).toLocaleDateString() : ""}
                  </p>
                  <p className="text-gray-500">Duration:</p>
                  <p className="font-medium">{rentalDays} day(s)</p>
                  <p className="text-gray-500">Vehicle Cost:</p>
                  <p className="font-medium">{vehicleBreakdown} = ₩{vehicleCostTotal.toLocaleString()}</p>
                  <p className="text-gray-500">Accessories:</p>
                  <p className="font-medium">{accessories.filter((a) => a.checked).map((a) => a.name).join(", ") || "None"}</p>
                  <p className="text-gray-500 font-bold">Estimated Total:</p>
                  <p className="font-bold text-blue-600 text-lg">₩{calculateTotal().toLocaleString()}</p>
                </div>
              </div>
            )}

            {!session?.user && (
              <div className="space-y-4">
                <h3 className="font-semibold">Your Information</h3>
                <div className="grid md:grid-cols-2">
                  <div className="mb-4 mr-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="mb-4 mr-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / KakaoTalk ID</label>
                    <input type="text" value={guestWhatsapp} onChange={(e) => setGuestWhatsapp(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {session?.user && (
              <div className="space-y-4">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="grid md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / KakaoTalk ID</label>
                    <input type="text" value={guestWhatsapp} onChange={(e) => setGuestWhatsapp(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {rentalType === "SELF_DRIVE" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <label className="flex items-start cursor-pointer">
                  <input type="checkbox" checked={hasIdp} onChange={(e) => setHasIdp(e.target.checked)} className="h-5 w-5 text-blue-600 rounded mt-0.5 mr-3" />
                  <div>
                    <p className="font-semibold text-amber-800">International Driving Permit (IDP) Required</p>
                    <p className="text-sm text-amber-700 mt-1">
                      I confirm that I hold a valid International Driving Permit (Type B) and will present it upon vehicle pickup. Self-drive rental is not permitted without a valid IDP.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
              <ChevronLeft className="h-5 w-5 mr-2" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && (!pickupDatetime || !dropoffDatetime)) || (step === 3 && !selectedVehicle)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedVehicle || !pickupDatetime || !dropoffDatetime || (rentalType === "SELF_DRIVE" && !hasIdp) || (!session?.user && (!guestName || !guestEmail || !guestPhone))}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Confirm Booking Request"}
            </button>
          )}
        </div>
      </div>

      {/* Extend Dates Modal */}
      {showExtendModal && extendSuggestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Extend Your Rental</h3>
              <button onClick={() => { setShowExtendModal(false); setExtendSuggestion(null); }}>
                <X className="h-6 w-6 text-gray-400 hover:text-gray-700" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0 mr-3" />
                <div>
                  <p className="font-semibold text-amber-800">Package requires {extendSuggestion.newTotal} days</p>
                  <p className="text-sm text-amber-700 mt-1">
                    You selected {rentalDays} day(s). The <strong>{extendSuggestion.pkg.package.name}</strong> requires {extendSuggestion.newTotal} days minimum.
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Would you like to extend your rental by <strong>{extendSuggestion.extraDays} day(s)</strong> to use this package?
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Package Price:</span>
                <span className="font-bold">₩{extendSuggestion.pkg.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Savings vs Daily:</span>
                <span className="font-bold text-green-600">
                  Save ₩{(selectedV ? selectedV.dailyRate * extendSuggestion.newTotal - extendSuggestion.pkg.price : 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex">
              <button
                onClick={handleExtendDates}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mr-3"
              >
                Extend & Book Package
              </button>
              <button
                onClick={() => { setShowExtendModal(false); setExtendSuggestion(null); }}
                className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Keep Dates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-500">Loading booking form...</div>}>
      <BookingWizard />
    </Suspense>
  );
}
