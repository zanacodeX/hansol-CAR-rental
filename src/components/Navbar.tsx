"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Car, LogOut, Shield, LayoutDashboard } from "lucide-react";

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

  const navBg = isTransparent ? "bg-gray-900" : "bg-white shadow-md";
  const linkColor = isTransparent ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-blue-600";
  const brandColor = isTransparent ? "text-white" : "text-gray-900";
  const iconColor = isTransparent ? "text-blue-400" : "text-blue-600";

  return (
    <nav className={`${navBg} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Car className={`h-7 w-7 sm:h-8 sm:w-8 ${iconColor}`} />
              <span className={`text-lg sm:text-xl font-bold ${brandColor}`}>Hansol Car Rental</span>
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5">
            <Link href="/" className={`${linkColor} font-medium text-sm transition`}>Home</Link>
            <Link href="/about" className={`${linkColor} font-medium text-sm transition`}>About</Link>
            <Link href="/vehicles" className={`${linkColor} font-medium text-sm transition`}>Fleet</Link>
            <Link href="/contact" className={`${linkColor} font-medium text-sm transition`}>Contact</Link>
            {!isAdmin && (
              <Link href="/booking" className={`${linkColor} font-medium text-sm transition`}>Book Now</Link>
            )}
            {session?.user ? (
              <>
                {!isAdmin && (
                  <Link href="/dashboard" className={`${linkColor} font-medium text-sm transition`}>My Bookings</Link>
                )}
                {isAdmin && (
                  <Link href="/admin" className={`${linkColor} font-medium text-sm flex items-center gap-1 transition`}>
                    <LayoutDashboard className="h-4 w-4" /> Admin
                  </Link>
                )}
                <div className={`flex items-center gap-2 ml-1 pl-3 border-l ${isTransparent ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold leading-tight ${isTransparent ? "text-white" : "text-gray-800"}`}>{session.user.name}</span>
                    {isAdmin && (
                      <span className="text-[10px] text-blue-400 font-semibold leading-tight flex items-center gap-0.5">
                        <Shield className="h-2.5 w-2.5" /> Admin
                      </span>
                    )}
                  </div>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className={`${isTransparent ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-red-600"} transition p-1`} title="Logout">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className={`${linkColor} font-medium text-sm transition`}>Login</Link>
                <Link href="/register" className={`px-4 py-2 rounded-lg font-medium text-sm transition ${isTransparent ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}>Register</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className={`h-6 w-6 ${isTransparent ? "text-white" : "text-gray-900"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isTransparent ? "text-white" : "text-gray-900"}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {[
              { href: "/", label: "Home" },
              { href: "/about", label: "About" },
              { href: "/vehicles", label: "Fleet" },
              { href: "/contact", label: "Contact" },
              ...(!isAdmin ? [{ href: "/booking", label: "Book Now" }] : []),
            ].map((link) => (
              <Link key={link.href} href={link.href} className="block py-2.5 px-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}

            {session?.user ? (
              <>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{session.user.name}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>
                  </div>
                  {!isAdmin && (
                    <Link href="/dashboard" className="block py-2.5 px-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm" onClick={() => setMenuOpen(false)}>
                      My Bookings
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" className="block py-2.5 px-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm" onClick={() => setMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="block w-full text-left py-2.5 px-3 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <Link href="/login" className="block py-2.5 px-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link href="/register" className="block py-2.5 px-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm" onClick={() => setMenuOpen(false)}>Register</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
