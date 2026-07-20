"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Car, LogOut, Shield, LayoutDashboard } from "lucide-react";
import { logoutAction } from "@/lib/actions";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = session?.user && (session.user as { role: string }).role === "ADMIN";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Hansol Car Rental
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/vehicles" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Fleet
            </Link>

            {!isAdmin && (
              <Link href="/booking" className="text-gray-600 hover:text-blue-600 font-medium transition">
                Book Now
              </Link>
            )}

            {session?.user ? (
              <>
                {!isAdmin && (
                  <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">
                    My Bookings
                  </Link>
                )}

                {isAdmin && (
                  <Link href="/admin" className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1 transition">
                    <LayoutDashboard className="h-4 w-4" /> Admin
                  </Link>
                )}

                <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800 leading-tight">{session.user.name}</span>
                      {isAdmin && (
                        <span className="text-[10px] text-blue-600 font-semibold leading-tight flex items-center gap-0.5">
                          <Shield className="h-2.5 w-2.5" /> Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => logoutAction()} className="text-gray-400 hover:text-red-600 transition p-1" title="Logout">
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition">
                  Register
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden flex items-center" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-3">
            <Link href="/vehicles" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>
              Fleet
            </Link>
            {!isAdmin && (
              <Link href="/booking" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>
                Book Now
              </Link>
            )}
            {session?.user ? (
              <>
                <div className="flex items-center gap-2 py-2 border-t border-gray-100">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                  </div>
                </div>
                {!isAdmin && (
                  <Link href="/dashboard" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>
                    My Bookings
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { setMenuOpen(false); logoutAction(); }} className="text-red-600 hover:text-red-700 font-medium">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
