// /app/page.tsx or /pages/index.tsx

"use client";

import React, { useState, useEffect } from "react";
import { RecipeDetail } from "@/types";
import RecipeCard from "@/components/RecipeCard";
import AddIngredientsButton from "@/components/AddIngredientsButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { data: session } = useSession();

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientUsage, setIngredientUsage] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [originalEmail, setOriginalEmail] = useState<string | null>(null);
  const [originalLatitute, setOriginalLatitute] = useState<string | null>(null);
  const [originalLongitude, setOriginalLongitude] = useState<string | null>(
    null
  );
  const [email, setEmail] = useState<string | null>(null);
  const [latitute, setLatitute] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (originalLatitute && originalLongitude) {
      const fetchAddress = async () => {
        const res = await fetch("/api/geo/lookup", {
          method: "POST",
          body: JSON.stringify({
            latitute: originalLatitute,
            longitude: originalLongitude,
          }),
        });
        const data = await res.json();
        setAddress(data);
        setLoading(false);
      };

      fetchAddress();
    }
  }, [originalLatitute, originalLongitude]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/get", {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch ingredients");
        }
        const data = await res.json();
        console.log(data);
        setOriginalLongitude(data.longitude);
        setOriginalLatitute(data.latitute);
        setOriginalEmail(data.email);
        if (!data.longitude || !data.latitute) {
          setLoading(false);
          setAddress("");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSettings();
  }, []);

  const handleIngredientUsageChange = (ingredient: string) => {
    setIngredientUsage((prevUsage) => ({
      ...prevUsage,
      [ingredient]: !prevUsage[ingredient],
    }));
  };

  const handleExpandClick = (recipeId: string) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/save", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          latitute: latitute,
          longitude: longitude,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fetchAddress = async () => {
      const res = await fetch("/api/geo/coords", {
        method: "POST",
        body: JSON.stringify({
          address: e.target.value,
        }),
      });
      const data = await res.json();
      setLatitute(data[0].lat);
      setLongitude(data[0].lon);
      setLoading(false);
    };
    setAddress(e.target.value);
    fetchAddress();
  };

  return (
    <main className="flex h-full justify-center bg-gray-100">
      <div className="w-full h-full">
        <div className={"text-center font-extrabold text-2xl mb-4"}>
          User Settings
        </div>
        <ScrollArea className="h-full p-4">
          <Input
            id="email"
            value={originalEmail || "Loading"}
            disabled={originalEmail === null}
            onChange={handleEmailChange}
          />
          <Input
            id="address"
            value={loading ? "Loading" : address}
            placeholder="Enter your address"
            disabled={loading}
          />
          <Button onClick={handleSave}>Save</Button>
        </ScrollArea>
      </div>
    </main>
  );
}
