interface WeatherRenderElements {
    weatherCity: HTMLElement | null;
    weatherTemp: HTMLElement | null;
    weatherIcon: HTMLElement | null;
    weatherWidget: HTMLAnchorElement | null;
    weatherDetails?: HTMLElement | null;
}

function getFluentIconFilename(code: number, isDay: number | boolean, desc?: string): string {
    if (desc) {
        if (desc.includes('晴')) return isDay ? 'sunny.svg' : 'clear_night.svg';
        if (desc.includes('多云')) return isDay ? 'partly_cloudy_day.svg' : 'partly_cloudy_night.svg';
        if (desc.includes('阴')) return 'cloudy.svg';
        if (desc.includes('雷') || desc.includes('阵雨')) return 'thunderstorm.svg';
        if (desc.includes('雾') || desc.includes('霾')) return 'fog.svg';
        if (desc.includes('雨夹雪') || desc.includes('冰雹')) return 'rain_snow.svg';
        if (desc.includes('雪')) return isDay ? 'snow_showers_day.svg' : 'snow_showers_night.svg';
        if (desc.includes('大雨') || desc.includes('暴雨')) return 'rain_showers_day.svg';
        if (desc.includes('雨')) return 'rain.svg';
    }

    switch (code) {
        case 0: return isDay ? 'sunny.svg' : 'clear_night.svg';
        case 1: return isDay ? 'sunny.svg' : 'clear_night.svg';
        case 2: return isDay ? 'partly_cloudy_day.svg' : 'partly_cloudy_night.svg';
        case 3: return 'cloudy.svg';
        case 45:
        case 48: return 'fog.svg';
        case 51:
        case 53:
        case 55: return 'drizzle.svg';
        case 56:
        case 57:
        case 66:
        case 67: return 'rain_snow.svg';
        case 61:
        case 63:
        case 65: return 'rain.svg';
        case 71:
        case 73:
        case 75:
        case 77: return 'snow.svg';
        case 80:
        case 81:
        case 82: return isDay ? 'rain_showers_day.svg' : 'rain_showers_night.svg';
        case 85:
        case 86: return isDay ? 'snow_showers_day.svg' : 'snow_showers_night.svg';
        case 95: return 'thunderstorm.svg';
        case 96:
        case 99: return isDay ? 'hail_day.svg' : 'hail_night.svg';
        default: return 'cloudy.svg';
    }
}

function renderWeatherWidget(data: WeatherApiResponse | null, weatherUnit: WeatherUnit, cityData: CityData, refs: WeatherRenderElements): void {
    if (!data?.current_weather) return;
    if (!refs.weatherCity || !refs.weatherTemp || !refs.weatherIcon || !refs.weatherWidget) return;

    const { temperature, weathercode, is_day, weatherDesc, humidity, windpower, winddirection } = data.current_weather;
    const isCelsius = weatherUnit === 'c';
    const tempValue = isCelsius ? temperature : (temperature * 9 / 5) + 32;
    const unitSymbol = isCelsius ? '°C' : '°F';
    const filename = getFluentIconFilename(weathercode, is_day, weatherDesc);

    refs.weatherCity.textContent = cityData.name;
    refs.weatherTemp.textContent = `${Math.round(tempValue)}${unitSymbol}`;
    refs.weatherIcon.innerHTML = `<img src="assets/weather/${filename}" alt="Weather Icon" class="fluent-icon">`;
    refs.weatherWidget.href = `https://www.google.com/search?q=weather+${encodeURIComponent(cityData.name)}`;

    if (refs.weatherDetails && weatherDesc) {
        refs.weatherDetails.textContent = `湿度: ${humidity}% · ${winddirection}风 ${windpower}级`;
        refs.weatherDetails.style.display = 'block';
    } else if (refs.weatherDetails) {
        refs.weatherDetails.style.display = 'none';
    }
}
