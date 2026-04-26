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
const loader = document.getElementById("loader");

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") getWeather();
});

locationBtn.addEventListener("click", function () {
  if (!navigator.geolocation) {
    message.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  message.textContent = "Getting your location...";
  loader.style.display = "block";
  clearWeather();

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      await getWeatherByCoords(lat, lon, "Your Location");
    },
    function () {
      message.textContent =
        "Unable to retrieve your location. Please allow location access.";
      loader.style.display = "none";
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

  message.textContent = "";
  loader.style.display = "block";
  clearWeather();

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      message.textContent = "City not found.";
      loader.style.display = "none";
      return;
    }

    const lat = geoData.results[0].latitude;
    const lon = geoData.results[0].longitude;
    const name = geoData.results[0].name;
    const country = geoData.results[0].country;

    await getWeatherByCoords(lat, lon, `${name}, ${country}`);
  } catch (error) {
    message.textContent = "Something went wrong. Please try again.";
    loader.style.display = "none";
    console.error(error);
  }
}

async function getWeatherByCoords(lat, lon, displayName) {
  message.textContent = "Loading weather...";
  clearWeather();

  try {
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&timezone=auto`
    );

    const weatherData = await weatherResponse.json();

    const currentTemp = weatherData.current.temperature_2m;
    const feelsLike = weatherData.current.apparent_temperature;
    const weatherCode = weatherData.current.weather_code;

    updateBackground(weatherCode);

    const maxTemp = weatherData.daily.temperature_2m_max[0];
    const minTemp = weatherData.daily.temperature_2m_min[0];

    const weatherText = getWeatherDescription(weatherCode);
    const icon = getWeatherIcon(weatherCode);

    cityName.textContent = displayName;
    weatherIcon.textContent = icon;
    temperature.textContent = `Temp: ${currentTemp}°F (Feels like ${feelsLike}°F)`;
    highLow.textContent = `High: ${maxTemp}°F / Low: ${minTemp}°F`;
    description.textContent = `Condition: ${weatherText}`;
    message.textContent = "";
    loader.style.display = "none";

    showForecast(weatherData);
  } catch (error) {
    message.textContent = "Something went wrong. Please try again.";
    clearWeather();
    loader.style.display = "none";
    console.error(error);
  }
}

function updateBackground(code) {
  const bg = document.getElementById("bg-animation");
  const rainContainer = document.getElementById("rain-container");

  if (!bg) {
    console.error("bg-animation not found");
    return;
  }

  bg.className = "";

  if (rainContainer) rainContainer.innerHTML = "";

  const night = isNight();

  if (code === 0 && !night) {
    bg.classList.add("sunny");
  } else if (night && code === 0) {
    bg.classList.add("night");
  } else if ([1, 2, 3, 45, 48].includes(code)) {
    bg.classList.add(night ? "night" : "cloudy");
  } else if (code === 95) {
    bg.classList.add("rain", "lightning");
    createRain();
  } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    bg.classList.add("rain");
    createRain();
  } else {
    bg.classList.add(night ? "night" : "cloudy");
  }

  console.log("Weather code:", code);
  console.log("Background class:", bg.className);
}

function createRain() {
  const container = document.getElementById("rain-container");

  if (!container) {
    console.error("rain-container not found");
    return;
  }

  container.innerHTML = "";

  for (let i = 0; i < 80; i++) {
    const drop = document.createElement("div");
    drop.classList.add("raindrop");
    drop.style.left = Math.random() * 100 + "vw";
    drop.style.animationDuration = 0.5 + Math.random() + "s";
    drop.style.animationDelay = Math.random() * 2 + "s";
    container.appendChild(drop);
  }
}

function isNight() {
  const hour = new Date().getHours();
  return hour < 7 || hour > 18;
}

function showForecast(weatherData) {
  forecast.innerHTML = "<h3>5-Day Forecast</h3>";

  for (let i = 0; i < 5; i++) {
    const date = weatherData.daily.time[i];
    const max = weatherData.daily.temperature_2m_max[i];
    const min = weatherData.daily.temperature_2m_min[i];
    const code = weatherData.daily.weather_code[i];
    const icon = getWeatherIcon(code);

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });

    forecast.innerHTML += `
      <div class="forecast-card" style="animation-delay: ${i * 0.15}s">
        <p>${formattedDate}</p>
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

navigator.geolocation.getCurrentPosition(async (position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  await getWeatherByCoords(lat, lon, "Your Location");
});