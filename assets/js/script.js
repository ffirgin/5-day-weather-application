//day.js logic
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// Variables for API, city history and query selectors for grabbing HTML IDs to append information to
var searchForm = document.querySelector('#city-search');
var searchInput = document.querySelector('#city-input');
var mainContainer = document.querySelector('#today');
var forecastContainer = document.querySelector('#forecast');
var cityHistoryContainer = document.querySelector('#history');
var apiURL = 'https://api.openweathermap.org';
var apiKey = '071cd2c4562bcbc21319f59ac6f628f9'
var cityHistory = [];

//FUNCTIONS

//Function to show the city history that the user has searched for.
function showCityHistory(){
  cityHistoryContainer.innerHTML = '';
  for (var i = cityHistory.length - 1; i >= 0; i--){
    var cityBtn = document.createElement('button');
    cityBtn.setAttribute('type', 'button');
    cityBtn.setAttribute('class', 'btn btn-secondary m-1');
    cityBtn.setAttribute('data-city', cityHistory[i]);
    cityBtn.textContent = cityHistory[i];
    cityHistoryContainer.append(cityBtn)
  }
}
//Updating local storage with users search cities, and then calling the showCityHistory function to display the cities.
function citySearchHistory(city){
  //
  if (cityHistory.indexOf(city) !== -1){
    return;
  }
  //Users search city is pushed to the cityHistory array.
  cityHistory.push(city);
  //Local storage is updated with the cityHistory array.
  localStorage.setItem('city-history', JSON.stringify(cityHistory));
  //Calling the showCityHistory function to display the cities.
  showCityHistory();
}

//Function to get the users search from local storage.
function getCityHistory(){
  var storedHistory = localStorage.getItem('city-history');
  if (storedHistory){
    //If there is a city in local storage, it is parsed and pushed to the cityHistory array.
    cityHistory = JSON.parse(storedHistory);
    //Calling the showCityHistory function to display the cities.
    showCityHistory();
  }
}

function getToday(city, weather) {
  var weatherTemp = weather.main.temp;
  var weatherWind = weather.wind.speed;
  var weatherHumidity = weather.main.humidity;
  var weatherIcon = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var date = dayjs().format('MM/DD/YYYY');

  //Creating the HTML elements to display the weather information.
  var weatherCard = document.createElement('div');
  weatherCard.setAttribute('class', 'card');
  var weatherBody = document.createElement('div');
  weatherBody.setAttribute('class', 'card-body');
  weatherCard.append(weatherBody);

  var weatherTitle = document.createElement('h3');
  weatherTitle.setAttribute('class', 'card-title h3');

  var weatherImg = document.createElement('img');
  weatherImg.setAttribute('src', weatherIcon);
  weatherImg.setAttribute('class', 'weather-img');
  weatherTitle.append(weatherImg);

  var temperatureEl = document.createElement('p');
  temperatureEl.setAttribute('class', 'card-text');
  var windEl = document.createElement('p');
  windEl.setAttribute('class', 'card-text');
  var humidityEl = document.createElement('p');
  humidityEl.setAttribute('class', 'card-text');

  //Text content for above elements
  weatherTitle.textContent = `${city} (${date})`;
  temperatureEl.textContent = `Temperature: ${weatherTemp} F`;
  windEl.textContent = `Wind Speed: ${weatherWind} MPH`;
  humidityEl.textContent = `Humidity: ${weatherHumidity}%`;

  //Appending the elements to the weatherBody div.
  weatherBody.append(weatherTitle, temperatureEl, windEl, humidityEl);

  mainContainer.innerHTML = '';
  mainContainer.append(weatherCard);
}

function getForecast(forecast) {
  var openWeatherIcon = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  //API array information
  var temperature = forecast.main.temp;
  var wind = forecast.wind.speed;
  var humidity = forecast.main.humidity;


  var column = document.createElement('div');
  column.setAttribute('class', 'col-md-2');
  var card = document.createElement('div');
  card.setAttribute('class', 'card bg-primary text-white');
  var cardInside = document.createElement('div');
  cardInside.setAttribute('class', 'card-body p-2');
  var cardHeader = document.createElement('h4');
  cardHeader.setAttribute('class', 'card-title');
  var cardImg = document.createElement('img');
  cardImg.setAttribute('src', openWeatherIcon);
  var temperatureEl = document.createElement('p');
  temperatureEl.setAttribute('class', 'card-text');
  var windEl = document.createElement('p');
  windEl.setAttribute('class', 'card-text');
  var humidityEl = document.createElement('p');
  humidityEl.setAttribute('class', 'card-text');

  //Text content for above elements
  cardHeader.textContent = dayjs(forecast.dt_txt).format('MM/DD/YYYY');
  temperatureEl.textContent = `Temp: ${temperature} F`;
  windEl.textContent = `Wind: ${wind} MPH`;
  humidityEl.textContent = `Humidity: ${humidity}%`;

  //Appending elements
  forecastContainer.append(column);
}

 function showForecast(daily){
  //Using unix time to convert, and then having the start and end dates for the forecast.
  //Dayjs documentation used to understand how to use startOf to create the start and end dates.
  var firstDay = dayjs().add(1, 'day').startOf('day').unix();
  var lastDay = dayjs().add(6, 'day').startOf('day').unix();

  for (var i = 0; i < daily.length; i++){
    if(daily[i].dt >= firstDay && 
      daily[i].dt <= lastDay){
      getForecast(daily[i]);
    }
  }

  var headerColumn = document.createElement('div');
  headerColumn.setAttribute('class', 'col-12');
  var header = document.createElement('h5');
  
  header.textContent = '5-Day Forecast:';
  forecastContainer.innerHTML = '';
  forecastContainer.append(headerColumn);

 }

function showWeather(city,data){
  getToday(city, data.list[0], data.city.timezone);
  showForecast(data.list);
}

function fetchOpenWeatherMap(location){
  var cityName = location.name
  var {lat} = location;
  var {lon} = location;
  //API URL from OpenWeatherMap documentation instructions with passed in parameters
  var weatherURL = 
  `${apiURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  fetch(weatherURL)
    .then(function(response){
      return response.json();
    })
    .then(function(data){
      showForecast(cityName,data);
      console.log(data);
    })
}

function fetchGeoCoding(city){
  var geoCodingURL = 
  `${apiURL}/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

  fetch(geoCodingURL)
    .then(function(response){
      return response.json();
    })
    .then(function(data){
      citySearchHistory(city)
      fetchOpenWeatherMap(data[0]);
      console.log(data[0]); // getting location information
    })
}

function searchCitySubmit(event){
  event.preventDefault();
  var city = searchInput.value.trim();
    fetchGeoCoding(city);
    searchInput.value = '';
}
searchForm.addEventListener('submit', searchCitySubmit);

function searchHistoryClick(event){
  var button = event.target;
  var dataCity = button.getAttribute('data-city');
  fetchGeoCoding(dataCity);
}
cityHistoryContainer.addEventListener('click', searchHistoryClick);

getCityHistory();