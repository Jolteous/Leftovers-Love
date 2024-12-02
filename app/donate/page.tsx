"use client";
import Plot  from "react-plotly.js";

import foodbanks from "@/data/foodbanks.json";

import React, { useState, useEffect} from "react";

export default function Donate() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [, setLoading] = useState(true);

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
          // Plot food banks on map
          <Plot
            data={[
              {
                type: "scattermapbox",
                lat: foodbanks.map((fb) => fb.latitude),
                lon: foodbanks.map((fb) => fb.longitude),
                mode: "markers",
                marker: {
                  size: 14,
                  color: "blue",
                },
                text: foodbanks.map((fb) => `${fb.name}<br>${fb.address}<br>${fb.phone}`),
              },
            ]}
            layout={{
              autosize: true,
              mapbox: {
                style: "open-street-map",
                center: {
                  lat: latitude,
                  lon: longitude,
                },
                zoom: 12,
              },
              margin: { t: 0, b: 0, l: 0, r: 0 },
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: "500px" }}
          />
        )}
    </main>
  );
}
