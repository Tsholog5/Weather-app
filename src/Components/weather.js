import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './weather.css';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [nearbyCities, setNearbyCities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: null, lon: null });

  const apiKey = '93d2d9f9fa0087b01046cac68d940378';

  const fetchWeather = async (lat, lon) => {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const weatherResponse = await axios.get(weatherUrl);
      const forecastResponse = await axios.get(forecastUrl);

      setWeather(weatherResponse.data);

      const groupedForecast = forecastResponse.data.list.reduce((acc, curr) => {
        const date = curr.dt_txt.split(' ')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(curr);
        return acc;
      }, {});

      const dailyForecast = Object.keys(groupedForecast).map((date) => {
        const dayData = groupedForecast[date][0];
        return {
          date,
          temp: dayData.main.temp,
          description: dayData.weather[0].description,
          icon: dayData.weather[0].icon,
        };
      });

      setForecast(dailyForecast.slice(0, 5));

      const hourlyForecast = forecastResponse.data.list
        .filter((item) => new Date(item.dt_txt).getMinutes() === 0)
        .slice(0, 5); 

      setHourlyData(hourlyForecast);

      const nearbyCitiesUrl = `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=6&appid=${apiKey}&units=metric`;
      const nearbyCitiesResponse = await axios.get(nearbyCitiesUrl);
      
      const filteredCities = nearbyCitiesResponse.data.list.filter(
        (c) => c.name.toLowerCase() !== weatherResponse.data.name.toLowerCase()
      );

      setNearbyCities(filteredCities);

      setError('');
    } catch (err) {
      setError('Unable to fetch weather data.');
      setWeather(null);
      setForecast([]);
      setHourlyData([]);
      setNearbyCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const weatherResponse = await axios.get(weatherUrl);
      const forecastResponse = await axios.get(forecastUrl);

      setWeather(weatherResponse.data);

      const groupedForecast = forecastResponse.data.list.reduce((acc, curr) => {
        const date = curr.dt_txt.split(' ')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(curr);
        return acc;
      }, {});

      const dailyForecast = Object.keys(groupedForecast).map((date) => {
        const dayData = groupedForecast[date][0];
        return {
          date,
          temp: dayData.main.temp,
          description: dayData.weather[0].description,
          icon: dayData.weather[0].icon,
        };
      });

      setForecast(dailyForecast.slice(0, 5));

      const hourlyForecast = forecastResponse.data.list
        .filter((item) => new Date(item.dt_txt).getMinutes() === 0)
        .slice(0, 5); 

      setHourlyData(hourlyForecast);

      const nearbyCitiesUrl = `https://api.openweathermap.org/data/2.5/find?q=${city}&cnt=6&appid=${apiKey}&units=metric`;
      const nearbyCitiesResponse = await axios.get(nearbyCitiesUrl);

      const filteredCities = nearbyCitiesResponse.data.list.filter(
        (c) => c.name.toLowerCase() !== city.toLowerCase()
      );

      setNearbyCities(filteredCities);

      setError('');
    } catch (err) {
      setError('City not found or invalid API key.');
      setWeather(null);
      setForecast([]);
      setHourlyData([]);
      setNearbyCities([]);
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

      {loading && <p className="loading">Loading...</p>}
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

      {hourlyData.length > 0 && (
        <div className="hourly-data">
          <h2>Hourly Weather</h2>
          <div className="hourly-list">
            {hourlyData.map((hour, index) => (
              <div key={index} className="hourly-item">
                <p>{new Date(hour.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <img
                  src={`http://openweathermap.org/img/wn/${hour.weather[0].icon}.png`}
                  alt={hour.weather[0].description}
                  className="hourly-icon"
                />
                <p>{hour.weather[0].description}</p>
                <p>Temp: {hour.main.temp} °C</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast">
          <h2>5-Day Forecast</h2>
          <div className="forecast-list">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-item">
                <p>{new Date(day.date).toLocaleDateString()}</p>
                <img
                  src={`http://openweathermap.org/img/wn/${day.icon}.png`}
                  alt={day.description}
                  className="forecast-icon"
                />
                <p>{day.description}</p>
                <p>{day.temp} °C</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {nearbyCities.length > 0 && (
        <div className="nearby-cities">
          <h2>Weather in Nearby Cities</h2>
          <div className="city-cards">
            {nearbyCities.map((city, index) => (
              <div key={index} className="city-card">
                <h3>{city.name}</h3>
                <img
                  src={`http://openweathermap.org/img/wn/${city.weather[0].icon}.png`}
                  alt={city.weather[0].description}
                  className="city-weather-icon"
                />
                <p>{city.weather[0].description}</p>
                <p>Temperature: {city.main.temp} °C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
