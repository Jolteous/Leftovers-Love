import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
    request: Request,
) {
    if (request.method !== "POST") return new Response("Oops, Invalid Method.", {
        status: 405,
    })

    try {
        const json = await request.json();

        const hashedPassword = await bcrypt.hash(json.password, 10)

        await prisma.user.create({
            data: {
                email: json.email,
                name: json.name,
                password: hashedPassword,
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