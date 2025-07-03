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
    const sunriseEl = document.getElementById('sunrise');
    const sunsetEl = document.getElementById('sunset');
    const forecastContainer = document.getElementById('forecast-container');
    const hourlyContainer = document.getElementById('hourly-container');
    const appContainer = document.querySelector('.weather-app-container');
    const bodyEl = document.querySelector('body');

    // === ZAROORI: Apni API Key yahan daalein ===
    const apiKey = "AAPKI_API_KEY_YAHAN_DAALEIN"; 

    // --- Functions ---
    async function getWeatherData(city) {
        const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no&alerts=no`;
        
        // Data aane se pehle animation hide karein
        appContainer.classList.remove('visible');

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('City not found');
            }
            const data = await response.json();
            
            displayCurrentWeather(data);
            displayForecast(data);
            displayHourlyForecast(data);
            setDynamicBackground(data);
            
            // Saara data display hone ke baad animation show karein
            setTimeout(() => {
                appContainer.classList.add('visible');
            }, 100);

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

        // Sunrise & Sunset
        const astroData = data.forecast.forecastday[0].astro;
        sunriseEl.textContent = astroData.sunrise;
        sunsetEl.textContent = astroData.sunset;
    }
    
    function displayHourlyForecast(data) {
        hourlyContainer.innerHTML = '';
        const currentHour = new Date(data.location.localtime).getHours();
        const todayHours = data.forecast.forecastday[0].hour;

        todayHours.forEach(hourData => {
            const hour = parseInt(hourData.time.split(' ')[1].split(':')[0]);
            if (hour >= currentHour) {
                const card = document.createElement('div');
                card.className = 'hourly-card';
                card.innerHTML = `
                    <p class="hour">${hour}:00</p>
                    <img src="https:${hourData.condition.icon}" alt="">
                    <p class="temp">${Math.round(hourData.temp_c)}°</p>
                `;
                hourlyContainer.appendChild(card);
            }
        });
    }

    function displayForecast(data) {
        forecastContainer.innerHTML = '';
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

    function setDynamicBackground(data) {
        const condition = data.current.condition.text.toLowerCase();
        let bgImage = '';

        if (condition.includes('rain') || condition.includes('drizzle')) {
            bgImage = "url('images/rain.jpg')";
        } else if (condition.includes('cloud') || condition.includes('overcast')) {
            bgImage = "url('images/clouds.jpg')";
        } else if (condition.includes('clear') || condition.includes('sunny')) {
            bgImage = "url('images/sunny.jpg')";
        } else if (condition.includes('snow') || condition.includes('blizzard')) {
            bgImage = "url('images/snow.jpg')";
        } else {
            bgImage = "linear-gradient(to top, #1e284a, #131a2e)"; // Default
        }
        bodyEl.style.backgroundImage = bgImage;
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
    getWeatherData('Delhi');
});