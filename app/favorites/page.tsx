"use client";

import React, { useState, useEffect } from "react";
import { RecipeDetail } from "@/types";
import RecipeCard from "@/components/RecipeCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import RecipeDetailModal from "@/components/RecipeDetailModal";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";

export default function Home() {
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientUsage, setIngredientUsage] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(
      null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await fetch("/api/ingredients/get", {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch ingredients");
        }
        const data = await res.json();
        console.log(data);
        setIngredients(data || []);
        const usage = data.reduce((acc: { [key: string]: boolean }, ingredient: string) => {
          acc[ingredient] = true;
          return acc;
        }, {} as { [key: string]: boolean });
        setIngredientUsage(usage);
      } catch (error) {
        console.error(error);
      }
    };

    fetchIngredients();
  }, []);

  useEffect(() => {
    if (savedRecipeIds.length > 0) {
      console.log("fetching");
      const fetchRecipes = async () => {
        try {
          setLoading(true);
          const savedRecipeIdsF = savedRecipeIds.join(",");
          const res = await fetch(
              `/api/recipes/ids?ids=${encodeURIComponent(
                  savedRecipeIdsF
              )}`
          );
          if (!res.ok) {
            throw new Error("Failed to fetch recipes");
          }
          const data = await res.json();
          setRecipes(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }

      fetchRecipes();
    } else {
      console.log("skipping");
      setRecipes([]);
    }
  }, [ingredients, ingredientUsage]);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const res = await fetch("/api/favorites/get", {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch saved recipes");
        }
        const data = await res.json();
        setSavedRecipeIds(data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSavedRecipes();
  }, []);

  const handleSave = async (recipeId: number) => {
    try {
      const res = await fetch("/api/favorites/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId: recipeId.toString() }),
      });
      if (!res.ok) {
        throw new Error("Failed to save recipe");
      }
      setSavedRecipeIds((savedRecipeIds) => [...savedRecipeIds, recipeId.toString()]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnsave = async (recipeId: number) => {
    try {
      const res = await fetch("/api/favorites/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId: recipeId.toString() }),
      });
      if (!res.ok) {
        throw new Error("Failed to remove recipe");
      }
      setSavedRecipeIds(savedRecipeIds.filter((id) => id !== recipeId.toString()));
    } catch (error) {
      console.error(error);
    }
  };

  const handleRecipeClick = (recipe: RecipeDetail) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  return (
      <main className="flex h-full justify-center bg-gray-100 pt-4">
        <ScrollArea className="h-full p-4">
          {loading && (
              <>
                {[...Array(5)].map((_, index) => (
                    <RecipeCardSkeleton key={index} />
                ))}
              </>
          )}
          {!loading && recipes && recipes.length === 0 && (
              <p>No favorites found.</p>
          )}
          {!loading && recipes && recipes.length > 0 &&
              recipes.map((recipe) => (
                  <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => handleRecipeClick(recipe)}
                      isSaved={savedRecipeIds.includes(recipe.id.toString())}
                      handleSave={handleSave}
                      handleUnsave={handleUnsave}
                      currentIngredients={ingredients}
                  />
              ))}
        </ScrollArea>

        {selectedRecipe && (
            <RecipeDetailModal
                recipe={selectedRecipe}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        )}
      </main>
  );
}