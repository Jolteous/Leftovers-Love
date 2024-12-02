import React, { useState } from 'react';

interface AddIngredientsButtonProps {
    onIngredientsUpdated: (ingredients: string[]) => void;
    initialIngredients: string[];
}

const AddIngredientsButton: React.FC<AddIngredientsButtonProps> = ({ onIngredientsUpdated, initialIngredients }) => {
    const [ingredients, setIngredients] = useState<string[]>(initialIngredients);

    const handleAddIngredient = (newIngredient: string) => {
        setIngredients((prevIngredients: string[]) => {
            const updatedIngredients = [...prevIngredients, newIngredient];
            onIngredientsUpdated(updatedIngredients);
            return updatedIngredients;
        });
    };

    return (
        <div>
            {ingredients.map((ingredient: string, index: number) => (
                <div key={index}>{ingredient}</div>
            ))}
            <button onClick={() => handleAddIngredient('New Ingredient')}>Add Ingredient</button>
        </div>
    );
};

export default AddIngredientsButton;