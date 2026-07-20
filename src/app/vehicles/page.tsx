"use client";

import { useEffect, useState } from "react";
import { Car, Users, Settings2 } from "lucide-react";
import VehicleDetailModal from "@/components/VehicleDetailModal";

type PackageRate = {
  id: string;
  price: number;
  package: {
    id: string;
    name: string;
    durationDays: number;
  };
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

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => r.json())
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "ALL" ? vehicles : vehicles.filter((v) => v.type === filter);

  const statusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Available</span>;
      case "ON_REQUEST":
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">On Request</span>;
      case "MAINTENANCE":
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Maintenance</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Our Fleet</h1>

      <div className="flex gap-3 mb-8">
        {["ALL", "Sedan", "SUV", "Van"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              filter === t
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:border-blue-600"
            }`}
          >
            {t === "ALL" ? "All Vehicles" : t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading vehicles...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No vehicles found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {(() => {
                  let thumbUrl = v.imageUrl;
                  try {
                    if (v.photos) {
                      const arr = JSON.parse(v.photos);
                      if (Array.isArray(arr) && arr.length > 0) thumbUrl = arr[0];
                    }
                  } catch { /* ignore */ }
                  return thumbUrl ? (
                    <img src={thumbUrl} alt={v.modelName} className="w-full h-full object-cover" />
                  ) : (
                    <Car className="h-16 w-16 text-gray-400" />
                  );
                })()}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold">{v.modelName}</h3>
                  {statusBadge(v.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Car className="h-4 w-4" /> {v.type}</span>
                  <span className="flex items-center gap-1"><Settings2 className="h-4 w-4" /> {v.transmission}</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {v.seatCount} seats</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold text-blue-600">₩{v.dailyRate.toLocaleString()}/day</p>
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    View Details
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVehicle && (
        <VehicleDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      )}
    </div>
  );
}
