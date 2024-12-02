"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [, setOriginalEmail] = useState<string | null>(null);
  const [originalLatitute, setOriginalLatitute] = useState<string | null>(null);
  const [originalLongitude, setOriginalLongitude] = useState<string | null>(
    null
  );
  const [email, setEmail] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    if (originalLatitute && originalLongitude) {
      const fetchAddress = async () => {
        const res = await fetch("/api/geo/address", {
          method: "POST",
          body: JSON.stringify({
            latitute: originalLatitute,
            longitude: originalLongitude,
          }),
        });
        const data = await res.json();
        setAddress(data["display_name"]);
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
        setEmail(data.email)
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const geoRes = await fetch("/api/geo/coords", {
        method: "POST",
        body: JSON.stringify({
          address: address
        }),
      });
      const geoData = await geoRes.json();
      const latitute = parseFloat(geoData[0].lat)
      const longitude = parseFloat(geoData[0].lon)

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
    setAddress(e.target.value);
  };

  return (
    <main className="flex h-full justify-center bg-gray-100">
      <div className="w-full h-full">
        <div className={"text-center font-extrabold text-2xl mb-4"}>
          User Settings
        </div>
        <div className="flex flex-col p-4">
          <label className="text-gray-600 italic mb-1">Email</label>
          <Input
            id="email"
            value={email || "Loading"}
            disabled={email === null}
            onChange={handleEmailChange}
          />
          <label className="text-gray-600 italic mt-2 mb-1">Address</label>
          <Input
            id="address"
            value={loading ? "Loading" : address || ""}
            placeholder="Enter your address"
            onChange={handleAddressChange}
            disabled={loading}
            className="mb-4"
          />
          <Button onClick={handleSave}>{saving ? "Savivng..." : "Save"}</Button>
        </div>
      </div>
    </main>
  );
}
