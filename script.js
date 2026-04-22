const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

searchBtn.addEventListener("click", function() {
  const city = cityInput.value;
  console.log(city);
});