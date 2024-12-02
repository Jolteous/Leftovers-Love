"use client";

import React, { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { RecipeDetail } from "@/types";
import sanitizeHtml from "sanitize-html";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/Spinner";

export default function RecipePage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getRecipeDetail = async (id: string) => {
      try {
        const res = await fetch(`/api/recipes/ids?ids=${id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch recipe");
        }

        const data: RecipeDetail[] = await res.json();
        setRecipe(data[0] || null);
      } catch (error) {
        console.error(error);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getRecipeDetail(id);
    }
  }, [id]);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <Spinner size={4} />
        </div>
    );
  }

  if (!recipe) {
    notFound();
    return null;
  }

  const sanitizedSummary = sanitizeHtml(recipe.summary, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
    allowedAttributes: {
      a: ["href", "target"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        };
      },
    },
  });

  const sanitizedInstructions = sanitizeHtml(recipe.instructions, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
  });

  return (
      <ScrollArea className="p-6 h-full bg-white rounded-lg shadow-md">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
            {recipe.title}
          </h1>
          <img
              src={recipe.image}
              alt={recipe.title}
              className="mb-6 w-full max-w-md rounded-lg shadow-lg mx-auto"
          />
          <p
              className="text-base leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
          ></p>
          <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
            Instructions
          </h3>
          {sanitizedInstructions ? (
              <div
                  className="text-base leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{ __html: sanitizedInstructions }}
              ></div>
          ) : recipe.analyzedInstructions &&
          recipe.analyzedInstructions.length > 0 ? (
              <ol className="list-decimal list-inside space-y-2">
                {recipe.analyzedInstructions[0].steps.map((step) => (
                    <li key={step.number} className="text-base text-gray-700">
                      {step.step}
                    </li>
                ))}
              </ol>
          ) : (
              <p className="text-base text-gray-700">No instructions available.</p>
          )}
        </div>
      </ScrollArea>
  );
}