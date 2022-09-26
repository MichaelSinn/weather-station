// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history
// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, and the wind speed
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city

const apiKey = "4525e4c4d6900be2e3932d311208c64e";
// const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${stateCode},${countryCode}&limit=${limit}&appid=${apiKey}`;

function getWeather(lat, lon, type) {
  const apiKey = "4525e4c4d6900be2e3932d311208c64e";
  const apiUrl = `https://api.openweathermap.org/data/2.5/${type}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let cityName;
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
          data.list.forEach(e => {
            if (currentDay.length === 0){
              currentDay.push(e);
            }else{
              if (currentDay[currentDay.length - 1].dt_txt.split(" ")[0] !== e.dt_txt.split(" ")[0]){
                dailyWeather.push(currentDay);
                currentDay = [e];
              }else{
                currentDay.push(e);
              }
            }
          });
          if (currentDay.length !== 0) dailyWeather.push(currentDay);
          if (dailyWeather.length > 5) dailyWeather.shift();

          console.log(dailyWeather);

          dailyWeather.forEach(e => {
            // Process each day's weather and add it to the respective card

            // TODO: Iterate over each of the hour segments for each day in order to find the averages and high/low temps etc
            cityName = data.city.name;
            weatherDate = new Date(e[0].dt * 1000).toJSON().split("T")[0];
            weatherIcon = e[0].weather[0].main;

            weather = e[0].weather[0].description; // Mode
            windSpeed = e[0].wind.speed; // Mean
            humidity = e[0].main.humidity; // Mode
            temperatureRange = [ // Max and min
              Math.round(e[0].main.temp_min),
              Math.round(e[0].main.temp_max),
            ];

            let weatherCard = $("<article>");
            weatherCard.addClass("col-12 col-md-4 col-lg-2 forcast-card");
            weatherCard.text(
              `${cityName} 
              ${weatherDate} 
              ${weather} 
              ${weatherIcon} 
              ${windSpeed}km/h 
              ${humidity}% 
              ${temperatureRange}`
            );
            $("#five-day-forcast").append(weatherCard);
          });

          break;

        case "weather": // Current weather
          let currentTemp = Math.round(data.main.temp);
          cityName = data.name;
          weatherDate = data.dt;
          weather = data.weather[0].description;
          weatherIcon = data.weather[0].main;
          windSpeed = data.wind.speed;
          humidity = data.main.humidity;
          temperatureRange = [
            Math.round(data.main.temp_min),
            Math.round(data.main.temp_max),
          ];

          break;
      }

      // 5 Day forecast (including today)
    });
}

function getAverage(dataList, type){
  switch(type){
    case "mode":
      let count = {};
      dataList.forEach(e => {
        if (!(e in count)){
          count[e] = 0;
        }
        count ++;
      });

      let mostCommon = 0;
      let mostCommonElement;
      Object.entries(count).forEach(([key, value]) => {
        if (v > mostCommon){
          mostCommonElement = key;
          mostCommon = value;
        }
      });

      return mostCommonElement;
    case "mean":
      let total = 0;
      dataList.forEach(e => {
        total += e;
      });
      return total / dataList.length;
  }
  return null;
}

getWeather("43.46", "-79.66", "forecast"); // Current Weather
