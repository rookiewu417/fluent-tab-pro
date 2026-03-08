async function fetchDailyWallpaper(source: WallpaperType): Promise<string | null> {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `wallpaper_cache_${source}`;
    const now = Date.now();
    const CACHE_DURATION_MS = 10 * 60 * 60 * 1000;

    try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null') as WallpaperCacheEntry | null;
        const timestamp = cached?.timestamp || 0;
        if (cached && cached.url && timestamp > 0 && (now - timestamp) < CACHE_DURATION_MS) {
            console.log(`Loading ${source} from 10h cache.`);
            return cached.url;
        }
    } catch (e) { console.error('Error reading cache', e); }

    console.log(`Fetching new image from: ${source}...`);
    let imageUrl = '';
    let creditText = '';

    const notifyWallpaperApiWarning = (reason: string): void => {
        window.dispatchEvent(new CustomEvent('wallpaper-api-warning', {
            detail: { source, reason }
        }));
    };

    try {
        if (source === 'bing') {
            const res = await fetch('https://peapix.com/bing/feed?country=us');
            if (!res.ok) throw new Error(`Bing Error: ${res.status}`);
            const data = await res.json() as BingWallpaperItem[];

            if (data && data.length > 0) {
                const img = data[0];
                imageUrl = img.fullUrl || img.imageUrl || img.url || '';
                creditText = `Bing: ${img.copyright || 'Daily Image'}`;
            }
        } else if (source === 'nasa') {
            const fetchNasaApod = async (date?: string): Promise<NasaApodResponse> => {
                const url = date
                    ? `https://api.nasa.gov/planetary/apod?api_key=lP5JlT7l9NKOOWhBjDezKfFEvgwtmHfQH5pfSZHW&date=${encodeURIComponent(date)}`
                    : 'https://api.nasa.gov/planetary/apod?api_key=lP5JlT7l9NKOOWhBjDezKfFEvgwtmHfQH5pfSZHW';
                const response = await fetch(url);
                if (response.status === 429) throw new Error('NASA API limit reached.');
                if (!response.ok) throw new Error(`NASA Error: ${response.status}`);
                return await response.json() as NasaApodResponse;
            };

            const todayData = await fetchNasaApod();

            if (todayData.media_type === 'image') {
                imageUrl = todayData.hdurl || todayData.url || '';
                creditText = `NASA: ${todayData.title || 'APOD'}`;
            } else {
                notifyWallpaperApiWarning(todayData.media_type === 'video' ? 'video' : 'unavailable');
                return null;
            }
        } else if (source === 'wikimedia') {
            const fetchWiki = async (date: string): Promise<WikimediaQueryResponse> => {
                const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=images&titles=Template:Potd/${date}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;
                const response = await fetch(url);
                return await response.json() as WikimediaQueryResponse;
            };

            let data = await fetchWiki(today);
            let pages = data.query?.pages;

            if (!pages) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                data = await fetchWiki(yesterday);
                pages = data.query?.pages;
            }

            if (pages) {
                for (const page of Object.values(pages)) {
                    if (page?.imageinfo?.[0]) {
                        imageUrl = page.imageinfo[0].url;
                        const meta = page.imageinfo[0].extmetadata;
                        creditText = meta?.Artist?.value || 'Wikimedia Commons';
                        creditText = creditText.replace(/<[^>]*>?/gm, '');

                        // Limitar o tamanho do texto de crédito para evitar quebra de layout
                        const MAX_CREDIT_LENGTH = 120;
                        if (creditText.length > MAX_CREDIT_LENGTH) {
                            creditText = creditText.substring(0, MAX_CREDIT_LENGTH).trim() + '...';
                        }

                        break;
                    }
                }
            }
        }

        if (imageUrl) {
            localStorage.setItem(cacheKey, JSON.stringify({
                url: imageUrl,
                timestamp: now,
                credit: creditText
            }));

            return imageUrl;
        }

        throw new Error('No image URL found in the API response.');
    } catch (error) {
        if (source === 'nasa') notifyWallpaperApiWarning('error');
        console.error(`Error while searching ${source}:`, error);
        return null;
    }
}

function fetchSuggestionsFromService(query: string): Promise<string[]> {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    return fetch(url)
        .then(response => response.json())
        .then((data: SuggestionApiResponse) => {
            if (Array.isArray(data?.[1])) {
                return data[1].slice(0, 5);
            }
            return [];
        })
        .catch(error => {
            console.error('Error retrieving suggestions:', error);
            return [];
        });
}

async function fetchCityData(city: string, district?: string): Promise<CityData | null> {
    const amapKey = '3da93931654d638d4f15aade26933563';
    let searchQuery = city;
    if (district) {
        searchQuery = `${city}${district}`;
    }

    const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(searchQuery)}&key=${amapKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
            const geocode = data.geocodes[0];
            const locationStr = geocode.location;

            if (!locationStr || typeof locationStr !== 'string') return null;

            const [lonStr, latStr] = locationStr.split(',');
            const lon = parseFloat(lonStr);
            const lat = parseFloat(latStr);

            let resDistrict = typeof geocode.district === 'string' ? geocode.district : '';
            let resCity = typeof geocode.city === 'string' ? geocode.city : '';
            let resProvince = typeof geocode.province === 'string' ? geocode.province : '';

            if (!resCity && resProvince.endsWith('市')) {
                resCity = resProvince;
            }

            if (resCity.endsWith('市')) resCity = resCity.slice(0, -1);
            if (resDistrict.endsWith('区') || resDistrict.endsWith('县')) resDistrict = resDistrict.slice(0, -1);

            let displayName = '';
            if (resDistrict && resCity && resDistrict !== resCity) {
                const suffix = (typeof geocode.district === 'string' && geocode.district.endsWith('县')) ? '县' : '区';
                displayName = `${resDistrict}${suffix}, ${resCity}`;
            } else if (resCity) {
                displayName = resCity;
            } else if (resProvince) {
                displayName = resProvince;
            } else {
                displayName = typeof geocode.formatted_address === 'string' ? geocode.formatted_address : searchQuery;
            }

            if (district && !displayName.includes(district)) {
                let formattedDistrict = district;
                const suffix = formattedDistrict.endsWith('县') ? '县' : '区';
                if (formattedDistrict.endsWith('区') || formattedDistrict.endsWith('县')) {
                    formattedDistrict = formattedDistrict.slice(0, -1);
                }
                displayName = `${formattedDistrict}${suffix}, ${resCity || resProvince || city}`;
            }

            let country = typeof geocode.country === 'string' ? geocode.country : 'CN';
            if (country === '中国') country = 'cn';

            const adcode = typeof geocode.adcode === 'string' ? geocode.adcode : '';

            return { name: displayName, lat, lon, country, adcode };
        }
    } catch (error) {
        console.error('AMap geocode failed', error);
    }

    return null;
}

async function fetchWeatherData(cityData: CityData): Promise<WeatherApiResponse | null> {
    const amapKey = '3da93931654d638d4f15aade26933563';
    if (!cityData.adcode) return null;

    const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${cityData.adcode}&key=${amapKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === '1' && data.lives && data.lives.length > 0) {
            const live = data.lives[0];
            const temp = parseFloat(live.temperature);
            const humidity = parseFloat(live.humidity);

            const hour = new Date().getHours();
            const isDay = (hour >= 6 && hour < 18) ? 1 : 0;

            return {
                current_weather: {
                    temperature: temp,
                    weathercode: -1,
                    is_day: isDay,
                    weatherDesc: live.weather,
                    humidity: humidity,
                    windpower: live.windpower,
                    winddirection: live.winddirection
                }
            };
        }
    } catch (e) {
        console.error('AMap weather fetch failed', e);
    }
    return null;
}
