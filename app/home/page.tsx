"use client";

import React, { useState, useEffect } from "react";
import { RecipeDetail } from "@/types";
import RecipeCard from "@/components/RecipeCard";
import AddIngredientsButton from "@/components/AddIngredientsButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import RecipeDetailModal from "@/components/RecipeDetailModal";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

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
  const [aiRecipe, setAiRecipe] = useState<RecipeDetail | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
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
    const activeIngredients = ingredients.filter(
        (ingredient) => ingredientUsage[ingredient]
    );
    if (activeIngredients.length > 0) {
      console.log("fetching");
      const fetchRecipes = async () => {
        try {
          setLoading(true);
          const ingredientsStr = activeIngredients.join(",");
          const res = await fetch(
              `/api/recipes/ingredients?ingredients=${encodeURIComponent(
                  ingredientsStr
              )}`
          );
          if (!res.ok) {
            throw new Error("Failed to fetch recipes");
          }
          const data = await res.json();
          setRecipes(data.results);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      const fetchAiRecipe = async () => {
        try {
          setAiLoading(true);
          const res = await fetch("/api/ai-recipe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ingredients: activeIngredients, ensureCompleteInstructions: true, maxTokens: 2048 }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            console.error('AI recipe fetch error data:', errorData);
            throw new Error(`Failed to fetch AI recipe: ${errorData.error} - ${errorData.details}`);
          }
          const data = await res.json();
          setAiRecipe(data);
        } catch (error) {
          console.error("Error fetching AI recipe:", error);
        } finally {
          setAiLoading(false);
        }
      };

      fetchRecipes();
      fetchAiRecipe();
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

  const handleIngredientUsageChange = (ingredient: string) => {
    setIngredientUsage((prevUsage) => ({
      ...prevUsage,
      [ingredient]: !prevUsage[ingredient],
    }));
  };

  return (
      <main className="flex h-full justify-center bg-gray-100 pt-4">
        <div className="w-5/6 h-full">
          <div className={"text-center font-extrabold text-2xl mb-4"}>
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
            {!loading && recipes && recipes.length === 0 && (
                <p>No recipes found.</p>
            )}
            {!loading && aiLoading && (
                <div className="border-4 rounded-md p-4 mb-6 bg-purple-100 relative">
                  <div className="flex flex-col items-center">
                    <RecipeCardSkeleton />
                    <span className="text-purple-700 font-bold">AI Generated</span>
                  </div>
                </div>
            )}
            {!loading && !aiLoading && aiRecipe && (
                <Card className="mb-4 cursor-pointer bg-purple-100 border-white">
                  <CardHeader>
                    <CardTitle className={"text-gray-700"}>{aiRecipe.summary}</CardTitle>
                  </CardHeader>
                  <CardContent className={"leading-relaxed text-gray-700 relative"}>
                    <img src={aiRecipe.image} alt="AI Generated Recipe" className={"w-64 "}/>
                    <div
                        className="text-base mb-6"
                    >
                    </div>
                    <Accordion type="single" collapsible>
                      <AccordionItem value={"preview"}>
                        <AccordionTrigger>
                          Instructions
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="text-center mt-2">
                            <h4 className="font-bold">Instructions</h4>
                            <p className={"whitespace-pre-line break-words overflow-visible"} style={{ maxHeight: 'none' }}>{aiRecipe.instructions}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <span
                        className="absolute bottom-2 right-2 bg-purple-200 text-purple-700 px-2 py-1 rounded-md text-xs">AI</span>
                  </CardContent>
                </Card>
            )}
            {!loading && !aiLoading && !aiRecipe && (
                <div className="border-4 rounded-md p-4 mb-6 bg-red-100 relative">
                  <div className="flex flex-col items-center">
                    <span className="text-red-700 font-bold">Failed to generate AI recipe</span>
                  </div>
                </div>
            )}
            {!loading &&
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
        </div>
        <div className="w-1/6 text-center p-4">
          <AddIngredientsButton
              onIngredientsUpdated={(newIngredients: string[]) => {
                setIngredients(newIngredients);
                const usage = newIngredients.reduce((acc: { [key: string]: boolean }, ingredient: string) => {
                  acc[ingredient] = true;
                  return acc;
                }, {} as { [key: string]: boolean });
                setIngredientUsage(usage);
              }}
              initialIngredients={ingredients}
          />
          <div className="mt-4">
            {ingredients.map((ingredient) => (
                <div key={ingredient} className="flex items-center">
                  <input
                      type="checkbox"
                      checked={ingredientUsage[ingredient]}
                      onChange={() => handleIngredientUsageChange(ingredient)}
                      className="mr-2"
                  />
                  <span>{ingredient}</span>
                </div>
            ))}
          </div>
        </div>

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