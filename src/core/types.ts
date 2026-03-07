interface ChromeLike {
    i18n: {
        getMessage: (messageName: string, substitutions?: string[]) => string;
    };
    runtime: {
        getManifest: () => { version: string };
    };
    storage?: {
        local?: {
            get: (
                keys: string | string[] | Record<string, unknown> | null,
                callback: (items: Record<string, unknown>) => void
            ) => void;
            set: (items: Record<string, unknown>, callback?: () => void) => void;
        };
    };
}

declare const chrome: ChromeLike;

interface Window {
    getTranslation: (key: string) => string;
}


interface EngineConfig {
    url: string;
    icon: string;
}

interface LauncherApp {
    name: string;
    url: string;
    icon: string;
}

interface LauncherProviderData {
    apps: LauncherApp[];
    allAppsLink: string;
}

interface CityData {
    name: string;
    lat: number;
    lon: number;
    country?: string;
}

interface WeatherCurrent {
    temperature: number;
    weathercode: number;
    is_day: number;
}

interface WeatherApiResponse {
    current_weather?: WeatherCurrent;
}

interface GeocodingResult {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    country_code?: string;
    admin1?: string;
    admin2?: string;
    admin3?: string;
}

interface GeocodingResponse {
    results?: GeocodingResult[];
}

interface BingWallpaperItem {
    fullUrl?: string;
    imageUrl?: string;
    url?: string;
    copyright?: string;
}

interface NasaApodResponse {
    media_type?: string;
    hdurl?: string;
    url?: string;
    title?: string;
}

interface WikimediaImageInfo {
    url: string;
    extmetadata?: {
        Artist?: { value?: string };
    };
}

interface WikimediaPage {
    imageinfo?: WikimediaImageInfo[];
}

interface WikimediaQueryResponse {
    query?: {
        pages?: Record<string, WikimediaPage>;
    };
}

type SuggestionApiResponse = [string, string[]];

interface WeatherCache {
    timestamp: number;
    city: string;
    data: WeatherApiResponse;
}

type BackupPayload = Record<string, string | undefined>;

interface WallpaperCacheEntry {
    url?: string;
    date?: string;
    timestamp?: number;
    credit?: string;
}

type ThemeMode = 'light' | 'dark' | 'auto';
type WeatherUnit = 'c' | 'f';
type WallpaperSource = 'local' | 'api';
type WallpaperType = 'preset' | 'upload' | 'bing' | 'nasa' | 'wikimedia';
