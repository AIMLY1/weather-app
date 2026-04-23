const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

searchBtn.addEventListener("click", async function () {
  const city = cityInput.value.trim();

  if (!city) {
    cityName.textContent = "Please enter a city.";
    temperature.textContent = "";
    description.textContent = "";
    return;
  }

  try {
    // 1. Get city coordinates from Open-Meteo Geocoding API
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      cityName.textContent = "City not found.";
      temperature.textContent = "";
      description.textContent = "";
      return;
    }

    const location = geoData.results[0];
    const lat = location.latitude;
    const lon = location.longitude;

    // 2. Get current weather from Open-Meteo Forecast API
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
    );
    const weatherData = await weatherResponse.json();

    const currentTemp = weatherData.current.temperature_2m;
    const weatherCode = weatherData.current.weather_code;

    // 3. Convert weather code into readable text
    const weatherText = getWeatherDescription(weatherCode);

    // 4. Display on page
    cityName.textContent = `${location.name}, ${location.country}`;
    temperature.textContent = `Temperature: ${currentTemp}°F`;
    description.textContent = `Condition: ${weatherText}`;
  } catch (error) {
    cityName.textContent = "Something went wrong.";
    temperature.textContent = "";
    description.textContent = "";
    console.error(error);
  }
});

// Weather code helper
function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm"
  };

  return weatherCodes[code] || "Unknown weather";
}