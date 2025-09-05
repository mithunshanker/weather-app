import { NextResponse } from 'next/server';

// This function handles GET requests to /api/weather
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // Check for API key
    if (!apiKey) {
        return NextResponse.json({ error: 'API Key is missing' }, { status: 500 });
    }
    
    // Build API URLs based on provided params (coords or city)
    let weatherUrl;
    let forecastUrl;

    if (lat && lon) {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else if (city) {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    } else {
        return NextResponse.json({ error: 'City or coordinates are required' }, { status: 400 });
    }

    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);
        
        if (!weatherResponse.ok || !forecastResponse.ok) {
            const errorData = await weatherResponse.json();
            return NextResponse.json({ error: `Failed to fetch weather data: ${errorData.message}` }, { status: weatherResponse.status });
        }

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        // --- Generate Alerts ---
        const alerts = new Set();
        const next24hForecast = forecastData.list.slice(0, 8);
        if (next24hForecast.some(item => item.weather[0].main.toLowerCase().includes('rain'))) {
            alerts.add('Rain is expected in the next 24 hours. Consider carrying an umbrella.');
        }
        if (weatherData.main.temp > 35) {
            alerts.add('Heatwave warning: Stay hydrated and avoid direct sun exposure.');
        }
        if (weatherData.wind.speed * 3.6 > 50) { 
            alerts.add('High winds warning: Secure loose objects outdoors.');
        }

        // --- Structure the response ---
        const responseData = {
            current: {
                city: weatherData.name,
                temp: weatherData.main.temp,
                humidity: weatherData.main.humidity,
                windSpeed: weatherData.wind.speed,
                condition: weatherData.weather[0].description,
                icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
                coords: weatherData.coord
            },
            forecast: forecastData.list
                .filter(item => item.dt_txt.includes("12:00:00")) 
                .map(item => ({
                    date: item.dt_txt,
                    temp: item.main.temp,
                    condition: item.weather[0].description,
                    icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`
                })),
            alerts: Array.from(alerts)
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

