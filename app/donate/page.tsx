"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import foodbanks from "@/data/foodbanks.json";

import React, { useState, useEffect, useRef } from "react";

export default function Donate() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoodBanks = async () => {
      const res = await fetch("/api/settings/get", {
        method: "GET",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch ingredients");
      }
      const data = await res.json();
      console.log(data);
      setLongitude(data.longitude);
      setLatitude(data.latitute);

      const results = await fetch("/api/foodbanks/nearby", {
        method: "POST",
        body: JSON.stringify({
          latitude: data.latitute,
          longitude: data.longitude,
        }),
      });
      const foodbanks = await results.json();
    };

    setLoading(false);

    fetchFoodBanks();
  }, []);

  return (
    <main className="flex-col h-full justify-center bg-gray-100">
        <div className={"text-center font-extrabold text-2xl mb-4"}>
          Nearby Food Banks
        </div>
        {!(latitude && longitude) ? (
          // Skeleton
          <div className="flex flex-col space-y-4">
            <div className="h-8 bg-gray-300 animate-pulse"></div>
            <div className="h-8 bg-gray-300 animate-pulse"></div>
            <div className="h-8 bg-gray-300 animate-pulse"></div>
          </div>
        ) : (
          <MapContainer
            center={[latitude, longitude]}
            zoom={13}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {foodbanks.map((foodbank) => (
              <Marker position={[foodbank.latitude, foodbank.longitude]} key={foodbank.name}>
                <Popup>
                  <div>
                    <div className="font-bold">{foodbank.name}</div>
                    <div>{foodbank.address}</div>
                    <div>{foodbank.phone}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
    </main>
  );
}
