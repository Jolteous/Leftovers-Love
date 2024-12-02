import { getServerAuthSession } from "@/util/auth-options";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return new NextResponse("Not Authorized", { status: 401 });
  }
  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return new NextResponse(JSON.stringify(user));
}
