import { NextRequest, NextResponse } from "next/server";
import { getDistricts } from "@/lib/queries/locations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityIdParam = searchParams.get("cityId");

  if (!cityIdParam) {
    return NextResponse.json(
      { error: { code: "MISSING_PARAM", message: "cityId parametresi gereklidir" } },
      { status: 400 }
    );
  }

  const cityId = Number(cityIdParam);
  if (!Number.isInteger(cityId) || cityId <= 0) {
    return NextResponse.json(
      { error: { code: "INVALID_PARAM", message: "cityId geçerli bir tam sayı olmalıdır" } },
      { status: 400 }
    );
  }

  const districts = await getDistricts(cityId);
  return NextResponse.json({ data: districts });
}
