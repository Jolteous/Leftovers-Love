import sanitizeHtml from 'sanitize-html';
import {Recipe} from "@/types";
import Image from "next/image";

interface RecipeCardProps {
    recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const sanitizedSummary = sanitizeHtml(recipe.summary);

    return (
        <div className="border p-3 mb-3">
            <h3>{recipe.title}</h3>
            <Image src={recipe.image} alt={recipe.title} className="mb-3" />
            <p dangerouslySetInnerHTML={{ __html: sanitizedSummary }}></p>
            <p>Ready in {recipe.readyInMinutes} minutes</p>
            <p>Servings: {recipe.servings}</p>
        </div>
    );
}