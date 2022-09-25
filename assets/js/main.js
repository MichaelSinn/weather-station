const apiKey = "4525e4c4d6900be2e3932d311208c64e";
const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${stateCode},${countryCode}&limit=${limit}&appid=${apiKey}`;


function getWeather(lat, lon, type) {
  const apiKey = "4525e4c4d6900be2e3932d311208c64e";
  const apiUrl = `https://api.openweathermap.org/data/2.5/${type}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      // Process all of the data here and append it to the page
      switch(type){
        case "forecast": // 5 days of 3 hour weather
          let dailyWeather = [];

          // Split the data into 5 separate days (every 8 entries of the list)
          for (let i = 0; i < data.list.length; i += 8){
            dailyWeather.push(threeHourData.slice(i, i + 8));
          }
          console.log(dailyWeather);
          break;
        
        case "weather": // Todays weather
          break;
      }

      // 5 Day forecast (including today)

    });
}

getWeather("43.46", "-79.66", "weather"); // Current Weather

