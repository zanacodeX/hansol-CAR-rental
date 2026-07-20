"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Car, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl">
        {/* Left branding panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full" />
            <div className="absolute bottom-20 right-10 w-60 h-60 border border-white rounded-full" />
            <div className="absolute top-1/2 left-1/3 w-20 h-20 border border-white rounded-full" />
          </div>
          <div className="relative">
            <div className="flex items-center mb-8">
              <div className="bg-white/20 rounded-xl p-3 mr-3">
                <Car className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Hansol Car Rental</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Welcome Back<br />to Your Journey
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Sign in to manage your bookings, explore our premium fleet, and enjoy seamless car rental experiences.
            </p>
          </div>
          <div className="relative flex">
            <div className="bg-white/10 rounded-xl px-5 py-3 mr-6">
              <p className="text-white font-bold text-xl">9+</p>
              <p className="text-blue-200 text-sm">Premium Vehicles</p>
            </div>
            <div className="bg-white/10 rounded-xl px-5 py-3 mr-6">
              <p className="text-white font-bold text-xl">24/7</p>
              <p className="text-blue-200 text-sm">Support</p>
            </div>
            <div className="bg-white/10 rounded-xl px-5 py-3">
              <p className="text-white font-bold text-xl">100%</p>
              <p className="text-blue-200 text-sm">Satisfaction</p>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="w-full lg:w-1/2 bg-white p-8 sm:p-12">
          <div className="mb-8">
            <div className="flex items-center mb-6 lg:hidden">
              <Car className="h-7 w-7 text-blue-600 mr-2" />
              <span className="text-lg font-bold text-gray-900">Hansol</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-500">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition text-gray-900 placeholder:text-gray-400"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-12 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center text-lg"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><span className="mr-2">Sign In</span> <ArrowRight className="h-5 w-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Demo: admin@hansol.com / admin123 or user@hansol.com / user123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
