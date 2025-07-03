document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const cityNameEl = document.getElementById('city-name');
    const localTimeEl = document.getElementById('local-time');
    const weatherIconEl = document.getElementById('weather-icon');
    const temperatureEl = document.getElementById('temperature');
    const weatherDescEl = document.getElementById('weather-description');
    const feelsLikeEl = document.getElementById('feels-like');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const visibilityEl = document.getElementById('visibility');
    const forecastContainer = document.getElementById('forecast-container');

    // === ZAROORI: Apni NAYI API Key yahan daalein ===
    const apiKey = "474691301eaa47d1ab3130251250307"; 

    // --- Functions ---
    async function getWeatherData(city) {
        const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no&alerts=no`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('City not found');
            }
            const data = await response.json();

            // Data ko display karne wale functions call karein
            displayCurrentWeather(data);
            displayForecast(data);

        } catch (error) {
            console.error("Error fetching weather data:", error);
            alert("Could not find the city. Please check the spelling and try again.");
        }
    }

    function displayCurrentWeather(data) {
        const { location, current } = data;
        
        cityNameEl.textContent = `${location.name}, ${location.country}`;
        localTimeEl.textContent = `Local Time: ${location.localtime.split(' ')[1]}`;
        weatherIconEl.src = `https:${current.condition.icon}`;
        temperatureEl.textContent = `${Math.round(current.temp_c)}°`;
        weatherDescEl.textContent = current.condition.text;
        
        feelsLikeEl.textContent = `${Math.round(current.feelslike_c)}°`;
        humidityEl.textContent = `${current.humidity}%`;
        windSpeedEl.textContent = `${current.wind_kph} km/h`;
        visibilityEl.textContent = `${current.vis_km} km`;
    }

    function displayForecast(data) {
        forecastContainer.innerHTML = ''; // Pehle se maujood forecast saaf karein
        const forecastDays = data.forecast.forecastday;

        forecastDays.forEach(dayData => {
            const date = new Date(dayData.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            const card = document.createElement('div');
            card.className = 'forecast-card';

            card.innerHTML = `
                <p class="day">${dayName}</p>
                <img src="https:${dayData.day.condition.icon}" alt="${dayData.day.condition.text}">
                <p class="temp">${Math.round(dayData.day.maxtemp_c)}° / ${Math.round(dayData.day.mintemp_c)}°</p>
            `;
            forecastContainer.appendChild(card);
        });
    }

    // --- Event Listeners ---
    searchButton.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            alert('Please enter a city name.');
        }
    });

    cityInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });

    // --- Initial Load ---
    // Page load hote hi Delhi ka mausam dikhaye
    getWeatherData('Delhi');
});
