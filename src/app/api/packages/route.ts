import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { durationDays: "asc" },
      include: { vehicleRates: true },
    });
    return NextResponse.json(packages);
  } catch {
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, durationDays } = body;

    if (!name || !durationDays) {
      return NextResponse.json({ error: "Name and duration are required" }, { status: 400 });
    }

    const pkg = await prisma.package.create({
      data: { name, durationDays: parseInt(durationDays) },
    });
    return NextResponse.json(pkg, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
