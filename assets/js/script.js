// Variables for API, city history and query selectors for grabbing HTML IDs to append information to
var searchForm = document.querySelector('#city-search')
var searchInput = document.querySelector('#city-input')
var mainContainer = document.querySelector('#today')
var forecastContainer = document.querySelector('#forecast')
var cityHistoryContainer = document.querySelector('#history')
var apiURL = 'https://api.openweathermap.org'
var apiKey = '071cd2c4562bcbc21319f59ac6f628f9'
var cityHistory = []

//FUNCTIONS

//Function to show the city history that the user has searched for.
function showCityHistory() {
	cityHistoryContainer.innerHTML = ''
	for (var i = cityHistory.length - 1; i >= 0; i--) {
		var cityBtn = document.createElement('button')
		cityBtn.setAttribute('type', 'button')
		cityBtn.setAttribute('class', 'btn btn-secondary m-1')
		cityBtn.setAttribute('data-city', cityHistory[i])
		cityBtn.textContent = cityHistory[i]
		cityHistoryContainer.append(cityBtn)
	}
}
//Updating local storage with users search cities, and then calling the showCityHistory function to display the cities.
function citySearchHistory(city) {
	//
	if (cityHistory.indexOf(city) !== -1) {
		return
	}
	//Users search city is pushed to the cityHistory array.
	cityHistory.push(city)
	//Local storage is updated with the cityHistory array.
	localStorage.setItem('city-history', JSON.stringify(cityHistory))
	//Calling the showCityHistory function to display the cities.
	showCityHistory()
}

//Function to get the users search from local storage.
function getCityHistory() {
	var storedHistory = localStorage.getItem('city-history')
	if (storedHistory) {
		//If there is a city in local storage, it is parsed and pushed to the cityHistory array.
		cityHistory = JSON.parse(storedHistory)
		//Calling the showCityHistory function to display the cities.
		showCityHistory()
	}
}

// main function to populate forecast cards
function showForecast(daily) {
  forecastContainer.innerHTML = '';
  var header = document.createElement('h2')
  header.textContent = '5-Day Forecast:'
  forecastContainer.appendChild(header)
	for (var i = 0; i < daily.list.length; i += 8) {
		var card = document.createElement('div')
		card.setAttribute('class', 'card bg-danger text-white')
		card.setAttribute('id', 'forecast-card')
		var cardInside = document.createElement('div')
		cardInside.setAttribute('class', 'card-body p-2')
		var cardHeader = document.createElement('h4')
		cardHeader.setAttribute('class', 'card-title')
		var cardImg = document.createElement('img')
		var temperatureEl = document.createElement('p')
		temperatureEl.setAttribute('class', 'card-text')
		var windEl = document.createElement('p')
		windEl.setAttribute('class', 'card-text')
		var humidityEl = document.createElement('p')
		humidityEl.setAttribute('class', 'card-text')

		//Text content for above elements
		cardHeader.textContent = (daily.list[i]['dt_txt'].substring(0, 10))
    cardImg.setAttribute('src', 'https://openweathermap.org/img/w/' + daily.list[i].weather[0].icon + '.png')
		temperatureEl.textContent = `Temp: ${daily.list[i].main.temp} F`
		windEl.textContent = `Wind: ${daily.list[i].wind.speed} MPH`
		humidityEl.textContent = `Humidity: ${daily.list[i].main.humidity}%`

		card.appendChild(cardHeader)
		card.appendChild(cardImg)
		card.appendChild(temperatureEl)
		card.appendChild(windEl)
		card.appendChild(humidityEl)

		forecastContainer.appendChild(card)
	}
}

function fetchOpenWeatherMap(location) {
	var { lat } = location
	var { lon } = location
	var cityName = location.name
	//API URL from OpenWeatherMap documentation instructions with passed in parameters
	var weatherURL = `${apiURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`

	fetch(weatherURL)
		.then(function (response) {
			return response.json()
		})
		.then(function (data) {
			console.log('fetchOpenWeatherMap function:' + data.city.name)
			showForecast(data)
		})
}

function fetchGeoCoding(city) {
	var geoCodingURL = `${apiURL}/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`

	fetch(geoCodingURL)
		.then(function (response) {
			return response.json()
		})
		.then(function (data) {
			console.log('fetchGeoCoding function: ' + data) // getting location information
			citySearchHistory(city)
			fetchOpenWeatherMap(data[0])
		})
}

function searchCitySubmit(event) {
	event.preventDefault()
	forecastContainer.innerHTML = ''
	var city = searchInput.value.trim()
	fetchGeoCoding(city)
	searchInput.value = ''
}
searchForm.addEventListener('submit', searchCitySubmit)

function searchHistoryClick(event) {
	var button = event.target
	var dataCity = button.getAttribute('data-city')
	fetchGeoCoding(dataCity)
}
cityHistoryContainer.addEventListener('click', searchHistoryClick)

getCityHistory()