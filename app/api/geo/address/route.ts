import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { latitute, longitude } = await request.json();
  const res = await fetch(
    `https://geocode.maps.co/reverse?lat=${latitute}&lon=${longitude}&api_key=${process.env.GEOCODE_API_KEY}`
  );
  const data = await res.json();
  return new NextResponse(data);
}
