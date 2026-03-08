import re

file_path = 'src/core/services.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'async function fetchCityData\([\s\S]*?return null;\r?\n\}'

new_code = '''async function fetchCityData(city: string, district?: string): Promise<CityData | null> {
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

            return { name: displayName, lat, lon, country };
        }
    } catch (error) {
        console.error('AMap geocode failed', error);
    }

    return null;
}'''

new_content = re.sub(pattern, new_code, content)

if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Pattern not found")
