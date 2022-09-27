const apiKey = "4525e4c4d6900be2e3932d311208c64e";
const searchButton = $("#search-button");
const searchHistoryListEl = $("#search-history");
let searchHistory; // Scope the searchHistory globally, so it can be used in multiple functions

function getWeather(lat, lon, type) {
    const apiKey = "4525e4c4d6900be2e3932d311208c64e";
    const apiUrl = `https://api.openweathermap.org/data/2.5/${type}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Data that will be used in both of the API fetches
            let temperatureRange;
            let humidity;
            let windSpeed;
            let weather;
            let weatherDate;
            let weatherIcon;
            // Reset all the weather cards

            // Process all the data here and append it to the page
            if (type === "forecast") { // API end point for 120 hours of weather split into 3 hour segments
                const fiveDayForecastEl = $("#five-day-forcast"); // Container element
                fiveDayForecastEl.html(""); // Reset the forecast container
                let dailyWeather = [];
                let currentDay = [];
                // Split the data into separate days
                data.list.forEach((e) => { // For every element in the forecast
                    if (currentDay.length === 0) { // If this is the first element, automatically at it to the first day
                        currentDay.push(e);
                    } else {
                        // Check whether the current segment is part of the same day as the previous segment
                        if (currentDay[currentDay.length - 1].dt_txt.split(" ")[0] !== e.dt_txt.split(" ")[0]) {
                            dailyWeather.push(currentDay); // Finish the current day's weather
                            currentDay = [e]; // Start the next day's weather
                        } else { // If it is part of the same day, add it
                            currentDay.push(e);
                        }
                    }
                });
                if (currentDay.length !== 0) dailyWeather.push(currentDay); // If this is the final day and has less than a full 24 hours of data, push it
                if (dailyWeather.length > 5) dailyWeather.shift(); // If there is more than 5 days, remove the first day

                dailyWeather.forEach((e) => {
                    // Process each day's weather and add it to the respective card

                    weatherDate = new Date(e[0].dt * 1000).toJSON().split("T")[0]; // Get just the date portion of the date object
                    if (e[5]) { // If the icon for 3pm exists, use it
                        weatherIcon = e[5].weather[0].icon;

                        weather = e[5].weather[0].description;
                        windSpeed = e[5].wind.speed;
                        humidity = e[5].main.humidity;
                    } else { // Otherwise, use the icon for midnight
                        weatherIcon = e[0].weather[0].icon;

                        weather = e[0].weather[0].description;
                        windSpeed = e[0].wind.speed;
                        humidity = e[0].main.humidity;
                    }
                    let temperatureRangeData = getMaxMinTemperature(e); // Gets the high/low temperature for a day
                    temperatureRange = `Low ${temperatureRangeData.low}°C / High ${temperatureRangeData.high}°C`; // max/min

                    // Define the elements we will need to build the forecast section
                    const weatherCard = $("<article>");
                    const dateEl = $("<h4>");
                    const weatherListEl = $("<ul>");
                    const weatherEl = $("<li>");
                    const iconEl = $("<img alt='Weather icon' src=''>");
                    const windSpeedEl = $("<li>");
                    const humidityEl = $("<li>");
                    const temperatureRangeEl = $("<li>");

                    // Add information to each of the elements
                    dateEl.text(weatherDate);
                    weatherEl.text(weather);
                    windSpeedEl.text(windSpeed + "m/s");
                    humidityEl.text(humidity + "%");
                    temperatureRangeEl.text(temperatureRange);
                    iconEl.attr(
                        "src",
                        `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`
                    );

                    // Append the elements to the list
                    weatherListEl.append(weatherEl);
                    weatherListEl.append(windSpeedEl);
                    weatherListEl.append(humidityEl);
                    weatherListEl.append(temperatureRangeEl);

                    // Append lists, date, and icon to the card
                    weatherCard.addClass("col-12 col-md-4 col-lg-2 forcast-card");
                    weatherCard.append(dateEl);
                    weatherCard.append(iconEl);
                    weatherCard.append(weatherListEl);

                    // Append the card to the container
                    fiveDayForecastEl.append(weatherCard);
                });

            } else if (type === "weather") {// Current weather
                const todaysForecastEl = $("#todays-forecast"); // current weather container
                todaysForecastEl.html(""); // reset the container
                let currentTemp = Math.round(data.main.temp);
                let cityName = data.name;
                weatherDate = new Date(data.dt * 1000).toJSON().split("T")[0]; // Get the date without the time
                weather = data.weather[0].description;
                weatherIcon = data.weather[0].icon;
                windSpeed = data.wind.speed;
                humidity = data.main.humidity;
                temperatureRange = `Low ${Math.round(data.main.temp_min)}°C / High ${Math.round(data.main.temp_max)}°C`;

                // Elements to build the current weather portion
                let weatherCard = $("<article>");
                let cityNameEl = $("<h3>");
                let dateEl = $("<h4>");
                let weatherListEl = $("<ul>");
                let weatherEl = $("<li>");
                let iconEl = $("<img alt='Weather icon' src=''>");
                let windSpeedEl = $("<li>");
                let humidityEl = $("<li>");
                let temperatureRangeEl = $("<li>");
                let currentTempEl = $("<li>");

                // Add data to the elements
                cityNameEl.text(cityName);
                currentTempEl.text(currentTemp + "°C");
                dateEl.text(weatherDate);
                weatherEl.text(weather);
                windSpeedEl.text(windSpeed + "m/s");
                humidityEl.text(humidity + "%");
                temperatureRangeEl.text(temperatureRange);
                iconEl.attr(
                    "src",
                    `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`
                );

                // Build the weather list
                weatherListEl.append(weatherEl);
                weatherListEl.append(currentTempEl);
                weatherListEl.append(windSpeedEl);
                weatherListEl.append(humidityEl);
                weatherListEl.append(temperatureRangeEl);

                // Append all the weather card's aspects to it
                weatherCard.addClass("col-12 col-md-10 col-lg-10 weather-card");
                weatherCard.append(cityNameEl);
                weatherCard.append(dateEl);
                weatherCard.append(iconEl);
                weatherCard.append(weatherListEl);

                // Add the weather card to the container
                todaysForecastEl.append(weatherCard);
            }
        });
}

// Gets the coordinates from the API
function getCoords(cityName, provinceCode = "", countryCode = "") {
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName.trim()},${provinceCode.trim()},${countryCode.trim()}&limit=5&appid=${apiKey}`;
    fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.length === 0) { // No cities found with that name
                console.log("No results.");
                return;
            }
            // Always use the first city returned
            let lat = data[0].lat;
            let lon = data[0].lon;

            // Get the weather for the lat lon coords for the city
            getWeather(lat, lon, "weather");
            getWeather(lat, lon, "forecast");
        });
}

// Gets the high / low temps for a day
function getMaxMinTemperature(weatherData) {
    let lowest;
    let highest;
    weatherData.forEach(e => { // Loops through each of the segments
        if (!lowest || !highest) { // If it is the first element, it is both the highest and lowest
            lowest = e.main.temp_min;
            highest = e.main.temp_max;
        }
        // Check if the element is either higher or lower than the current highest or lowest respectively
        if (e.main.temp_max > highest) highest = e.main.temp_max;
        if (e.main.temp_min < lowest) lowest = e.main.temp_min;
    })
    return { // Return an object of the highest and lowest temperatures
        high: Math.round(highest),
        low: Math.round(lowest)
    };
}

function updateSearchHistory(cityName) { // Add a city to the beginning of the search history
    searchHistory.history.unshift(cityName);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory)); // Set storage
    printSearchHistory(); // Re-print the history to the page
}

// Print the history to the page
function printSearchHistory() {
    searchHistoryListEl.html(""); // Reset the history
    searchHistory = JSON.parse(localStorage.getItem("searchHistory")); // Get the most recent history
    if (!searchHistory) { // If there is no search history
        searchHistory = {
            history: []
        };
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory)); // Set the search history to empty
    }
    searchHistory.history.forEach(e => { // For each search item
        // Create and append a list element to the search history container
        let searchHistoryItem = $("<li>");
        searchHistoryItem.text(e);
        searchHistoryItem.attr("class", "search-history--item");
        searchHistoryItem.on("click", function () {
            getCoords(e);
        })
        searchHistoryListEl.append(searchHistoryItem);
    });
}

// When the search button is clicked
searchButton.on("click", function (e) {
    e.preventDefault(); // Don't submit the form
    let content = $(this).parent().children().eq(1); // The search bar
    let args = content.val().split(","); // split the content up between City, Province, Country Code
    content.val(""); // Remove the searched item
    if (!args[0] || args[0].trim() === "") return; // If it is empty, don't search
    updateSearchHistory(args[0]); // Add it to the search history
    getCoords(args[0], args[1], args[2]); // Get the weather
});

printSearchHistory(); // Show the search history

getCoords("toronto", "on", "ca")// Display Toronto, Ontario's weather as default weather
