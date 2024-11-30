import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerAuthSession } from "@/util/auth-options";

export async function GET(request: NextRequest) {
    const session = await getServerAuthSession();
    const searchParams = request.nextUrl.searchParams;
    const ingredients = searchParams.get("ingredients") as string;

    if (!session) {
        return new Response("Not Authorized", { status: 401 });
    }

    if (request.method !== "GET") {
        return new Response("Oops, Invalid Method.", { status: 405 });
    }

    if (!ingredients) {
        return new Response("No ingredients", { status: 400 });
    }

    try {
        const cacheTTL = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
        const now = new Date();

        const cachedRecipes = await prisma.recipeCache.findUnique({
            where: {
                ingredients: ingredients,
            },
        });

        if (cachedRecipes) {
            const cacheAge = now.getTime() - new Date(cachedRecipes.updatedAt).getTime();
            if (cacheAge < cacheTTL) {
                console.log("Serving from cache");
                return new Response(cachedRecipes.recipes, {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        const apiKey = process.env.SPOONACULAR_API_KEY;
        if (!apiKey) {
            console.error("API key is missing");
            return new Response("API key is missing", { status: 401 });
        }

        const response = await fetch(
            `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(
                ingredients
            )}&number=5&apiKey=${apiKey}&instructionsRequired=true&addRecipeInformation=true&sort=max-used-ingredients`
        );


        if (!response.ok) {
            throw new Error("Failed to fetch recipes");
        }

        const data = await response.json();
        const recipesJson = JSON.stringify(data);

        await prisma.recipeCache.upsert({
            where: {
                ingredients: ingredients,
            },
            update: {
                recipes: recipesJson,
                updatedAt: now,
            },
            create: {
                ingredients: ingredients,
                recipes: recipesJson,
            },
        });

        console.log("Serving fresh data and updating cache");
        return new Response(recipesJson, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response(String(error), { status: 500 });
    }
}
