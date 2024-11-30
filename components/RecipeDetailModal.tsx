import { RecipeDetail } from '@/types';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'; // Ensure DialogHeader is imported
import { Button } from '@/components/ui/button';
import Link from "next/link";
import sanitizeHtml from "sanitize-html";

interface RecipeDetailModalProps {
    recipe: RecipeDetail;
    isOpen: boolean;
    onClose: () => void;
}

export default function RecipeDetailModal({
                                              recipe,
                                              isOpen,
                                              onClose,
                                          }: RecipeDetailModalProps) {

    const sanitizedSummary = sanitizeHtml(recipe.summary, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
        allowedAttributes: {
            a: ['href', 'target'],
        },
        transformTags: {
            a: (tagName, attribs) => {
                return {
                    tagName: 'a',
                    attribs: {
                        ...attribs,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                    },
                };
            },
        },
    });

    const sanitizedInstructions = sanitizeHtml(recipe.instructions, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl w-full h-5/6 my-5 bg-white rounded-lg shadow-lg flex flex-col">
                <DialogHeader className="flex flex-row justify-between items-center p-6 border-b">
                    <DialogTitle className="text-2xl font-extrabold text-gray-800">
                        {recipe.title}
                    </DialogTitle>

                    <Link href={`/recipe/${recipe.id}`} passHref>
                        <Button variant="secondary">
                            Open in New Tab
                        </Button>
                    </Link>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-6">
                    <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="mb-6 w-full max-w-md rounded-lg shadow-md mx-auto"
                    />
                    <div
                        className="text-base leading-relaxed text-gray-700 mb-6"
                        dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
                    ></div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Instructions</h3>
                    {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
                        <ol className="list-decimal list-inside space-y-2">
                            {recipe.analyzedInstructions[0].steps.map((step) => (
                                <li key={step.number} className="text-base text-gray-700">
                                    {step.step}
                                </li>
                            ))}
                        </ol>
                    ) : sanitizedInstructions ? (
                        <div className="text-base leading-relaxed text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizedInstructions }}></div>
                    ) : (
                        <p className="text-base text-gray-700">No instructions available.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
