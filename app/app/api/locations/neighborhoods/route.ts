import { NextRequest, NextResponse } from "next/server";
import { getNeighborhoods } from "@/lib/queries/locations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const districtIdParam = searchParams.get("districtId");

  if (!districtIdParam) {
    return NextResponse.json(
      { error: { code: "MISSING_PARAM", message: "districtId parametresi gereklidir" } },
      { status: 400 }
    );
  }

  const districtId = Number(districtIdParam);
  if (!Number.isInteger(districtId) || districtId <= 0) {
    return NextResponse.json(
      { error: { code: "INVALID_PARAM", message: "districtId geçerli bir tam sayı olmalıdır" } },
      { status: 400 }
    );
  }

  const neighborhoods = await getNeighborhoods(districtId);
  return NextResponse.json({ data: neighborhoods });
}
