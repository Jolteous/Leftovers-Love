import prisma from "@/lib/prisma";
import {NextRequest} from "next/server";
import {getServerAuthSession} from "@/util/auth-options";

export async function GET(
    request: NextRequest,
) {
    const session = await getServerAuthSession();

    if(!session) return new Response("Not Authorized", {
        status: 401,
    })

    if (request.method !== "GET") return new Response("Oops, Invalid Method.", {
        status: 405,
    })

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: session.user?.id
            },
            select: {
                ingredients: true,
            }
        });

        if(!user) return new Response(JSON.stringify({}), {
            status: 200,
        });

        return new Response(JSON.stringify(user.ingredients), {
            status: 200,
        });
    } catch (error) {
        console.error(error);
        return new Response(String(error), {
            status: 500,
        });
    }
}