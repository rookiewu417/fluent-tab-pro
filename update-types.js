import * as fs from 'fs';

const typeFile = 'src/core/types.ts';
let typeContent = fs.readFileSync(typeFile, 'utf8');

typeContent = typeContent.replace(
    /interface CityData {\s*name: string;\s*lat: number;\s*lon: number;\s*country\?: string;\s*}/,
    `interface CityData {
    name: string;
    lat: number;
    lon: number;
    country?: string;
    adcode?: string;
}`
);

typeContent = typeContent.replace(
    /interface WeatherCurrent {\s*temperature: number;\s*weathercode: number;\s*is_day: number;\s*}\s*interface WeatherApiResponse {\s*current_weather\?: WeatherCurrent;\s*}/,
    `interface WeatherCurrent {
    temperature: number;
    weathercode: number;
    is_day: number;
}

interface WeatherApiResponse {
    current_weather?: WeatherCurrent;
}

interface AMapWeatherLive {
    weather: string;
    temperature: string;
    winddirection: string;
    windpower: string;
    humidity: string;
    reporttime: string;
}

interface AMapWeatherResponse {
    status: string;
    count: string;
    info: string;
    infocode: string;
    lives: AMapWeatherLive[];
}`
);

fs.writeFileSync(typeFile, typeContent, 'utf8');
console.log('types.ts updated');
