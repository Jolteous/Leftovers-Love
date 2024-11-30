// /app/page.tsx or /pages/index.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { RecipeDetail } from '@/types';
import RecipeCard from '@/components/RecipeCard';
import AddIngredientsButton from '@/components/AddIngredientsButton';
import { ScrollArea } from '@/components/ui/scroll-area';
import RecipeDetailModal from '@/components/RecipeDetailModal';
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";

export default function Home() {
    const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const res = await fetch('/api/ingredients/get', {
                    method: 'GET',
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch ingredients');
                }
                const data = await res.json();
                console.log(data);
                setIngredients(data || []);
            } catch (error) {
                console.error(error);
            }
        };

        fetchIngredients();
    }, []);

    useEffect(() => {
        if (ingredients && ingredients.length > 0) {
            console.log('fetching');
            const fetchRecipes = async () => {
                try {
                    setLoading(true);
                    const ingredientsStr = ingredients.join(',');
                    const res = await fetch(
                        `/api/recipes/ingredients?ingredients=${encodeURIComponent(ingredientsStr)}`
                    );
                    if (!res.ok) {
                        throw new Error('Failed to fetch recipes');
                    }
                    const data = await res.json();
                    setRecipes(data.results);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };

            fetchRecipes();
        } else {
            console.log('skipping');
            setRecipes([]);
        }
    }, [ingredients]);

    const handleRecipeClick = (recipe: RecipeDetail) => {
        setSelectedRecipe(recipe);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRecipe(null);
    };

    return (
        <main className="flex h-full">
            <div className="w-5/6 h-full">
                <div className={"text-center font-extrabold text-2xl"}>
                    Your Feed
                </div>
                <ScrollArea className="h-full p-4">
                    {loading && (
                        <>
                            {[...Array(5)].map((_, index) => (
                                <RecipeCardSkeleton key={index} />
                            ))}
                        </>
                    )}
                    {!loading && (!ingredients || ingredients.length === 0) && (
                        <p>Please add ingredients to get recipe suggestions.</p>
                    )}
                    {!loading && recipes && recipes.length === 0 && <p>No recipes found.</p>}
                    {!loading &&
                        recipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} onClick={handleRecipeClick} />
                        ))}
                </ScrollArea>
            </div>
            <div className="w-1/6 text-center p-4">
                <AddIngredientsButton
                    onIngredientsUpdated={(newIngredients: string[]) => setIngredients(newIngredients)}
                    initialIngredients={ingredients}
                />
            </div>

            {selectedRecipe && (
                <RecipeDetailModal recipe={selectedRecipe} isOpen={isModalOpen} onClose={closeModal} />
            )}
        </main>
    );
}
