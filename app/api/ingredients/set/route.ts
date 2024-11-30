import prisma from "@/lib/prisma";
import {NextRequest} from "next/server";
import {getServerAuthSession} from "@/util/auth-options";

export async function POST(
    request: NextRequest,
) {
    const session = await getServerAuthSession();

    const searchParams = request.nextUrl.searchParams
    const ingredientsParam = searchParams.get('ingredients') as string;

    const ingredients = ingredientsParam.split(",").map(item => item.trim());

    if(!session) return new Response("Not Authorized", {
        status: 401,
    })

    if (request.method !== "POST") return new Response("Oops, Invalid Method.", {
        status: 405,
    })

    try {
        await prisma.user.update({
            where: {
                id: session.user?.id
            },
            data: {
                ingredients: ingredients
            }
        });

        return new Response('Success', {
            status: 200,
        });
    } catch (error) {
        console.error(error);
        return new Response(String(error), {
            status: 500,
        });
    }
}