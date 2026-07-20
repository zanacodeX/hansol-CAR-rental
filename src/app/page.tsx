"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Car, MapPin, Shield, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=75",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=75",
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=75",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=75",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1200&q=75",
];

export default function HomePage() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div>
      {/* Hero Slider */}
      <section className="relative h-[70vh] sm:h-[80vh] md:h-screen w-full overflow-hidden bg-gray-900">
        {slides.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} className="w-full h-full object-cover" />
          </div>
        ))}

        <div className="absolute inset-0 bg-black/40 z-10" />

        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">
            Hansol Car Rental
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-4 font-light">
            Premium car rental service across South Korea
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed px-2">
            Choose from our fleet of sedans, SUVs, and vans. Self-drive with your
            International Driving Permit or let our professional drivers take you
            where you need to go.
          </p>
          <div className="flex flex-col sm:flex-row">
            <Link href="/booking" className="bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-100 transition shadow-xl mb-3 sm:mb-0 sm:mr-4">
              Book Now
            </Link>
            <Link href="/vehicles" className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-white/10 transition">
              View Fleet
            </Link>
          </div>
        </div>

        <button onClick={prev} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 rounded-full transition">
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button onClick={next} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 rounded-full transition">
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ml-2 first:ml-0 transition-all ${i === current ? "bg-white scale-110" : "bg-white/40"}`}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Hansol */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4">Why Choose Hansol?</h2>
          <p className="text-gray-500 text-center mb-8 sm:mb-12 max-w-xl mx-auto text-sm sm:text-base">
            We deliver more than just a car. We deliver a complete travel experience across South Korea.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { icon: Car, title: "Modern Fleet", desc: "Well-maintained vehicles from top brands, regularly serviced for your safety." },
              { icon: MapPin, title: "Flexible Pickup", desc: "Pick up at our garage or use our convenient airport pick-up and drop-off service." },
              { icon: Shield, title: "Full Insurance", desc: "Comprehensive insurance coverage options for peace of mind during your trip." },
              { icon: Clock, title: "24/7 Support", desc: "WhatsApp and KakaoTalk support available around the clock." },
            ].map((item, idx) => (
              <div key={item.title} className={`text-center p-4 sm:p-6 rounded-2xl hover:shadow-lg transition border border-gray-100 ${idx % 2 === 0 ? "pr-2 sm:pr-6" : "pl-2 sm:pl-6"} ${idx < 2 ? "pb-4 sm:pb-6" : "pt-4 sm:pt-6"} md:pb-6 md:pt-6 md:pl-6 md:pr-6`}>
                <item.icon className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Preview */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Our Fleet</h2>
          <p className="text-gray-500 mb-8 sm:mb-12 max-w-xl mx-auto text-sm sm:text-base">
            From compact sedans to spacious SUVs, find the perfect ride for your Korean adventure.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {[
              { type: "Sedan", image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80", desc: "Fuel-efficient and comfortable for city driving." },
              { type: "SUV", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80", desc: "Spacious and powerful for countryside trips." },
              { type: "Van", image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=600&q=80", desc: "Perfect for group travel and family vacations." },
            ].map((item, idx) => (
              <div key={item.type} className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition group mb-4 sm:mb-8 md:mb-0 ${idx === 0 ? "sm:mr-4 md:mr-0" : ""} ${idx === 1 ? "sm:mx-2 md:mx-0" : ""} ${idx === 2 ? "sm:ml-4 md:ml-0" : ""}`}>
                <div className="h-44 sm:h-52 overflow-hidden">
                  <img src={item.image} alt={item.type} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{item.type}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4">{item.desc}</p>
                  <Link href="/vehicles" className="text-blue-600 font-semibold hover:text-blue-800 text-xs sm:text-sm">
                    View {item.type}s →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Ready to Hit the Road?</h2>
          <p className="text-sm sm:text-lg text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Browse our fleet or start your booking today. No payment gateway needed — pay via bank transfer after confirmation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center">
            <Link href="/booking" className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-blue-50 transition inline-block mb-3 sm:mb-0 sm:mr-4">
              Start Booking
            </Link>
            <Link href="/about" className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-white/10 transition inline-block">
              Learn About Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
