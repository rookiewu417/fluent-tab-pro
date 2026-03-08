import os

file_path = 'src/core/services.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if line.startswith('async function fetchCityData'):
        start_idx = i
    if start_idx != -1 and line.strip() == 'return null;':
        end_idx = i + 1

if start_idx != -1 and end_idx != -1:
    new_code_lines = """async function fetchCityData(city: string, district?: string): Promise<CityData | null> {
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
}
"""
    new_lines = lines[:start_idx] + [new_code_lines] + lines[end_idx+1:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Replace success!")
else:
    print("Indices not found:", start_idx, end_idx)
