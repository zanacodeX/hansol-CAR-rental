import Link from "next/link";
import { Car, MapPin, Shield, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Hansol Car Rental
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-8">
            Premium car rental service across South Korea
          </p>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Choose from our fleet of sedans, SUVs, and vans. Self-drive with your
            International Driving Permit or let our professional drivers take you
            where you need to go.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition"
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
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Hansol?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <Car className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Modern Fleet</h3>
              <p className="text-gray-600">
                Well-maintained vehicles from top brands, regularly serviced for your safety.
              </p>
            </div>
            <div className="text-center p-6">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Flexible Pickup</h3>
              <p className="text-gray-600">
                Pick up at our garage or use our convenient airport pick-up and drop-off service.
              </p>
            </div>
            <div className="text-center p-6">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Full Insurance</h3>
              <p className="text-gray-600">
                Comprehensive insurance coverage options for peace of mind during your trip.
              </p>
            </div>
            <div className="text-center p-6">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                WhatsApp and KakaoTalk support available around the clock.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Hit the Road?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Browse our fleet or start your booking today. No payment gateway needed - pay via bank transfer after confirmation.
          </p>
          <Link
            href="/booking"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition inline-block"
          >
            Start Booking
          </Link>
        </div>
      </section>
    </div>
  );
}
