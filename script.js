document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const cityInput = document.getElementById('city-input');
    const autocompleteResults = document.getElementById('autocomplete-results');
    const myLocationBtn = document.getElementById('my-location-btn');
    const dashboard = document.getElementById('weather-dashboard');
    const loader = document.getElementById('loader');

    // === ZAROORI: Apni API Key yahan daalein ===
    const apiKey = "AAPKI_API_KEY_YAHAN_DAALEIN"; 

    // --- State ---
    let searchTimeout;

    // --- API Calls ---
    async function getWeatherData(query) {
        showLoader();
        const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=5&aqi=yes&alerts=no`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Weather data not found.');
            const data = await response.json();
            updateUI(data);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            alert("Could not fetch weather data. Please try another location.");
            hideLoader();
        }
    }

    async function getAutocomplete(query) {
        if (query.length < 3) {
            autocompleteResults.innerHTML = '';
            autocompleteResults.classList.add('hidden');
            return;
        }
        const apiUrl = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            displayAutocomplete(data);
        } catch (error) {
            console.error("Autocomplete Error:", error);
        }
    }

    // --- UI Update Functions ---
    function updateUI(data) {
        const { location, current, forecast } = data;
        
        // Current Weather
        document.getElementById('city-name').textContent = `${location.name}, ${location.country}`;
        document.getElementById('local-time').textContent = new Date(location.localtime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('weather-icon').src = `https:${current.condition.icon}`;
        document.getElementById('temperature').textContent = `${Math.round(current.temp_c)}°`;
        document.getElementById('weather-description').textContent = current.condition.text;

        // Highlights
        updateAqiCard(current.air_quality['us-epa-index']);
        updateUvCard(current.uv);
        document.getElementById('sunrise-sunset').textContent = `${forecast.forecastday[0].astro.sunrise} / ${forecast.forecastday[0].astro.sunset}`;
        document.getElementById('humidity').textContent = `${current.humidity}%`;
        document.getElementById('wind-speed').textContent = `${current.wind_kph} km/h`;
        document.getElementById('visibility').textContent = `${current.vis_km} km`;
        
        // Forecast
        const forecastContainer = document.getElementById('forecast-container');
        forecastContainer.innerHTML = '';
        forecast.forecastday.forEach(day => {
            const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
            const card = document.createElement('div');
            card.className = 'highlight-card forecast-card';
            card.innerHTML = `
                <p class="day">${dayName}</p>
                <img src="https:${day.day.condition.icon}" alt="">
                <p class="temp">${Math.round(day.day.maxtemp_c)}° / ${Math.round(day.day.mintemp_c)}°</p>
            `;
            forecastContainer.appendChild(card);
        });

        hideLoader();
    }
    
    function updateAqiCard(aqi) {
        const aqiValueEl = document.getElementById('aqi-value');
        const aqiStatusEl = document.getElementById('aqi-status');
        aqiValueEl.textContent = aqi;
        // Simple color/status mapping based on US EPA index
        if (aqi <= 2) { aqiValueEl.style.backgroundColor = '#a8d08d'; aqiStatusEl.textContent = 'Good'; }
        else if (aqi <= 4) { aqiValueEl.style.backgroundColor = '#f7d070'; aqiStatusEl.textContent = 'Moderate'; }
        else { aqiValueEl.style.backgroundColor = '#e53e3e'; aqiStatusEl.textContent = 'Unhealthy'; }
    }
    
    function updateUvCard(uv) {
        document.getElementById('uv-index').textContent = uv;
        const uvStatusEl = document.getElementById('uv-status');
        if (uv <= 2) uvStatusEl.textContent = 'Low';
        else if (uv <= 5) uvStatusEl.textContent = 'Moderate';
        else if (uv <= 7) uvStatusEl.textContent = 'High';
        else uvStatusEl.textContent = 'Very High';
    }

    function displayAutocomplete(locations) {
        autocompleteResults.innerHTML = '';
        if (locations.length > 0) {
            autocompleteResults.classList.remove('hidden');
            locations.forEach(loc => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = `${loc.name}, ${loc.region}, ${loc.country}`;
                item.addEventListener('click', () => {
                    cityInput.value = item.textContent;
                    autocompleteResults.innerHTML = '';
                    autocompleteResults.classList.add('hidden');
                    getWeatherData(loc.url);
                });
                autocompleteResults.appendChild(item);
            });
        }
    }

    function showLoader() {
        dashboard.classList.add('hidden');
        loader.classList.remove('hidden');
    }

    function hideLoader() {
        dashboard.classList.remove('hidden');
        loader.classList.add('hidden');
    }

    // --- Event Listeners ---
    cityInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            getAutocomplete(cityInput.value);
        }, 300); // Wait 300ms after user stops typing
    });

    myLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                getWeatherData(`${latitude},${longitude}`);
            }, () => alert("Unable to retrieve your location."));
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });

    // --- Initial Load ---
    getWeatherData('Mumbai'); // Load default city on start
});