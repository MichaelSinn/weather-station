/* 
  TODO:
    - Search history
    - High/low temps for forecast
    - Style page
*/

const apiKey = "4525e4c4d6900be2e3932d311208c64e";

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
      console.log(data);
      // Process all of the data here and append it to the page
      switch (type) {
        case "forecast": // 120 hours of weather split into 3 hour segments
          let dailyWeather = [];
          let currentDay = [];
          // Split the data into separate days
          data.list.forEach((e) => {
            if (currentDay.length === 0) {
              currentDay.push(e);
            } else {
              if (
                currentDay[currentDay.length - 1].dt_txt.split(" ")[0] !==
                e.dt_txt.split(" ")[0]
              ) {
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
            weatherDate = new Date(e[4].dt * 1000).toJSON().split("T")[0];
            weatherIcon = e[4].weather[0].icon;

            weather = e[4].weather[0].description; // Mode
            windSpeed = e[4].wind.speed; // Mean
            humidity = e[4].main.humidity; // Mode
            temperatureRange = `Low ${Math.round(e[4].main.temp_min)}°C / High ${Math.round(e[4].main.temp_max)}°C`

            let weatherCard = $("<article>");
            let dateEl = $("<h3>");
            let weatherListEl = $("<ul>");
            let weatherEl = $("<li>");
            let iconEl = $("<img>");
            let windSpeedEl = $("<li>");
            let humidityEl = $("<li>");
            let temperatureRangeEl = $("<li>");
            let fiveDayForecastEl = $("#five-day-forcast");

            dateEl.text(weatherDate);
            weatherEl.text(weather);
            windSpeedEl.text(windSpeed + "km/h");
            humidityEl.text(humidity + "%");
            temperatureRangeEl.text(temperatureRange);
            iconEl.attr("src", `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`);

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

          break;

        case "weather": // Current weather
          let currentTemp = Math.round(data.main.temp);
          let cityName = data.name;
          weatherDate = new Date(data.dt * 1000).toJSON().split("T")[0];
          weather = data.weather[0].description;
          weatherIcon = data.weather[0].icon;
          windSpeed = data.wind.speed;
          humidity = data.main.humidity;
          temperatureRange = `Low ${Math.round(data.main.temp_min)}°C / High ${Math.round(data.main.temp_max)}°C`
          
          let weatherCard = $("<article>");
          let cityNameEl = $("<h2>");
          let dateEl = $("<h3>");
          let weatherListEl = $("<ul>");
          let weatherEl = $("<li>");
          let iconEl = $("<img>");
          let windSpeedEl = $("<li>");
          let humidityEl = $("<li>");
          let temperatureRangeEl = $("<li>");
          let todaysForecastEl = $("#todays-forecast");
          let currentTempEl = $("<li>");

          cityNameEl.text(cityName);
          currentTempEl.text(currentTemp + "°C");
          dateEl.text(weatherDate);
          weatherEl.text(weather);
          windSpeedEl.text(windSpeed + "km/h");
          humidityEl.text(humidity + "%");
          temperatureRangeEl.text(temperatureRange);
          iconEl.attr("src", `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`);

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
          break;
      }
    });
}

function getCoords(cityName, provinceCode, countryCode) {
  const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${provinceCode},${countryCode}&limit=5&appid=${apiKey}`;
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      if (data.length === 0){
        console.log("No results.")
        return;
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

getCoords("oakville", "on", "ca");
// getWeather("43.46", "-79.66", "forecast"); // Current Weather
