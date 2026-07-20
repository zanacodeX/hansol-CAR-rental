import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Hansol Car Rental - Premium Car Rental in South Korea",
  description:
    "Rent sedans, SUVs, and vans with or without a driver. Self-drive or pick-up/drop-off service available.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p>&copy; 2026 Hansol Car Rental. All rights reserved.</p>
              <p className="text-sm mt-2 text-gray-500">
                Premium car rental service in South Korea
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
