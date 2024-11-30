import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/util/auth-options';
import prisma from '@/lib/prisma';
import { RecipeDetail } from '@/types';

export async function GET(request: NextRequest) {
    const session = await getServerAuthSession();

    if (!session) {
        return new NextResponse('Not Authorized', { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
        return new NextResponse('No ids provided', { status: 400 });
    }

    const ids = idsParam.split(',').map((id) => id.trim());

    try {
        const cacheTTL = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
        const now = new Date();

        const cachedRecipes = await prisma.recipeBulkCache.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        const validCachedRecipes = cachedRecipes.filter((recipe) => {
            const cacheAge = now.getTime() - recipe.updatedAt.getTime();
            return cacheAge < cacheTTL;
        });

        const validCachedIds = validCachedRecipes.map((recipe) => recipe.id);
        const missingIds = ids.filter((id) => !validCachedIds.includes(id));

        const recipesData: RecipeDetail[] = validCachedRecipes.map((recipe) => JSON.parse(recipe.data));

        if (missingIds.length > 0) {
            const apiKey = process.env.SPOONACULAR_API_KEY;

            if (!apiKey) {
                console.error('API key is missing');
                return new NextResponse('API key is missing', { status: 500 });
            }

            const response = await fetch(
                `https://api.spoonacular.com/recipes/informationBulk?ids=${missingIds.join(
                    ','
                )}&includeNutrition=false&apiKey=${apiKey}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }

            const data: RecipeDetail[] = await response.json();

            await Promise.all(
                data.map((recipe) =>
                    prisma.recipeBulkCache.upsert({
                        where: {
                            id: String(recipe.id),
                        },
                        update: {
                            data: JSON.stringify(recipe),
                            updatedAt: now,
                        },
                        create: {
                            id: String(recipe.id),
                            data: JSON.stringify(recipe),
                            updatedAt: now,
                        },
                    })
                )
            );

            recipesData.push(...data);
        }

        return NextResponse.json(recipesData);
    } catch (error) {
        console.error(error);
        return new NextResponse(String(error), { status: 500 });
    }
}