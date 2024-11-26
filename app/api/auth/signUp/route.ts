import prisma from "@/lib/prisma";

export async function POST(
    request: Request,
) {
    if (request.method !== "POST") return new Response("Oops, Invalid Method.", {
        status: 400,
    })

    try {
        const json = await request.json();

        await prisma.user.create({
            data: {
                email: json.email,
                name: json.name,
                password: json.password,
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