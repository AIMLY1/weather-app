const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const locationBtn = document.getElementById("locationBtn");

const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const highLow = document.getElementById("highLow");
const description = document.getElementById("description");
const message = document.getElementById("message");
const forecast = document.getElementById("forecast");

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});

locationBtn.addEventListener("click", function () {
  if (!navigator.geolocation) {
    message.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  message.textContent = "Getting your location...";

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      await getWeatherByCoords(lat, lon, "Your Location");
    },
    function () {
      message.textContent = "Unable to retrieve your location. Please allow location access.";
    }
  );
});

async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    message.textContent = "Please enter a city.";
    clearWeather();
    return;
  }

  message.textContent = "Loading weather...";
  clearWeather();

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      message.textContent = "City not found.";
      return;
    }

    const lat = geoData.results[0].latitude;
    const lon = geoData.results[0].longitude;
    const name = geoData.results[0].name;

    await getWeatherByCoords(lat, lon, name);
  } catch (error) {
    message.textContent = "Something went wrong. Please try again.";
    console.error(error);
  }
}

async function getWeatherByCoords(lat, lon, displayName) {
  message.textContent = "Loading weather...";
  clearWeather();

  try {
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&timezone=auto`
    );

    const weatherData = await weatherResponse.json();

    const currentTemp = weatherData.current.temperature_2m;
    const weatherCode = weatherData.current.weather_code;
    const maxTemp = weatherData.daily.temperature_2m_max[0];
    const minTemp = weatherData.daily.temperature_2m_min[0];

    const weatherText = getWeatherDescription(weatherCode);
    const icon = getWeatherIcon(weatherCode);

    cityName.textContent = displayName;
    weatherIcon.textContent = icon;
    temperature.textContent = `Temperature: ${currentTemp}°F`;
    highLow.textContent = `High: ${maxTemp}°F / Low: ${minTemp}°F`;
    description.textContent = `Condition: ${weatherText}`;
    message.textContent = "";

    updateBackground(weatherCode);
    showForecast(weatherData);
  } catch (error) {
    message.textContent = "Something went wrong. Please try again.";
    clearWeather();
    console.error(error);
  }
}

function showForecast(weatherData) {
  forecast.innerHTML = "<h3>5-Day Forecast</h3>";

  for (let i = 0; i < 5; i++) {
    const date = weatherData.daily.time[i];
    const max = weatherData.daily.temperature_2m_max[i];
    const min = weatherData.daily.temperature_2m_min[i];
    const code = weatherData.daily.weather_code[i];
    const icon = getWeatherIcon(code);

    forecast.innerHTML += `
      <div class="forecast-card">
        <p>${date}</p>
        <p>${icon}</p>
        <p>High: ${max}°F</p>
        <p>Low: ${min}°F</p>
      </div>
    `;
  }
}

function clearWeather() {
  cityName.textContent = "";
  weatherIcon.textContent = "";
  temperature.textContent = "";
  highLow.textContent = "";
  description.textContent = "";
  forecast.innerHTML = "";
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

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75].includes(code)) return "❄️";
  if (code === 95) return "⛈️";
  return "🌍";
}

function updateBackground(code) {
  if (code === 0) {
    document.body.style.background = "#ffe8a3";
  } else if (code === 1 || code === 2) {
    document.body.style.background = "#d6ecff";
  } else if (code === 3 || code === 45 || code === 48) {
    document.body.style.background = "#cfd8dc";
  } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    document.body.style.background = "#b3d1ff";
  } else if ([71, 73, 75].includes(code)) {
    document.body.style.background = "#eef7ff";
  } else if (code === 95) {
    document.body.style.background = "#9aa5b1";
  } else {
    document.body.style.background = "#f0f8ff";
  }
}