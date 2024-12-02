import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
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
    } catch (error) {
        throw new Error(`Fetch failed: ${error.message}`);
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { ingredients } = req.body;

            // Text Generation using Hugging Face Transformers API
            const textGenerationResponse = await fetchWithRetry('https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                },
                body: JSON.stringify({
                    inputs: `Create a detailed recipe using the following ingredients: ${ingredients.join(', ')}. Provide a title, summary, and step-by-step instructions.`,
                    parameters: {
                        max_new_tokens: 200,
                        return_full_text: false,
                    },
                }),
            });

            const textData = await textGenerationResponse.json();
            console.log('Text generation response:', textData);

            const recipeText = textData[0]?.generated_text;

            if (!recipeText) {
                console.error('Text generation response:', textData);
                throw new Error('Generated text is undefined');
            }

            // Extract title, summary, and instructions from the generated text
            const [title, summary, ...instructionsArray] = recipeText.split('\n').filter(line => line.trim() !== '');
            const instructions = instructionsArray.join('\n');

            // Image Generation using Pollinations API
            const imagePrompt = `A delicious dish made with ${ingredients.join(', ')}`;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}`;

            const aiRecipe = {
                id: 'ai-recipe',
                title,
                summary,
                instructions,
                image: imageUrl,
                ingredients: ingredients.join(', '), // Ensure ingredients are in the same format
            };

            res.status(200).json(aiRecipe);
        } catch (error) {
            console.error('Error generating AI recipe:', error);
            res.status(500).json({ error: 'Failed to generate AI recipe', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
