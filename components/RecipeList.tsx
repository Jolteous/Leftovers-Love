import RecipeCard from './RecipeCard';
import {Recipe} from "@/types";

interface RecipeListProps {
    recipes: Recipe[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
    return (
        <section className="recipe-list mt-5">
            <h2>Recipes</h2>
            {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
        </section>
    );
}