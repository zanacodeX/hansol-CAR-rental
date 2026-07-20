"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminVehiclesRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin"); }, [router]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
