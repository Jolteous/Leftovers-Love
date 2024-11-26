'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Header from '../components/Header';
import IngredientForm from '../components/IngredientForm';
import RecipeList from '../components/RecipeList';
import { Recipe, Suggestion } from '@/types';

export default function Home() {
  const [ingredients, setIngredients] = useState<string>('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
      if (ingredients.length > 2 && apiKey) {
        try {
          const response = await fetch(
              `https://api.spoonacular.com/food/ingredients/autocomplete?query=${ingredients}&number=5&apiKey=${apiKey}`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch suggestions');
          }
          const data = await response.json();
          setSuggestions(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error(error instanceof Error ? error.message : error);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [ingredients]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
    if (!apiKey) {
      console.error('API key is missing');
      return;
    }
    try {
      const response = await fetch(
          `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${ingredients}&number=5&addRecipeInformation=true&apiKey=${apiKey}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data = await response.json();
      setRecipes(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setIngredients(suggestion.name);
    setSuggestions([]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIngredients(e.target.value);
  };

  return (
      <main className="max-w-3xl mx-auto p-5">
        <Header />
        <main>
          <section className="mb-5">
            <h2>How it works</h2>
            <p>
              Enter the ingredients you have, and we&#39;ll suggest recipes you can make with
              them.
            </p>
          </section>
          <IngredientForm
              ingredients={ingredients}
              setIngredients={setIngredients}
              handleSubmit={handleSubmit}
              suggestions={suggestions}
              handleInputChange={handleInputChange}
              handleSuggestionClick={handleSuggestionClick}
          />
          <RecipeList recipes={recipes} />
        </main>
      </main>
  );
}