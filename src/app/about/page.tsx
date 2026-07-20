import { Car, Users, Award, Globe, Heart, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Hansol Car Rental",
  description: "Learn about Hansol Car Rental, South Korea's trusted premium car rental service for tourists and locals.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=70" alt="" loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">About Hansol</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Your trusted partner for premium car rental across South Korea since 2020.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Hansol Car Rental was founded with a simple mission: to make exploring South Korea easy, comfortable, and affordable for everyone. Whether you&apos;re a tourist discovering the beauty of Jeju Island, a business traveler navigating Seoul, or a local planning a weekend getaway — we have the perfect vehicle for you.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                What started as a small fleet of 5 cars has grown into a comprehensive rental service with locations across major Korean cities and airports. We pride ourselves on maintaining the newest vehicles, offering competitive rates, and providing personalized service that larger companies can&apos;t match.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our bilingual team speaks English, Korean, and Japanese, ensuring that international travelers feel right at home from the moment they arrive.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&q=75"
                alt="Hansol Car Rental office"
                className="rounded-2xl shadow-xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
                <p className="text-3xl font-bold">5+</p>
                <p className="text-sm text-blue-200">Years of Service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Our Values</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Everything we do is driven by our commitment to excellence.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Safety First", desc: "Every vehicle undergoes rigorous inspection and maintenance. Your safety is our top priority on every journey." },
              { icon: Heart, title: "Customer Care", desc: "We treat every customer like family. From booking to return, our team is here to make your experience seamless." },
              { icon: Award, title: "Quality Fleet", desc: "We invest in the latest models from Hyundai, Kia, and Genesis. Clean, modern, and reliable vehicles every time." },
              { icon: Globe, title: "Tourist Friendly", desc: "English-speaking staff, IDP guidance, GPS navigation, and curated travel tips for exploring Korea." },
              { icon: Users, title: "Professional Drivers", desc: "Need a chauffeur? Our licensed, multilingual drivers know every corner of South Korea." },
              { icon: Car, title: "Flexible Options", desc: "Self-drive or with driver. Airport pickup or garage collection. 3-day or weekly packages — you decide." },
            ].map((item) => (
              <div key={item.title} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                <item.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Happy Customers" },
              { number: "50+", label: "Vehicles" },
              { number: "10K+", label: "Trips Completed" },
              { number: "4.9", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-extrabold mb-2">{stat.number}</p>
                <p className="text-blue-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-gray-500 mb-12 max-w-xl mx-auto">
            A dedicated team of automotive enthusiasts committed to your travel experience.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Jiwon Park", role: "Founder & CEO", initial: "J" },
              { name: "Minjun Kim", role: "Fleet Manager", initial: "M" },
              { name: "Yuna Choi", role: "Customer Relations", initial: "Y" },
            ].map((person) => (
              <div key={person.name} className="p-6">
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  {person.initial}
                </div>
                <h3 className="text-lg font-bold">{person.name}</h3>
                <p className="text-blue-600 text-sm">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
