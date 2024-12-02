import { NextApiRequest, NextApiResponse } from 'next';
import fetch, { RequestInit as NodeFetchRequestInit } from 'node-fetch';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function fetchWithRetry(url: string, options: NodeFetchRequestInit, retries = MAX_RETRIES) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            const errorData = JSON.parse(errorText);
            if (response.status === 503 && errorData.error.includes("currently loading")) {
                if (retries > 0) {
                    console.log(`Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                    return fetchWithRetry(url, options, retries - 1);
                } else {
                    throw new Error(`Text generation failed after ${MAX_RETRIES} retries: ${response.status} ${response.statusText} - ${errorText}`);
                }
            } else {
                throw new Error(`Text generation failed: ${response.status} ${response.statusText} - ${errorText}`);
            }
        }
        return response;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Fetch failed: ${error.message}`);
        } else {
            throw new Error('Fetch failed: Unknown error');
        }
    }
}

async function generateRecipeText(ingredients: string[], retries = MAX_RETRIES) {
    const textGenerationResponse = await fetchWithRetry('https://api-inference.huggingface.co/models/Qwen/QwQ-32B-Preview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify({
            inputs: `Create a detailed recipe using the following ingredients: ${ingredients.join(', ')}. Provide a title, summary, and step-by-step instructions.`,
            parameters: {
                max_new_tokens: 500, // Increase the token limit
                return_full_text: false,
            },
        }),
    });

    const textData = await textGenerationResponse.json() as { generated_text: string }[];
    console.log('Text generation response:', textData);

    const recipeText = textData[0]?.generated_text;

    if (!recipeText || recipeText.includes(`Create a detailed recipe using the following ingredients: ${ingredients.join(', ')}`)) {
        if (retries > 0) {
            console.log(`Retrying text generation... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return generateRecipeText(ingredients, retries - 1);
        } else {
            throw new Error('Generated text is invalid or just the prompt');
        }
    }

    return recipeText;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { ingredients } = req.body;

            // Generate recipe text
            const recipeText = await generateRecipeText(ingredients);

            // Extract title, summary, and instructions from the generated text
            const [title, summary, ...instructionsArray] = recipeText.split('\n').filter((line: string) => line.trim() !== '');
            const instructions = instructionsArray.join('\n');

            // Image Generation using Pollinations API
            const imagePrompt = `${title} - A delicious dish made with ${ingredients.join(', ')}`;
            const imageUrlResponse = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}`);
            const imageUrl = imageUrlResponse.url;

            const aiRecipe = {
                id: 'ai-recipe',
                title,
                summary,
                instructions,
                image: imageUrl,
                ingredients: ingredients.join(', '), // Ensure ingredients are in the same format
            };

            res.status(200).json(aiRecipe);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error generating AI recipe:', error);
                res.status(500).json({ error: 'Failed to generate AI recipe', details: error.message });
            } else {
                res.status(500).json({ error: 'Failed to generate AI recipe', details: 'Unknown error' });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}