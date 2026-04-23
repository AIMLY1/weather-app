const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const message = document.getElementById("message");

searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});

async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    message.textContent = "Please enter a city.";
    cityName.textContent = "";
    temperature.textContent = "";
    description.textContent = "";
    return;
  }

  message.textContent = "Loading weather...";
  cityName.textContent = "";
  temperature.textContent = "";
  description.textContent = "";

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      message.textContent = "City not found.";
      return;
    }

    const location = geoData.results[0];
    const lat = location.latitude;
    const lon = location.longitude;

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
    );
    const weatherData = await weatherResponse.json();

    const currentTemp = weatherData.current.temperature_2m;
    const weatherCode = weatherData.current.weather_code;

    cityName.textContent = `${location.name}, ${location.country}`;
    temperature.textContent = `Temperature: ${currentTemp}°F`;
    description.textContent = `Condition: ${getWeatherDescription(weatherCode)}`;
    message.textContent = "";
  } catch (error) {
    message.textContent = "Something went wrong. Please try again.";
    cityName.textContent = "";
    temperature.textContent = "";
    description.textContent = "";
    console.error(error);
  }
}

function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
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