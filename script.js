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
    let map; // Map object ko yahan define karein
    let radarLayer; // Radar layer ko yahan define karein

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
        if (query.length < 3) { autocompleteResults.innerHTML = ''; return; }
        const apiUrl = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            displayAutocomplete(data);
        } catch (error) { console.error("Autocomplete Error:", error); }
    }

    // --- UI Update Functions ---
    function updateUI(data) {
        const { location, current, forecast } = data;
        
        document.getElementById('city-name').textContent = `${location.name}, ${location.country}`;
        document.getElementById('local-time').textContent = new Date(location.localtime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('weather-icon').src = `https:${current.condition.icon}`;
        document.getElementById('temperature').textContent = `${Math.round(current.temp_c)}°`;
        document.getElementById('weather-description').textContent = current.condition.text;

        updateAqiCard(current.air_quality['us-epa-index']);
        updateUvCard(current.uv);
        document.getElementById('sunrise-sunset').textContent = `${forecast.forecastday[0].astro.sunrise} / ${forecast.forecastday[0].astro.sunset}`;
        document.getElementById('humidity').textContent = `${current.humidity}%`;
        document.getElementById('wind-speed').textContent = `${current.wind_kph} km/h`;
        document.getElementById('visibility').textContent = `${current.vis_km} km`;
        
        const forecastContainer = document.getElementById('forecast-container');
        forecastContainer.innerHTML = '';
        forecast.forecastday.forEach(day => {
            const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
            const card = document.createElement('div');
            card.className = 'highlight-card forecast-card';
            card.innerHTML = `<p class="day">${dayName}</p><img src="https:${day.day.condition.icon}" alt=""><p class="temp">${Math.round(day.day.maxtemp_c)}°/${Math.round(day.day.mintemp_c)}°</p>`;
            forecastContainer.appendChild(card);
        });

        updateMap(location.lat, location.lon);
        hideLoader();
    }
    
    function updateAqiCard(aqi) { /* ... same as before ... */ }
    function updateUvCard(uv) { /* ... same as before ... */ }
    
    // === NAYA AUTOCOMPLETE CLICK KA LOGIC ===
    function displayAutocomplete(locations) {
        autocompleteResults.innerHTML = '';
        if (locations.length > 0) {
            locations.forEach(loc => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = `${loc.name}, ${loc.region}, ${loc.country}`;
                item.addEventListener('click', () => { // CLICK EVENT YAHAN HAI
                    cityInput.value = '';
                    autocompleteResults.innerHTML = '';
                    getWeatherData(loc.url);
                });
                autocompleteResults.appendChild(item);
            });
        }
    }
    
    // --- NAYA RADAR MAP KA LOGIC ---
    function initializeMap() {
        map = L.map('map').setView([20.5937, 78.9629], 5); // India ka center
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO'
        }).addTo(map);

        radarLayer = L.tileLayer('https://tilecache.rainviewer.com/v2/radar/{time}/512/{z}/{x}/{y}/6/1_1.png', {
            time: getRainviewerTimestamp(),
            opacity: 0.7
        }).addTo(map);
    }
    
    function updateMap(lat, lon) {
        if(map) {
            map.flyTo([lat, lon], 9); // Naye sheher par zoom karein
        }
    }
    
    function getRainviewerTimestamp() {
        // RainViewer ke liye special timestamp
        return Math.floor(Date.now() / 1000 / 600) * 600;
    }

    function showLoader() { dashboard.classList.add('hidden'); loader.classList.remove('hidden'); }
    function hideLoader() { dashboard.classList.remove('hidden'); loader.classList.add('hidden'); }

    // --- Event Listeners ---
    cityInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => getAutocomplete(cityInput.value), 300);
    });
    myLocationBtn.addEventListener('click', () => { /* ... same as before ... */ });

    // --- Initial Load ---
    initializeMap(); // Map ko shuru mein hi bana lein
    getWeatherData('Mumbai');
});