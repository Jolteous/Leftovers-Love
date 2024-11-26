import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
    if (ingredients.length > 2 && apiKey) {
      fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${ingredients}&number=5&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => setSuggestions(Array.isArray(data) ? data : []));
    } else {
      setSuggestions([]);
    }
  }, [ingredients]);

  const handleSubmit = async (e) => {
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
      console.error(error.message);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setIngredients(suggestion.name);
    setSuggestions([]);
  };

  return (
    <div className="container">
      <Head>
        <title>Leftovers Love</title>
        <meta name="description" content="Reduce food waste by suggesting recipes for leftovers" />
      </Head>
      <header>
        <h1>Welcome to Leftovers Love</h1>
        <p>Reduce food waste by suggesting recipes for leftovers.</p>
      </header>
      <main>
        <section>
          <h2>How it works</h2>
          <p>Enter the ingredients you have, and we'll suggest recipes you can make with them.</p>
        </section>
        <section>
          <h2>Choose your ingredients</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Enter ingredients separated by commas"
            />
            <button type="submit">Find Recipes</button>
          </form>
          <ul>
            {suggestions.map((suggestion) => (
              <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion.name}
              </li>
            ))}
          </ul>
        </section>
        <section className="recipe-list">
          <h2>Recipes</h2>
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe">
              <h3>{recipe.title}</h3>
              <img src={recipe.image} alt={recipe.title} />
              <p dangerouslySetInnerHTML={{ __html: recipe.summary }}></p>
              <p>Ready in {recipe.readyInMinutes} minutes</p>
              <p>Servings: {recipe.servings}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}