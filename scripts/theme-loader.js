(function () {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    if (savedTheme === 'dark' || (savedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    const wallpaperEnabled = localStorage.getItem('wallpaperEnabled') === 'true';
    if (!wallpaperEnabled) return;

    const wallpaperSource = localStorage.getItem('wallpaperSource') || 'local';
    const wallpaperType = localStorage.getItem('wallpaperType') || 'preset';
    const wallpaperValue = localStorage.getItem('wallpaperValue') || 'preset_1';

    function injectWallpaper(url, isPreload = false) {
        if (!url) return;

        if (isPreload) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            document.head.appendChild(link);
        }

        const style = document.createElement('style');
        style.id = 'early-wallpaper-style';
        style.textContent = `body { background-image: url('${url}'); background-size: cover; background-position: center; background-attachment: fixed; }`;
        document.head.appendChild(style);
        document.documentElement.setAttribute('data-early-wallpaper', 'true');
    }

    if (wallpaperSource === 'local' && wallpaperType === 'preset') {
        const presetMap = {
            preset_1: 'assets/wallpapers/fluent1.webp',
            preset_2: 'assets/wallpapers/fluent2.webp',
            preset_3: 'assets/wallpapers/fluent3.webp'
        };
        injectWallpaper(presetMap[wallpaperValue] || presetMap.preset_1);
        return;
    }

    if (wallpaperSource === 'local' && wallpaperType === 'upload') {
        const base64Url = localStorage.getItem('custom_wallpaper_base64');
        if (base64Url) {
            window.__earlyWallpaperUrl = base64Url;
            // Since base64 is already a URL, we don't need object URL revocation management
            injectWallpaper(base64Url, true);
        }
        return;
    }

    if (wallpaperSource === 'api') {
        const cacheKey = `wallpaper_cache_${wallpaperType}`;
        const cacheDuration = 10 * 60 * 60 * 1000;
        try {
            const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
            const now = Date.now();
            const timestamp = Number(cached?.timestamp || 0);
            const cachedUrl = typeof cached?.url === 'string' ? cached.url : '';

            if (cachedUrl && timestamp > 0 && (now - timestamp) < cacheDuration) {
                injectWallpaper(cachedUrl);
            }
        } catch { }
    }
})();