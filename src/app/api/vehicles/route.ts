import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        packageRates: {
          include: { package: true },
        },
      },
    });

    return NextResponse.json(vehicles);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelName, type, transmission, status, dailyRate, imageUrl, photos, seatCount, description, features } =
      body;

    if (!modelName || !type || !transmission || !dailyRate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        modelName,
        type,
        transmission,
        status: status || "AVAILABLE",
        dailyRate: parseFloat(dailyRate),
        imageUrl: imageUrl || null,
        photos: photos || null,
        seatCount: seatCount || 5,
        description: description || null,
        features: features || null,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create vehicle" },
      { status: 500 }
    );
  }
}
