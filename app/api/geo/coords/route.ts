import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { address } = await request.json();
  const res = await fetch(
    `https://geocode.maps.co/search?q=${address}&api_key=${process.env.GEOCODE_API_KEY}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
