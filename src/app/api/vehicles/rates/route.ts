import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicleId, packageId, price } = body;

    if (!vehicleId || !packageId || price === undefined) {
      return NextResponse.json({ error: "vehicleId, packageId, and price are required" }, { status: 400 });
    }

    const rate = await prisma.vehiclePackageRate.upsert({
      where: { vehicleId_packageId: { vehicleId, packageId } },
      update: { price: parseFloat(price) },
      create: { vehicleId, packageId, price: parseFloat(price) },
    });

    return NextResponse.json(rate);
  } catch {
    return NextResponse.json({ error: "Failed to save rate" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { rates } = body;

    if (!Array.isArray(rates)) {
      return NextResponse.json({ error: "rates array required" }, { status: 400 });
    }

    for (const r of rates) {
      if (r.price !== null && r.price !== undefined && r.price !== "") {
        await prisma.vehiclePackageRate.upsert({
          where: { vehicleId_packageId: { vehicleId: r.vehicleId, packageId: r.packageId } },
          update: { price: parseFloat(r.price) },
          create: { vehicleId: r.vehicleId, packageId: r.packageId, price: parseFloat(r.price) },
        });
      } else {
        await prisma.vehiclePackageRate.deleteMany({
          where: { vehicleId: r.vehicleId, packageId: r.packageId },
        });
      }
    }

    return NextResponse.json({ message: "Rates saved" });
  } catch {
    return NextResponse.json({ error: "Failed to save rates" }, { status: 500 });
  }
}
