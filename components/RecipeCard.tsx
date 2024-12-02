import { RecipeDetail } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {Star} from "lucide-react";
import stringSimilarity from 'string-similarity';

interface RecipeCardProps {
    recipe: RecipeDetail;
    onClick: (recipe: RecipeDetail) => void;
    handleSave: (recipeId: number) => void;
    handleUnsave: (recipeId: number) => void;
    isSaved: boolean;
    currentIngredients: string[];
}

const getFirstTwoSentences = (text: string) => {
    if (!text) return "";
    const sentences = text.split(". ");
    return sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "..." : "");
};


export default function RecipeCard({ recipe, onClick, handleSave, handleUnsave, isSaved, currentIngredients }: RecipeCardProps) {
    console.log(recipe);
    return (
        <Card className="mb-4 cursor-pointer">
            <CardHeader>
                <CardTitle className={"text-gray-700"}>
                    <div className={"flex justify-between"}>
                        <div>{recipe.title}</div>
                        <button onClick={() => {
                            if (isSaved) {
                                handleUnsave(recipe.id);
                            } else {
                                handleSave(recipe.id);
                            }
                        }}>
                            <Star size={24} color={isSaved ? "yellow" : "gray"} fill={isSaved ? "yellow" : "none"} className={"hover:scale-75 transition-all"}/>
                        </button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className={"leading-relaxed text-gray-700"} onClick={() => onClick(recipe)}>
                <img src={recipe.image} alt={recipe.title} className="mb-3"/>
                <div
                    className="text-base mb-6"
                    dangerouslySetInnerHTML={{__html: getFirstTwoSentences(recipe.summary)}}
                ></div>
                <p className={"font-bold"}>Click for more info</p>
                <p>Ready in {recipe.readyInMinutes} minutes</p>
                <p>Servings: {recipe.servings}</p>
                <div className={'flex mt-4'}>
                    {recipe.extendedIngredients.map((ingredient) => (
                        <span
                            key={ingredient.id}
                            className={`${currentIngredients.some(ing => stringSimilarity.compareTwoStrings(ing, ingredient.name) > 0.5) ? 'bg-green-100' : 'bg-red-100'} rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2`}
                        >
                            {ingredient.name}
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}