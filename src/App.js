// src/App.js
import React, { useState } from "react";
import "./styles.css";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeather = async () => {
    const q = city.trim();
    if (!q) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);
    setPlace(null);

    try {
      // 1) Geocoding: get lat/lon by city name
      const geoResp = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          q
        )}&count=1`
      );
      const geoJson = await geoResp.json();

      if (!geoJson.results || geoJson.results.length === 0) {
        setError("City not found. Try a different name.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoJson.results[0];
      setPlace(`${name}${country ? ", " + country : ""}`);

      // 2) Weather: fetch current weather (Open-Meteo)
      const weatherResp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherJson = await weatherResp.json();

      if (!weatherJson.current_weather) {
        setError("Weather data not available for this location.");
      } else {
        setWeather({
          ...weatherJson.current_weather,
          latitude,
          longitude,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") getWeather();
  };

  return (
    <div className="app">
      <div className="card">
        <h1 className="title">🌤 Weather Now - By VedikaToke</h1>

        <div className="controls">
          <input
            type="text"
            placeholder="Enter city (e.g., Mumbai)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKey}
            className="input"
            autoFocus
          />
          <button onClick={getWeather} className="btn">
            Get Weather
          </button>
        </div>

        {loading && <p className="info">Loading…</p>}
        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weatherCard">
            <h2 className="place">{place}</h2>
            <p>
              <strong>Temperature:</strong> {weather.temperature}°
            </p>
            <p>
              <strong>Wind speed:</strong> {weather.windspeed}
            </p>
            <p>
              <strong>Direction:</strong> {weather.winddirection}°
            </p>
            <p>
              <strong>Time:</strong> {weather.time}
            </p>
            <p className="small">
              (Lat: {weather.latitude}, Lon: {weather.longitude})
            </p>
          </div>
        )}
      </div>

      <footer className="footer">
        Data: Open-Meteo (geocoding + current_weather)
      </footer>
    </div>
  );
}
