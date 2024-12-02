import { getServerAuthSession } from "@/util/auth-options";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  const { recipeId } = await req.json();

  if (!session) {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      savedRecipeIds: {
        push: recipeId,
      },
    },
  });

  return NextResponse.json({ message: "Recipe saved" });
}
