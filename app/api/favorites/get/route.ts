import { getServerAuthSession } from "@/util/auth-options";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user.savedRecipeIds);
}
