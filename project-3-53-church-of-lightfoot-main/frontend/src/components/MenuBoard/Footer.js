import React, { useEffect, useState } from "react";
import "../../routes/MenuBoard.css";
import { ReactComponent as MoonSvg } from "./svgs/dark_mode_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg";
import { ReactComponent as CloudSvg } from "./svgs/filter_drama_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg";
import { ReactComponent as SunSvg} from "./svgs/brightness_5_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg";

/**
 * Footer Component
 * @description Displays the current weather forecast, temperature, and time. 
 * Fetches weather data using the National Weather Service API and updates the time every second.
 *
 * @component
 * 
 * @returns {React.JSX.Element} A React component representing a weather widget and clock.
 */
const Footer = () => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  const latitude = 30.601389;
  const longitude = -96.3344;

    /**
   * isDayTime
   * @description Determines whether the current time is during the day or night.
   *
   * @function
   * @returns {boolean} True if it is daytime (6:00 AM to 6:00 PM), false otherwise.
   */
  const isDayTime = () => {
    const hours = new Date().getHours();
    return hours >= 6 && hours < 18; // Daytime is between 6:00 AM and 6:00 PM
  };

  useEffect(() => {
      /**
   * fetchWeather
   * @description Fetches weather data using the National Weather Service API based on the specified latitude and longitude.
   * First, it retrieves the forecast URL from the API using the point lookup endpoint, and then fetches the forecast data
   * for the current period (e.g., today's forecast). Updates the `weather` state with the fetched forecast data.
   *
   * @async
   * @function fetchWeather
   * 
   * @throws {Error} Throws an error if the location data or forecast data fails to fetch.
   */
    const fetchWeather = async () => {
      try {
        // Step 1: Get the forecast URL
        const pointResponse = await fetch(
          `https://api.weather.gov/points/${latitude},${longitude}`
        );
        if (!pointResponse.ok) throw new Error("Failed to fetch location data");

        const pointData = await pointResponse.json();
        const forecastUrl = pointData.properties.forecast;

        // Step 2: Use the forecast URL to get the weather data
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok)
          throw new Error("Failed to fetch forecast data");

        const forecastData = await forecastResponse.json();
        const currentPeriod = forecastData.properties.periods[0]; // Get the current period (today's forecast)

        setWeather(currentPeriod);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  setInterval(() => {
    setTime(new Date().toLocaleTimeString());
  }, 1000);

  // Conditional rendering to avoid null errors
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!weather) {
    return <div className="loading">Loading weather data...</div>;
  }

  return (
    <div className={`weather-widget ${isDayTime() ? "day" : "night"}`}>
      {isDayTime() ? (
        <SunSvg className="sun" />
      ) : (
        <MoonSvg className="moon" />
      )}      
    <div className="cloud-container">
        <CloudSvg className="cloud" />
      </div>
      <div className="temperature">
        Weather: {weather.temperature}°{weather.temperatureUnit}
      </div>
      <div className="text-lg">{weather.shortForecast} </div>
      <div className="text-lg">{time}</div>
    </div>
  );
};

export default Footer;
