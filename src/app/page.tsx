"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Car, MapPin, Shield, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&q=80",
    alt: "Scenic drive through South Korea",
  },
  {
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80",
    alt: "Luxury sedan on the road",
  },
  {
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&q=80",
    alt: "Premium white car",
  },
  {
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1920&q=80",
    alt: "Sports car fleet",
  },
  {
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1920&q=80",
    alt: "Modern SUV lineup",
  },
];

export default function HomePage() {
  const [current, setCurrent] = useState(0);
  const [faded, setFaded] = useState(false);

  const goTo = useCallback((index: number) => {
    setFaded(true);
    setTimeout(() => {
      setCurrent(index);
      setFaded(false);
    }, 400);
  }, []);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div>
      {/* Hero with Slider */}
      <section className="relative h-screen w-full overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
          </div>
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className={`relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 transition-all duration-500 ${faded ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">
            Hansol Car Rental
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-4 font-light">
            Premium car rental service across South Korea
          </p>
          <p className="text-base md:text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Choose from our fleet of sedans, SUVs, and vans. Self-drive with your
            International Driving Permit or let our professional drivers take you
            where you need to go.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/booking"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-xl"
            >
              Book Now
            </Link>
            <Link
              href="/vehicles"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
            >
              View Fleet
            </Link>
          </div>
        </div>

        {/* Slider Controls */}
        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white p-3 rounded-full transition">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white p-3 rounded-full transition">
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === current ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Hansol */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why Choose Hansol?</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            We deliver more than just a car. We deliver a complete travel experience across South Korea.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Car, title: "Modern Fleet", desc: "Well-maintained vehicles from top brands, regularly serviced for your safety." },
              { icon: MapPin, title: "Flexible Pickup", desc: "Pick up at our garage or use our convenient airport pick-up and drop-off service." },
              { icon: Shield, title: "Full Insurance", desc: "Comprehensive insurance coverage options for peace of mind during your trip." },
              { icon: Clock, title: "24/7 Support", desc: "WhatsApp and KakaoTalk support available around the clock." },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl hover:shadow-lg transition border border-gray-100">
                <item.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Fleet</h2>
          <p className="text-gray-500 mb-12 max-w-xl mx-auto">
            From compact sedans to spacious SUVs, find the perfect ride for your Korean adventure.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { type: "Sedan", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=600&q=80", desc: "Fuel-efficient and comfortable for city driving." },
              { type: "SUV", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80", desc: "Spacious and powerful for countryside trips." },
              { type: "Van", image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80", desc: "Perfect for group travel and family vacations." },
            ].map((item) => (
              <div key={item.type} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition group">
                <div className="h-52 overflow-hidden">
                  <img src={item.image} alt={item.type} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{item.type}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.desc}</p>
                  <Link href="/vehicles" className="text-blue-600 font-semibold hover:text-blue-800 text-sm">
                    View {item.type}s →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Hit the Road?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Browse our fleet or start your booking today. No payment gateway needed — pay via bank transfer after confirmation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition inline-block">
              Start Booking
            </Link>
            <Link href="/about" className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition inline-block">
              Learn About Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
