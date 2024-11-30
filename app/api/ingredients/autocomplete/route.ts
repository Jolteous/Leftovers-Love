import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return new Response(JSON.stringify({ error: 'No query provided' }), { status: 400 });
    }

    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
        console.error('API key is missing');
        return new Response(JSON.stringify({ error: 'API key is missing' }), { status: 500 });
    }

    try {
        const response = await fetch(
            `https://api.spoonacular.com/food/ingredients/autocomplete?query=${encodeURIComponent(
                query
            )}&number=10&apiKey=${apiKey}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch autocomplete results');
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
}