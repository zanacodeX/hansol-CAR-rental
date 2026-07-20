"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=70" alt="" loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Contact Us</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Have a question? We&apos;d love to hear from you. Reach out anytime.
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Info */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Whether you have a question about our fleet, pricing, or need help planning your trip — we&apos;re here to help.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Phone, label: "Phone", value: "+82 10-1234-5678", sub: "Mon–Sun, 8AM–10PM KST" },
                  { icon: Mail, label: "Email", value: "info@hansolcarrental.com", sub: "We reply within 24 hours" },
                  { icon: MapPin, label: "Office", value: "123 Gangnam-daero, Gangnam-gu", sub: "Seoul, South Korea" },
                  { icon: Clock, label: "Hours", value: "8:00 AM – 10:00 PM", sub: "Open 7 days a week" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="font-semibold text-gray-900">{item.value}</p>
                      <p className="text-sm text-gray-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <p className="font-semibold">WhatsApp / KakaoTalk</p>
                </div>
                <p className="text-sm text-gray-600">
                  For instant support, message us on WhatsApp or KakaoTalk at <span className="font-semibold">+82 10-1234-5678</span>. Our team responds within minutes.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-3">
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-6">Send Us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">Select a topic</option>
                      <option value="booking">Booking Inquiry</option>
                      <option value="pricing">Pricing Question</option>
                      <option value="fleet">Fleet Information</option>
                      <option value="driver">Chauffeur Service</option>
                      <option value="support">Customer Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sent ? "Message Sent!" : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="h-80 bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2" />
            <p className="font-semibold">123 Gangnam-daero, Gangnam-gu, Seoul</p>
            <p className="text-sm">South Korea</p>
          </div>
        </div>
      </section>
    </div>
  );
}
