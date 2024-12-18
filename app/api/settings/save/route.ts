import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/util/auth-options";

export async function POST(req: NextRequest) {
  const { email, latitute, longitude } = await req.json();
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Not Authorized" }, { status: 401 });
  }

  if (!email || !latitute || !longitude) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      email,
      latitute,
      longitude,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
