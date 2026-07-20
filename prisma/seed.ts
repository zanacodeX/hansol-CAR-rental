import { PrismaClient, VehicleType, VehicleStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@hansol.com" },
    update: {},
    create: { name: "Admin", email: "admin@hansol.com", password: adminPassword, phone: "+82 10-0000-0000", role: Role.ADMIN },
  });
  console.log("Admin ready: admin@hansol.com / admin123");

  const userPassword = await bcrypt.hash("user123", 12);
  await prisma.user.upsert({
    where: { email: "user@hansol.com" },
    update: {},
    create: { name: "Demo User", email: "user@hansol.com", password: userPassword, phone: "+82 10-1111-1111", whatsappKakaotalkId: "demo_user_kakao", role: Role.USER },
  });
  console.log("User ready: user@hansol.com / user123");

  const vehicleCount = await prisma.vehicle.count();
  if (vehicleCount === 0) {
    const vehicles = [
      { modelName: "Hyundai Avante CN7", type: VehicleType.Sedan, transmission: "Automatic", status: VehicleStatus.AVAILABLE, dailyRate: 55000, seatCount: 5, description: "Compact and fuel-efficient sedan, perfect for city driving and short trips.", features: "Bluetooth,USB-C,LED Headlights,Cruise Control" },
      { modelName: "Kia K5 (Optima)", type: VehicleType.Sedan, transmission: "Automatic", status: VehicleStatus.AVAILABLE, dailyRate: 65000, seatCount: 5, description: "Stylish mid-size sedan with premium interior and smooth ride quality.", features: "Leather Seats,Panoramic Sunroof,Harman Kardon,Wireless Charging" },
      { modelName: "Hyundai Sonata DN8", type: VehicleType.Sedan, transmission: "Automatic", status: VehicleStatus.AVAILABLE, dailyRate: 70000, seatCount: 5, description: "Elegant and spacious sedan with advanced safety features and comfortable ride.", features: "Smart Park,Blind Spot Monitor,Heated Seats,Head-Up Display" },
      { modelName: "Hyundai Tucson NX4", type: VehicleType.SUV, transmission: "Automatic", status: VehicleStatus.AVAILABLE, dailyRate: 90000, seatCount: 5, description: "Popular compact SUV ideal for families and road trips across Korea.", features: "AWD,360 Camera,Heated Steering Wheel,Smart Tailgate" },
      { modelName: "Kia Sportage NQ5", type: VehicleType.SUV, transmission: "Automatic", status: VehicleStatus.ON_REQUEST, dailyRate: 85000, seatCount: 5, description: "Bold design with cutting-edge tech and spacious cargo area.", features: "Dual Curved Display,BOSS Audio,Remote Start,Ventilated Seats" },
      { modelName: "SsangYong Rexton", type: VehicleType.SUV, transmission: "Automatic", status: VehicleStatus.AVAILABLE, dailyRate: 110000, seatCount: 7, description: "Full-size SUV with 7 seats, powerful engine for mountain and highway driving.", features: "4WD,Leather Interior,Towing Package,7 Seats,Off-Road Mode" },
      { modelName: "Hyundai Staria Lounge", type: VehicleType.Van, transmission: "Automatic", status: VehicleStatus.AVAILABLE, dailyRate: 150000, seatCount: 9, description: "Premium multi-purpose van for group travel with VIP-level comfort.", features: "9 Seats,Swivel Captain Chairs,Mini Bar,Privacy Curtains,USB Ports" },
      { modelName: "Kia Carnival Hi Limousine", type: VehicleType.Van, transmission: "Automatic", status: VehicleStatus.ON_REQUEST, dailyRate: 180000, seatCount: 7, description: "Luxury limousine van with first-class seating and entertainment system.", features: "7 Seats,Luxury Seats,Smart TV,Ambient Lighting,Refrigerator" },
      { modelName: "Genesis G80", type: VehicleType.Sedan, transmission: "Automatic", status: VehicleStatus.MAINTENANCE, dailyRate: 120000, seatCount: 5, description: "Luxury sedan with world-class refinement and cutting-edge technology.", features: "Nappa Leather,21-Speaker Audio,Semantic ADAS,Massage Seats,Genesis Digital Key" },
    ];

    const createdVehicles = [];
    for (const v of vehicles) {
      const created = await prisma.vehicle.create({ data: v });
      createdVehicles.push(created);
    }
    console.log(`Created ${createdVehicles.length} vehicles`);

    const packageData = [
      { name: "3-Day Package", durationDays: 3 },
      { name: "7-Day Package", durationDays: 7 },
    ];

    const createdPackages = [];
    for (const p of packageData) {
      const created = await prisma.package.create({ data: p });
      createdPackages.push(created);
    }
    console.log(`Created ${createdPackages.length} packages`);

    const rates: Record<number, Record<string, number>> = {
      3: {
        "Hyundai Avante CN7": 140000, "Kia K5 (Optima)": 165000, "Hyundai Sonata DN8": 180000,
        "Hyundai Tucson NX4": 230000, "Kia Sportage NQ5": 220000, "SsangYong Rexton": 280000,
        "Hyundai Staria Lounge": 380000, "Kia Carnival Hi Limousine": 460000, "Genesis G80": 300000,
      },
      7: {
        "Hyundai Avante CN7": 280000, "Kia K5 (Optima)": 330000, "Hyundai Sonata DN8": 360000,
        "Hyundai Tucson NX4": 460000, "Kia Sportage NQ5": 430000, "SsangYong Rexton": 560000,
        "Hyundai Staria Lounge": 750000, "Kia Carnival Hi Limousine": 900000, "Genesis G80": 600000,
      },
    };

    for (const pkg of createdPackages) {
      const pkgRates = rates[pkg.durationDays] || {};
      for (const v of createdVehicles) {
        const price = pkgRates[v.modelName];
        if (price) {
          await prisma.vehiclePackageRate.create({
            data: { vehicleId: v.id, packageId: pkg.id, price },
          });
        }
      }
    }
    console.log("Created vehicle-package rates");
  } else {
    console.log(`Database already has ${vehicleCount} vehicles, skipping seed.`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
