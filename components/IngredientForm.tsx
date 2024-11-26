import { FormEvent, useRef, ChangeEvent } from 'react';
import {Suggestion} from "@/types";

interface IngredientFormProps {
    ingredients: string;
    setIngredients: (ingredients: string) => void;
    handleSubmit: (e: FormEvent) => void;
    suggestions: Suggestion[];
    handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSuggestionClick: (suggestion: Suggestion) => void;
}

export default function IngredientForm({
                                           ingredients,
                                           setIngredients,
                                           handleSubmit,
                                           suggestions,
                                           handleInputChange,
                                           handleSuggestionClick,
                                       }: IngredientFormProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <section className="mb-5">
            <h2>Choose your ingredients</h2>
            <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
                <input
                    type="text"
                    value={ingredients}
                    onChange={handleInputChange}
                    placeholder="Enter ingredients separated by commas"
                    ref={inputRef}
                    className="p-2 text-lg border rounded-md"
                />
                <button
                    type="submit"
                    className="p-2 text-lg bg-blue-500 text-white rounded-md"
                >
                    Find Recipes
                </button>
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full z-10 bg-white border max-h-36 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="p-2 cursor-pointer hover:bg-gray-200"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion.name}
                            </div>
                        ))}
                    </div>
                )}
            </form>
        </section>
    );
}