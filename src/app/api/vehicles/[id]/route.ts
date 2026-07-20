import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        packageRates: {
          include: { package: true },
        },
      },
    });
    if (!vehicle) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        modelName: body.modelName,
        type: body.type,
        transmission: body.transmission,
        status: body.status,
        dailyRate: body.dailyRate ? parseFloat(body.dailyRate) : undefined,
        imageUrl: body.imageUrl,
        photos: body.photos,
        seatCount: body.seatCount,
        description: body.description || null,
        features: body.features || null,
      },
    });

    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
