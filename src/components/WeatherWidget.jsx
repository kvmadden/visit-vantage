import { useState, useEffect } from 'react';

const OWM_KEY = ''; // Users can add their own key
const TAMPA_LAT = 27.95;
const TAMPA_LNG = -82.46;

/**
 * Lightweight weather widget showing current conditions for Region 41.
 * Requires an OpenWeatherMap API key to function.
 * Gracefully hides if no key is configured or if fetch fails.
 */
export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const key = OWM_KEY || localStorage.getItem('visitvantage-owm-key');
    if (!key) return;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${TAMPA_LAT}&lon=${TAMPA_LNG}&units=imperial&appid=${key}`
    )
      .then((res) => {
        if (!res.ok) throw new Error('Weather fetch failed');
        return res.json();
      })
      .then((data) => {
        setWeather({
          temp: Math.round(data.main.temp),
          feels: Math.round(data.main.feels_like),
          desc: data.weather[0]?.description || '',
          icon: data.weather[0]?.icon || '01d',
          humidity: data.main.humidity,
          wind: Math.round(data.wind.speed),
        });
      })
      .catch(() => {
        // Silently fail — widget just won't show
      });
  }, []);

  if (!weather) return null;

  return (
    <div className="weather-widget">
      <img
        src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
        alt={weather.desc}
        width={28}
        height={28}
      />
      <div className="weather-info">
        <span className="weather-temp">{weather.temp}°F</span>
        <span className="weather-desc">{weather.desc}</span>
      </div>
    </div>
  );
}
