import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './weather.css';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: null, lon: null });

  const apiKey = '26202288af46bbb04704022e2460f590';

  const fetchWeather = async (lat, lon) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const response = await axios.get(apiUrl);
      setWeather(response.data);
      setError('');
    } catch (err) {
      setError('Unable to fetch weather data.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await axios.get(apiUrl);
      setWeather(response.data);
      setError('');
    } catch (err) {
      setError('City not found or invalid API key.');
      setWeather(null);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lon: longitude });
          fetchWeather(latitude, longitude);
        },
        () => {
          setError('Geolocation is not supported or permission denied.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  }, []);

  return (
    <div className="weather-container">
      <h1>Weather App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <button type="submit">Get Weather</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {coords.lat && coords.lon && (
        <p className="coordinates">
          Coordinates: Lat {coords.lat.toFixed(2)}, Lon {coords.lon.toFixed(2)}
        </p>
      )}

      {weather && (
        <div className="weather-info">
          <h2>{weather.name}</h2>
          <img
            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
            alt={weather.weather[0].description}
            className="weather-icon"
          />
          <p>{weather.weather[0].description}</p>
          <p>Temperature: {weather.main.temp} °C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
};

export default Weather;
