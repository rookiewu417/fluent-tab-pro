
const savedTheme = (localStorage.getItem('theme') || 'auto') as ThemeMode;
const savedEngine = (localStorage.getItem('searchEngine') || 'google') as keyof typeof engines;
let searchBarVisible = localStorage.getItem('searchBarVisible') !== 'false';
let suggestionsActive = localStorage.getItem('suggestionsEnabled') === 'true';
const suggestionsCache = new Map<string, string[]>();
let clearSearchEnabled = localStorage.getItem('clearSearchEnabled') === 'true';
let compactBarEnabled = localStorage.getItem('compactBarEnabled') === 'true';
let voiceSearchEnabled = localStorage.getItem('voiceSearchEnabled') === 'true';
const savedAnimationsDisabled = localStorage.getItem('animationsDisabled');
let animationsDisabled = savedAnimationsDisabled !== null
    ? savedAnimationsDisabled === 'true'
    : localStorage.getItem('performanceModeEnabled') === 'true';
const savedBlurDisabled = localStorage.getItem('blurDisabled');
let blurDisabled = savedBlurDisabled === 'true';
let reducedEffectsEnabled = localStorage.getItem('reducedEffectsEnabled') !== 'false';
const savedReducedEffectsEnabled = localStorage.getItem('reduceEffectsEnabled');
let reduceEffectsEnabled = savedReducedEffectsEnabled !== 'false';

const CACHE_KEY = 'fluent_weather_cache';
const CITY_KEY = 'fluent_city_data';
const CACHE_DURATION = 1800000;

let weatherEnabled = localStorage.getItem('weatherEnabled') === 'true';
let weatherUnit = (localStorage.getItem('weatherUnit') || 'c') as WeatherUnit;
let currentCityData: CityData = { name: 'New York', lat: 40.71, lon: -74.01 };
try {
    const saved = localStorage.getItem(CITY_KEY);
    if (saved) currentCityData = JSON.parse(saved) as CityData;
} catch (e) { console.error('Error reading saved city'); }

let launcherEnabled = localStorage.getItem('launcherEnabled') === 'true';
let currentProvider = (localStorage.getItem('launcherProvider') || 'microsoft') as keyof typeof launcherData;

let wallpaperEnabled = localStorage.getItem('wallpaperEnabled') === 'true';
let currentWallpaperSource = (localStorage.getItem('wallpaperSource') || 'local') as WallpaperSource;
let currentWallpaperType = (localStorage.getItem('wallpaperType') || 'preset') as WallpaperType;
let currentWallpaperValue = localStorage.getItem('wallpaperValue') || 'preset_1';
