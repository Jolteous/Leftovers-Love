// /app/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { RecipeDetail } from "@/types";
import RecipeCard from "@/components/RecipeCard";
import AddIngredientsButton from "@/components/AddIngredientsButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import RecipeDetailModal from "@/components/RecipeDetailModal";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";

const Collapse = ({ in: inProp, children }) => {
  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        inProp ? "max-w-xs max-h-screen" : "max-w-0 max-h-0 overflow-hidden"
      } bg-gray-200 p-2 rounded-md`}
    >
      {children}
    </div>
  );
};

const Accordion = ({ in: inProp, children }) => {
  return (
    <div
      className={`transition-max-height duration-500 ease-in-out ${
        inProp ? "max-h-screen" : "max-h-0"
      } overflow-hidden`}
    >
      {children}
    </div>
  );
};

const getFirstTwoSentences = (text) => {
  if (!text) return "";
  const sentences = text.split(". ");
  return sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "..." : "");
};

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
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [aiRecipe, setAiRecipe] = useState<RecipeDetail | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

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
        const usage = data.reduce((acc, ingredient) => {
          acc[ingredient] = true;
          return acc;
        }, {});
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
            body: JSON.stringify({ ingredients: activeIngredients }),
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

  const handleExpandClick = (recipeId: string) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };

  return (
    <main className="flex h-full justify-center bg-gray-100">
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
            <div className="border-4 rounded-md p-4 mb-6 bg-gray-50 relative border-purple-200">
              <div className="flex flex-col items-center p-4 rounded-md">
                <img src={aiRecipe.image} alt="AI Generated Recipe" className="w-1/4 h-auto" />
                <p className="text-gray-700 whitespace-pre-line">{aiRecipe.summary}</p>
                <button
                  onClick={() => handleExpandClick(aiRecipe.id)}
                  className="mt-2 text-blue-500"
                >
                  {expandedRecipeId === aiRecipe.id ? "▲" : "▼"}
                </button>
                <Accordion in={expandedRecipeId === aiRecipe.id}>
                  <div className="text-center mt-2">
                    <h4 className="font-bold">Instructions</h4>
                    <p className="whitespace-pre-line">{aiRecipe.instructions}</p>
                  </div>
                </Accordion>
                <span className="absolute bottom-2 right-2 bg-purple-200 text-purple-700 px-2 py-1 rounded-md text-xs">AI</span>
              </div>
            </div>
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
              <div
                key={recipe.id}
                className="border-4 rounded-md p-4 mb-6 bg-gray-50 relative"
              >
                <div className="flex flex-col items-center">
                  <RecipeCard
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe)}
                  />
                  <button
                    onClick={() => handleExpandClick(recipe.id)}
                    className="mt-2 text-blue-500"
                  >
                    {expandedRecipeId === recipe.id ? "▲" : "▼"}
                  </button>
                  <Accordion in={expandedRecipeId === recipe.id}>
                    <div
                      className="text-center mt-2"
                      dangerouslySetInnerHTML={{
                        __html: recipe.summary
                          ? getFirstTwoSentences(recipe.summary)
                          : "No summary available.",
                      }}
                    />
                  </Accordion>
                </div>
              </div>
            ))}
        </ScrollArea>
      </div>
      <div className="w-1/6 text-center p-4">
        <AddIngredientsButton
          onIngredientsUpdated={(newIngredients: string[]) => {
            setIngredients(newIngredients);
            const usage = newIngredients.reduce((acc, ingredient) => {
              acc[ingredient] = true;
              return acc;
            }, {});
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
