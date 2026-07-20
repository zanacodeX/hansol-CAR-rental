"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Car, Users, Settings2, Check, ChevronLeft, ChevronRight, Camera } from "lucide-react";

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

type Props = {
  vehicle: Vehicle;
  onClose: () => void;
};

function getPhotoUrls(v: Vehicle): string[] {
  const list: string[] = [];
  try {
    if (v.photos) {
      const arr = JSON.parse(v.photos);
      if (Array.isArray(arr)) list.push(...arr);
    }
  } catch { /* ignore */ }
  if (v.imageUrl && !list.includes(v.imageUrl)) list.push(v.imageUrl);
  return list;
}

export default function VehicleDetailModal({ vehicle, onClose }: Props) {
  const router = useRouter();
  const photos = getPhotoUrls(vehicle);
  const [photoIdx, setPhotoIdx] = useState(0);

  const featuresList = vehicle.features
    ? vehicle.features.split(",").map((f) => f.trim()).filter(Boolean)
    : [];

  const sortedPackages = [...vehicle.packageRates].sort((a, b) => a.package.durationDays - b.package.durationDays);

  const handleBook = (pkgId: string | null) => {
    if (pkgId) {
      router.push(`/booking?vehicle=${vehicle.id}&packageId=${pkgId}`);
    } else {
      router.push(`/booking?vehicle=${vehicle.id}`);
    }
    onClose();
  };

  const statusBadge = () => {
    switch (vehicle.status) {
      case "AVAILABLE":
        return <span className="bg-green-500 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">Available</span>;
      case "ON_REQUEST":
        return <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">On Request</span>;
      case "MAINTENANCE":
        return <span className="bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">Maintenance</span>;
      default:
        return null;
    }
  };

  const prevPhoto = () => setPhotoIdx((i) => (i === 0 ? photos.length - 1 : i - 1));
  const nextPhoto = () => setPhotoIdx((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] sm:max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo gallery */}
        <div className="relative h-64 sm:h-80 bg-gray-100 rounded-t-2xl overflow-hidden">
          {photos.length > 0 ? (
            <>
              <img
                src={photos[photoIdx]}
                alt={`${vehicle.modelName} photo ${photoIdx + 1}`}
                className="w-full h-full object-cover"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIdx(i)}
                        className={`w-2 h-2 rounded-full transition ${i === photoIdx ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Camera className="h-3 w-3" /> {photoIdx + 1}/{photos.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Car className="h-20 w-20 text-gray-300" />
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition">
            <X className="h-5 w-5" />
          </button>
          <div className="absolute top-3 left-3">{statusBadge()}</div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{vehicle.modelName}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Car className="h-4 w-4" /> {vehicle.type}</span>
              <span className="flex items-center gap-1"><Settings2 className="h-4 w-4" /> {vehicle.transmission}</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {vehicle.seatCount} seats</span>
            </div>
          </div>

          {vehicle.description && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{vehicle.description}</p>
          )}

          {/* Features */}
          {featuresList.length > 0 && (
            <div className="mb-5">
              <h3 className="font-semibold text-sm text-gray-800 mb-2">Features</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {featuresList.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-md px-2 py-1.5">
                    <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packages */}
          <div>
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Rental Packages</h3>

            {/* 3-column grid: Daily + package cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Daily rate card */}
              <div className="rounded-xl border border-gray-200 p-4 flex flex-col items-center text-center hover:border-blue-300 hover:shadow-sm transition">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Daily</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">₩{vehicle.dailyRate.toLocaleString()}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">₩{vehicle.dailyRate.toLocaleString()}/day</p>
                <button
                  onClick={() => handleBook(null)}
                  disabled={vehicle.status === "MAINTENANCE"}
                  className="mt-3 w-full bg-gray-900 text-white py-2 rounded-lg text-xs font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Book Daily
                </button>
              </div>

              {sortedPackages.map((pr, idx) => {
                const perDay = Math.round(pr.price / pr.package.durationDays);
                const savings = vehicle.dailyRate * pr.package.durationDays - pr.price;
                const isBest = idx === sortedPackages.length - 1 && sortedPackages.length > 1;

                return (
                  <div
                    key={pr.id}
                    className={`rounded-xl border p-4 flex flex-col items-center text-center transition relative ${
                      isBest
                        ? "border-emerald-500 bg-emerald-50/60 shadow-sm"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    {isBest && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
                        Best Value
                      </span>
                    )}
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{pr.package.name}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">₩{pr.price.toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">₩{perDay.toLocaleString()}/day</p>
                    {savings > 0 && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        Save ₩{savings.toLocaleString()}
                      </p>
                    )}
                    <button
                      onClick={() => handleBook(pr.package.id)}
                      disabled={vehicle.status === "MAINTENANCE"}
                      className={`mt-3 w-full text-white py-2 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition ${
                        isBest
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      Book {pr.package.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
