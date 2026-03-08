import * as fs from 'fs';

const servicePath = 'src/core/services.ts';
let code = fs.readFileSync(servicePath, 'utf8');

// 1. 修改 fetchCityData 以保留 adcode
code = code.replace(
    /let country = typeof geocode.country === 'string' \? geocode.country : 'CN';\s*if \(country === '中国'\) country = 'cn';\s*return { name: displayName, lat, lon, country };/,
    `let country = typeof geocode.country === 'string' ? geocode.country : 'CN';
            if (country === '中国') country = 'cn';

            let adcode = typeof geocode.adcode === 'string' ? geocode.adcode : undefined;

            return { name: displayName, lat, lon, country, adcode };`
);

// 2. 替换 fetchWeatherData
const oldFetchWeatherPattern = /async function fetchWeatherData\(cityData: CityData\): Promise<WeatherApiResponse \| null> {[\s\S]*?}/;
const newFetchWeatherCode = `async function fetchWeatherData(cityData: CityData): Promise<WeatherApiResponse | null> {
    const amapKey = '3da93931654d638d4f15aade26933563';
    
    // 兼容老缓存: 如果没有 adcode 且有 name，先去查一下 adcode
    let targetAdcode = cityData.adcode;
    if (!targetAdcode && cityData.name) {
        // 提取名称去查询
        const nameToSearch = cityData.name.split(',').pop()?.trim() || cityData.name;
        const geoUrl = \`https://restapi.amap.com/v3/geocode/geo?address=\${encodeURIComponent(nameToSearch)}&key=\${amapKey}\`;
        try {
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();
            if (geoData.status === '1' && geoData.geocodes && geoData.geocodes.length > 0) {
                targetAdcode = geoData.geocodes[0].adcode;
                // 更新进引用的对象以便外层能存
                cityData.adcode = targetAdcode;
            }
        } catch(e) { console.error('Compat geo fetch failed', e); }
    }

    if (!targetAdcode) {
        throw new Error('No valid adcode found for AMap Weather');
    }

    const url = \`https://restapi.amap.com/v3/weather/weatherInfo?city=\${targetAdcode}&key=\${amapKey}\`;
    const response = await fetch(url);
    const data = await response.json() as AMapWeatherResponse;

    if (data.status === '1' && data.lives && data.lives.length > 0) {
        const live = data.lives[0];
        
        // 转换高德天气名称为自定义或原有的 open-meteo code
        let code = 3; // 默认多云
        const wInfo = live.weather;
        
        if (wInfo.includes('晴')) code = 0;
        else if (wInfo.includes('多云')) code = 2;
        else if (wInfo.includes('阴')) code = 3;
        else if (wInfo.includes('阵雨')) code = 80;
        else if (wInfo.includes('雷阵雨')) code = 95;
        else if (wInfo.includes('雨夹雪')) code = 66;
        else if (wInfo.includes('小雨')) code = 61;
        else if (wInfo.includes('中雨')) code = 63;
        else if (wInfo.includes('大雨') || wInfo.includes('暴雨')) code = 65;
        else if (wInfo.includes('小雪')) code = 71;
        else if (wInfo.includes('中雪')) code = 73;
        else if (wInfo.includes('大雪') || wInfo.includes('暴雪')) code = 75;
        else if (wInfo.includes('雾')) code = 45;
        else if (wInfo.includes('霾')) code = 45;
        else if (wInfo.includes('沙') || wInfo.includes('尘')) code = 45;
        else if (wInfo.includes('冰雹')) code = 96;

        const currentHour = new Date().getHours();
        const isDayFlag = (currentHour >= 6 && currentHour < 18) ? 1 : 0;

        return {
            current_weather: {
                temperature: parseFloat(live.temperature),
                weathercode: code,
                is_day: isDayFlag
            }
        };
    }

    return null;
}`;

code = code.replace(oldFetchWeatherPattern, newFetchWeatherCode);

fs.writeFileSync(servicePath, code, 'utf8');
console.log('services updated');
