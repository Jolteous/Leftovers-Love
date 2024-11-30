import { RecipeDetail } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecipeCardProps {
    recipe: RecipeDetail;
    onClick: (recipe: RecipeDetail) => void;
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
    return (
        <Card className="mb-4 cursor-pointer" onClick={() => onClick(recipe)}>
            <CardHeader>
                <CardTitle>{recipe.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <img src={recipe.image} alt={recipe.title} className="mb-3" />
                <p>Ready in {recipe.readyInMinutes} minutes</p>
                <p>Servings: {recipe.servings}</p>
            </CardContent>
        </Card>
    );
}