import React, { useState } from 'react';

const AddIngredientsButton = ({ onIngredientsUpdated, initialIngredients }) => {
    const [ingredients, setIngredients] = useState(initialIngredients);

    const handleAddIngredient = (newIngredient) => {
        setIngredients((prevIngredients) => {
            const updatedIngredients = [...prevIngredients, newIngredient];
            onIngredientsUpdated(updatedIngredients);
            return updatedIngredients;
        });
    };

    return (
        <div>
            {ingredients.map((ingredient, index) => (
                <div key={index}>{ingredient}</div>
            ))}
            <button onClick={() => handleAddIngredient('New Ingredient')}>Add Ingredient</button>
        </div>
    );
};

export default AddIngredientsButton;
