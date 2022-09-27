/*
  TODO:
    - Style page
    - Handling multiple cities being returned
    - Remove getAverage function
*/
const apiKey = "4525e4c4d6900be2e3932d311208c64e";
const searchButton = $("#search-button");
const searchHistoryListEl = $("#search-history");
let searchHistory;

function getWeather(lat, lon, type) {
  const apiKey = "4525e4c4d6900be2e3932d311208c64e";
  const apiUrl = `https://api.openweathermap.org/data/2.5/${type}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let temperatureRange;
      let humidity;
      let windSpeed;
      let weather;
      let weatherDate;
      let weatherIcon;
      // Reset all the weather cards

      // Process all the data here and append it to the page
      if (type === "forecast") {// 120 hours of weather split into 3 hour segments
        const fiveDayForecastEl = $("#five-day-forcast");
        fiveDayForecastEl.html("");
        let dailyWeather = [];
        let currentDay = [];
        // Split the data into separate days
        data.list.forEach((e) => {
          if (currentDay.length === 0) {
            currentDay.push(e);
          } else {
            if (currentDay[currentDay.length - 1].dt_txt.split(" ")[0] !== e.dt_txt.split(" ")[0]) {
              dailyWeather.push(currentDay);
              currentDay = [e];
            } else {
              currentDay.push(e);
            }
          }
        });
        if (currentDay.length !== 0) dailyWeather.push(currentDay);
        if (dailyWeather.length > 5) dailyWeather.shift();

        console.log(dailyWeather);

        dailyWeather.forEach((e) => {
          // Process each day's weather and add it to the respective card

          // TODO: Iterate over each of the hour segments for each day in order to find the averages and high/low temps etc
          weatherDate = new Date(e[0].dt * 1000).toJSON().split("T")[0];
          if (e[5]) {
            weatherIcon = e[5].weather[0].icon;

            weather = e[5].weather[0].description; // Mode
            windSpeed = e[5].wind.speed; // Mean
            humidity = e[5].main.humidity; // Mode
          } else {
            weatherIcon = e[0].weather[0].icon;

            weather = e[0].weather[0].description; // Mode
            windSpeed = e[0].wind.speed; // Mean
            humidity = e[0].main.humidity; // Mode
          }
          let temperatureRangeData = getMaxMinTemperature(e);
          temperatureRange = `Low ${temperatureRangeData.low}°C / High ${temperatureRangeData.high}°C`; // max/min

          let weatherCard = $("<article>");
          let dateEl = $("<h4>");
          let weatherListEl = $("<ul>");
          let weatherEl = $("<li>");
          let iconEl = $("<img alt='Weather icon'>");
          let windSpeedEl = $("<li>");
          let humidityEl = $("<li>");
          let temperatureRangeEl = $("<li>");

          dateEl.text(weatherDate);
          weatherEl.text(weather);
          windSpeedEl.text(windSpeed + "m/s");
          humidityEl.text(humidity + "%");
          temperatureRangeEl.text(temperatureRange);
          iconEl.attr(
              "src",
              `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`
          );

          weatherListEl.append(weatherEl);
          weatherListEl.append(windSpeedEl);
          weatherListEl.append(humidityEl);
          weatherListEl.append(temperatureRangeEl);

          weatherCard.addClass("col-12 col-md-4 col-lg-2 forcast-card");
          weatherCard.append(dateEl);
          weatherCard.append(iconEl);
          weatherCard.append(weatherListEl);

          fiveDayForecastEl.append(weatherCard);
        });

      } else if (type === "weather") {// Current weather
        const todaysForecastEl = $("#todays-forecast");
        todaysForecastEl.html("");
        let currentTemp = Math.round(data.main.temp);
        let cityName = data.name;
        weatherDate = new Date(data.dt * 1000).toJSON().split("T")[0];
        weather = data.weather[0].description;
        weatherIcon = data.weather[0].icon;
        windSpeed = data.wind.speed;
        humidity = data.main.humidity;
        temperatureRange = `Low ${Math.round(
            data.main.temp_min
        )}°C / High ${Math.round(data.main.temp_max)}°C`;

        let weatherCard = $("<article>");
        let cityNameEl = $("<h3>");
        let dateEl = $("<h4>");
        let weatherListEl = $("<ul>");
        let weatherEl = $("<li>");
        let iconEl = $("<img alt='Weather icon'>>");
        let windSpeedEl = $("<li>");
        let humidityEl = $("<li>");
        let temperatureRangeEl = $("<li>");
        let currentTempEl = $("<li>");

        cityNameEl.text(cityName);
        currentTempEl.text(currentTemp + "°C");
        dateEl.text(weatherDate);
        weatherEl.text(weather);
        windSpeedEl.text(windSpeed + "m/s");
        humidityEl.text(humidity + "%");
        temperatureRangeEl.text(temperatureRange);
        iconEl.attr(
            "src",
            `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`
        );

        weatherListEl.append(weatherEl);
        weatherListEl.append(currentTempEl);
        weatherListEl.append(windSpeedEl);
        weatherListEl.append(humidityEl);
        weatherListEl.append(temperatureRangeEl);

        weatherCard.addClass("col-12 col-md-10 col-lg-10 weather-card");
        weatherCard.append(cityNameEl);
        weatherCard.append(dateEl);
        weatherCard.append(iconEl);
        weatherCard.append(weatherListEl);

        todaysForecastEl.append(weatherCard);
      }
    });
}

function getCoords(cityName, provinceCode = "", countryCode = "") {
  const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName.trim()},${provinceCode.trim()},${countryCode.trim()}&limit=5&appid=${apiKey}`;
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.length === 0) {
        console.log("No results.");
        return;
      } else if (data.length > 1) {
        // Open and modal of some kind to choose between the cities
      }
      let lat = data[0].lat;
      let lon = data[0].lon;

      getWeather(lat, lon, "weather");
      getWeather(lat, lon, "forecast");
    });
}

function getAverage(dataList, type) {
  switch (type) {
    case "mode":
      let count = {};
      dataList.forEach((e) => {
        if (!(e in count)) {
          count[e] = 0;
        }
        count++;
      });

      let mostCommon = 0;
      let mostCommonElement;
      Object.entries(count).forEach(([key, value]) => {
        if (v > mostCommon) {
          mostCommonElement = key;
          mostCommon = value;
        }
      });

      return mostCommonElement;
    case "mean":
      let total = 0;
      dataList.forEach((e) => {
        total += e;
      });
      return total / dataList.length;
  }
  return null;
}

function getMaxMinTemperature(weatherData){
  let lowest;
  let highest;
  weatherData.forEach(e => {
    if (!lowest || !highest){
      lowest = e.main.temp_min;
      highest = e.main.temp_max;
    }
    if (e.main.temp_max > highest) highest = e.main.temp_max;
    if (e.main.temp_min < lowest) lowest = e.main.temp_min;
  })
  return {
    high: Math.round(highest),
    low: Math.round(lowest)
  };
}

function updateSearchHistory(cityName){
  searchHistory.history.unshift(cityName);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  printSearchHistory();
}

function printSearchHistory(){
  searchHistoryListEl.html("");
  searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  if (!searchHistory){ // If there is no search history
    searchHistory = {
      history: []
    };
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }
  searchHistory.history.forEach(e => {
    let searchHistoryItem = $("<li>");
    searchHistoryItem.text(e);
    searchHistoryItem.attr("class", "search-history--item");
    searchHistoryItem.on("click", function(){
      getCoords(e);
    })
    searchHistoryListEl.append(searchHistoryItem);
  });
}

searchButton.on("click", function (e) {
  e.preventDefault();
  let content = $(this).parent().children().eq(0);
  let args = content.val().split(",");
  content.val("");
  updateSearchHistory(args[0]);
  getCoords(args[0], args[1], args[2]);
});

printSearchHistory();

getCoords("toronto", "on", "ca")// Display Toronto, Ontario's weather as default weather
