"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Car, LogOut, Shield, LayoutDashboard } from "lucide-react";
import { logoutAction } from "@/lib/actions";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isAdmin = session?.user && (session.user as { role: string }).role === "ADMIN";

  const navBg = isTransparent
    ? "bg-black/30 backdrop-blur-sm"
    : "bg-white shadow-md";

  const textColor = isTransparent ? "text-white" : "text-gray-900";
  const linkColor = isTransparent ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-blue-600";
  const brandColor = isTransparent ? "text-white" : "text-gray-900";
  const iconColor = isTransparent ? "text-white" : "text-blue-600";

  return (
    <nav className={`${navBg} sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Car className={`h-8 w-8 ${iconColor} transition-colors`} />
              <span className={`text-xl font-bold ${brandColor} transition-colors`}>
                Hansol Car Rental
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className={`${linkColor} font-medium transition`}>
              Home
            </Link>
            <Link href="/about" className={`${linkColor} font-medium transition`}>
              About
            </Link>
            <Link href="/vehicles" className={`${linkColor} font-medium transition`}>
              Fleet
            </Link>
            <Link href="/contact" className={`${linkColor} font-medium transition`}>
              Contact
            </Link>

            {!isAdmin && (
              <Link href="/booking" className={`${linkColor} font-medium transition`}>
                Book Now
              </Link>
            )}

            {session?.user ? (
              <>
                {!isAdmin && (
                  <Link href="/dashboard" className={`${linkColor} font-medium transition`}>
                    My Bookings
                  </Link>
                )}

                {isAdmin && (
                  <Link href="/admin" className={`${linkColor} font-medium flex items-center gap-1 transition`}>
                    <LayoutDashboard className="h-4 w-4" /> Admin
                  </Link>
                )}

                <div className={`flex items-center gap-3 ml-2 pl-3 border-l ${isTransparent ? "border-white/30" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold leading-tight ${isTransparent ? "text-white" : "text-gray-800"}`}>
                        {session.user.name}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] text-blue-300 font-semibold leading-tight flex items-center gap-0.5">
                          <Shield className="h-2.5 w-2.5" /> Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => logoutAction()} className={`${isTransparent ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-red-600"} transition p-1`} title="Logout">
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className={`${linkColor} font-medium transition`}>
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    isTransparent
                      ? "bg-white text-blue-900 hover:bg-gray-100"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <button className={`md:hidden flex items-center ${textColor}`} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={`md:hidden border-t shadow-lg ${isTransparent ? "bg-black/60 backdrop-blur-sm" : "bg-white"}`}>
          <div className="px-4 py-3 space-y-3">
            <Link href="/" className={`block font-medium ${isTransparent ? "text-white" : "text-gray-600 hover:text-blue-600"}`} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/about" className={`block font-medium ${isTransparent ? "text-white" : "text-gray-600 hover:text-blue-600"}`} onClick={() => setMenuOpen(false)}>
              About
            </Link>
            <Link href="/vehicles" className={`block font-medium ${isTransparent ? "text-white" : "text-gray-600 hover:text-blue-600"}`} onClick={() => setMenuOpen(false)}>
              Fleet
            </Link>
            <Link href="/contact" className={`block font-medium ${isTransparent ? "text-white" : "text-gray-600 hover:text-blue-600"}`} onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
            {!isAdmin && (
              <Link href="/booking" className={`block font-medium ${isTransparent ? "text-white" : "text-gray-600 hover:text-blue-600"}`} onClick={() => setMenuOpen(false)}>
                Book Now
              </Link>
            )}
            {session?.user ? (
              <>
                <div className={`flex items-center gap-2 py-2 border-t ${isTransparent ? "border-white/20" : "border-gray-100"}`}>
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isTransparent ? "text-white" : "text-gray-800"}`}>{session.user.name}</p>
                    <p className={`text-xs ${isTransparent ? "text-white/60" : "text-gray-500"}`}>{session.user.email}</p>
                  </div>
                </div>
                {!isAdmin && (
                  <Link href="/dashboard" className={`block font-medium ${isTransparent ? "text-white" : "text-gray-600 hover:text-blue-600"}`} onClick={() => setMenuOpen(false)}>
                    My Bookings
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin" className={`block font-medium ${isTransparent ? "text-white" : "text-gray-600 hover:text-blue-600"}`} onClick={() => setMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { setMenuOpen(false); logoutAction(); }} className={`${isTransparent ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"} font-medium`}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`block font-medium ${isTransparent ? "text-white" : "text-gray-600 hover:text-blue-600"}`} onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className={`block font-medium ${isTransparent ? "text-white" : "text-gray-600 hover:text-blue-600"}`} onClick={() => setMenuOpen(false)}>
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
