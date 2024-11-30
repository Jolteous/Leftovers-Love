import { useState, useEffect } from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Ingredient {
    id: number;
    name: string;
    image: string;
}

interface AddIngredientsButtonProps {
    onIngredientsUpdated: (ingredients: string[]) => void;
    initialIngredients: string[];
}

export default function AddIngredientsButton({
                                                 onIngredientsUpdated,
                                                 initialIngredients,
                                             }: AddIngredientsButtonProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

    // Update selectedIngredients when initialIngredients changes
    useEffect(() => {
        setSelectedIngredients(initialIngredients);
    }, [initialIngredients]);

    useEffect(() => {
        if (searchTerm.length > 0) {
            const fetchSuggestions = async () => {
                try {
                    const res = await fetch(`/api/ingredients/autocomplete?query=${encodeURIComponent(searchTerm)}`);
                    if (!res.ok) {
                        throw new Error('Failed to fetch suggestions');
                    }
                    const data = await res.json();
                    setSuggestions(data);
                } catch (error) {
                    console.error(error);
                }
            };
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [searchTerm]);

    const handleSelectSuggestion = (ingredient: Ingredient) => {
        if (!selectedIngredients.includes(ingredient.name)) {
            setSelectedIngredients([...selectedIngredients, ingredient.name]);
        }
        setSearchTerm('');
        setSuggestions([]);
    };

    const handleRemoveIngredient = (ingredientName: string) => {
        setSelectedIngredients(selectedIngredients.filter((name) => name !== ingredientName));
    };

    const handleSave = async () => {
        try {
            const ingredientsStr = selectedIngredients.join(',');
            const res = await fetch(`/api/ingredients/set?ingredients=${encodeURIComponent(ingredientsStr)}`, {
                method: 'POST',
            });
            if (!res.ok) {
                throw new Error('Failed to set ingredients');
            }
            onIngredientsUpdated(selectedIngredients);
            setOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Edit Ingredients</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit Ingredients
                    </DialogTitle>
                </DialogHeader>
                <div className="mb-2">
                    <div className="mb-2">
                        <Input
                            placeholder="Search ingredients"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {suggestions.length > 0 && (
                            <ul className="border rounded mt-1 max-h-40 overflow-y-auto">
                                {suggestions.map((ingredient) => (
                                    <li
                                        key={ingredient.id}
                                        className="p-2 cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSelectSuggestion(ingredient)}
                                    >
                                        {ingredient.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold">Selected Ingredients:</h3>
                        {selectedIngredients.length > 0 ? (
                            <ul className="mt-2">
                                {selectedIngredients.map((ingredientName) => (
                                    <li key={ingredientName} className="flex items-center justify-between">
                                        <span>{ingredientName}</span>
                                        <Button variant="ghost" size="sm"
                                                onClick={() => handleRemoveIngredient(ingredientName)}>
                                            Remove
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No ingredients selected.</p>
                        )}
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button variant="default" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}