// Weather Dashboard - Fetches data from Open-Meteo API (free, no API key required)
// API Documentation: https://open-meteo.com/en/docs

const API_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// DOM Elements
const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const weatherContent = document.getElementById('weatherContent');
const defaultState = document.getElementById('defaultState');

// Event Listeners
searchBtn.addEventListener('click', () => searchLocation());
locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchLocation();
});
currentLocationBtn.addEventListener('click', useCurrentLocation);

/**
 * Search for a location and fetch weather data
 */
async function searchLocation() {
    const query = locationInput.value.trim();
    
    if (!query) {
        showError('Please enter a city name');
        return;
    }

    try {
        showLoading();
        
        // Geocode the location
        const geoResponse = await fetch(
            `${API_BASE_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
        );
        
        if (!geoResponse.ok) {
            throw new Error('Failed to fetch location data');
        }

        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            showError(`Location "${query}" not found. Please try another search.`);
            hideLoading();
            return;
        }

        const location = geoData.results[0];
        await fetchWeatherData(location.latitude, location.longitude, location);
        
    } catch (error) {
        console.error('Search error:', error);
        showError('An error occurred while searching. Please try again.');
    }
}

/**
 * Use browser's geolocation API to get current location
 */
async function useCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    try {
        showLoading();
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                // Try to get location name from coordinates (reverse geocoding)
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    const locationName = data.address?.city || data.address?.town || 'Current Location';
                    
                    await fetchWeatherData(latitude, longitude, { name: locationName });
                } catch {
                    // Fallback if reverse geocoding fails
                    await fetchWeatherData(latitude, longitude, { 
                        name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` 
                    });
                }
            },
            (error) => {
                hideLoading();
                showError(`Geolocation error: ${error.message}`);
            }
        );
    } catch (error) {
        hideLoading();
        showError('Unable to get your location. Please search manually.');
    }
}

/**
 * Fetch weather data from Open-Meteo API
 */
async function fetchWeatherData(latitude, longitude, location) {
    try {
        const weatherResponse = await fetch(
            `${WEATHER_API_URL}?` +
            `latitude=${latitude}&` +
            `longitude=${longitude}&` +
            `current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&` +
            `hourly=temperature_2m,weather_code,precipitation_probability&` +
            `daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,precipitation_probability_max&` +
            `timezone=auto&` +
            `forecast_days=7`
        );

        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const weatherData = await weatherResponse.json();
        displayWeather(weatherData, location);
        hideLoading();
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError('Failed to fetch weather data. Please try again.');
        hideLoading();
    }
}

/**
 * Display weather data on the page
 */
function displayWeather(data, location) {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;
    const timezone = data.timezone;

    // Update location info
    document.getElementById('locationName').textContent = location.name || 'Unknown Location';
    document.getElementById('lastUpdated').textContent = 
        `Updated: ${new Date(current.time).toLocaleString()}`;

    // Update current weather
    document.getElementById('temperature').textContent = 
        Math.round(current.temperature_2m);
    document.getElementById('humidity').textContent = 
        `${current.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = 
        `${current.wind_speed_10m} km/h`;
    document.getElementById('feelsLike').textContent = 
        `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('pressure').textContent = 
        `${current.pressure_msl} hPa`;

    // Update weather condition
    const condition = getWeatherCondition(current.weather_code);
    document.getElementById('weatherCondition').textContent = condition.text;
    document.getElementById('weatherIcon').textContent = condition.icon;

    // Display 7-day forecast
    displayForecast(daily, timezone);

    // Display 24-hour forecast
    displayHourlyForecast(hourly, timezone);

    // Show weather content and hide default state
    weatherContent.classList.remove('hidden');
    defaultState.classList.add('hidden');
}

/**
 * Display 7-day forecast
 */
function displayForecast(daily, timezone) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const condition = getWeatherCondition(daily.weather_code[i]);
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const rainChance = daily.precipitation_probability_max[i];

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div class="forecast-icon">${condition.icon}</div>
            <div class="forecast-temp">${maxTemp}°</div>
            <div class="forecast-condition">${minTemp}° ${condition.short}</div>
            <div class="forecast-rain">💧 ${rainChance}%</div>
        `;
        forecastGrid.appendChild(card);
    }
}

/**
 * Display 24-hour forecast
 */
function displayHourlyForecast(hourly, timezone) {
    const hourlyGrid = document.getElementById('hourlyGrid');
    hourlyGrid.innerHTML = '';

    const now = new Date();
    const currentHourIndex = hourly.time.findIndex(time => {
        const forecastTime = new Date(time + 'Z');
        return forecastTime > now;
    });

    // Show next 24 hours starting from current hour
    for (let i = currentHourIndex; i < Math.min(currentHourIndex + 24, hourly.time.length); i++) {
        const time = new Date(hourly.time[i] + 'Z');
        const condition = getWeatherCondition(hourly.weather_code[i]);
        const temp = Math.round(hourly.temperature_2m[i]);
        const rainChance = hourly.precipitation_probability[i];

        const card = document.createElement('div');
        card.className = 'hourly-card';
        card.innerHTML = `
            <div class="hourly-time">${time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
            <div class="hourly-icon">${condition.icon}</div>
            <div class="hourly-temp">${temp}°</div>
            <div class="hourly-condition">${condition.short}</div>
            <div class="hourly-rain">💧 ${rainChance}%</div>
        `;
        hourlyGrid.appendChild(card);
    }
}

/**
 * Convert WMO weather codes to human-readable text and emoji
 * Reference: https://www.weatherapi.com/docs/weather_codes.asp
 */
function getWeatherCondition(code) {
    const weatherCodes = {
        0: { text: 'Clear sky', short: 'Clear', icon: '☀️' },
        1: { text: 'Mainly clear', short: 'Clear', icon: '🌤️' },
        2: { text: 'Partly cloudy', short: 'Cloudy', icon: '⛅' },
        3: { text: 'Overcast', short: 'Overcast', icon: '☁️' },
        45: { text: 'Foggy', short: 'Fog', icon: '🌫️' },
        48: { text: 'Foggy with rime', short: 'Fog', icon: '🌫️' },
        51: { text: 'Light drizzle', short: 'Drizzle', icon: '🌦️' },
        53: { text: 'Moderate drizzle', short: 'Drizzle', icon: '🌦️' },
        55: { text: 'Heavy drizzle', short: 'Drizzle', icon: '🌧️' },
        61: { text: 'Slight rain', short: 'Rain', icon: '🌧️' },
        63: { text: 'Moderate rain', short: 'Rain', icon: '🌧️' },
        65: { text: 'Heavy rain', short: 'Rain', icon: '⛈️' },
        71: { text: 'Slight snow', short: 'Snow', icon: '🌨️' },
        73: { text: 'Moderate snow', short: 'Snow', icon: '🌨️' },
        75: { text: 'Heavy snow', short: 'Snow', icon: '🌨️' },
        77: { text: 'Snow grains', short: 'Snow', icon: '🌨️' },
        80: { text: 'Slight rain showers', short: 'Showers', icon: '🌦️' },
        81: { text: 'Moderate rain showers', short: 'Showers', icon: '🌧️' },
        82: { text: 'Violent rain showers', short: 'Showers', icon: '⛈️' },
        85: { text: 'Slight snow showers', short: 'Snow', icon: '🌨️' },
        86: { text: 'Heavy snow showers', short: 'Snow', icon: '🌨️' },
        95: { text: 'Thunderstorm', short: 'Storm', icon: '⛈️' },
        96: { text: 'Thunderstorm with hail', short: 'Storm', icon: '⛈️' },
        99: { text: 'Thunderstorm with large hail', short: 'Storm', icon: '⛈️' },
    };

    return weatherCodes[code] || { text: 'Unknown', short: 'Unknown', icon: '❓' };
}

/**
 * UI Helper Functions
 */
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    weatherContent.classList.add('hidden');
    defaultState.classList.add('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherContent.classList.add('hidden');
    defaultState.classList.remove('hidden');
}

// Initialize: Show default state on page load
document.addEventListener('DOMContentLoaded', () => {
    weatherContent.classList.add('hidden');
    defaultState.classList.remove('hidden');
});
