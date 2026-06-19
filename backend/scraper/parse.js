const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');

chromium.use(stealth());

const url = process.argv[2];

if (!url) {
    console.error(JSON.stringify({ error: 'No URL provided' }));
    process.exit(1);
}

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        locale: 'ru-RU',
        viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();

    try {
        const reviewsUrl = url.split('?')[0].replace(/\/?$/, '/reviews/');
        await page.goto(reviewsUrl, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(3000);

        await page.waitForSelector('.business-reviews-card-view__review', { timeout: 30000 });

        // Наводим мышь на панель и скроллим колесом как реальный пользователь
        await page.mouse.move(400, 400);

        let prevCount = 0;
        let sameCount = 0;

        while (sameCount < 5) {
            for (let i = 0; i < 10; i++) {
                await page.mouse.wheel(0, 500);
                await page.waitForTimeout(100);
            }

            await page.waitForTimeout(2000);

            const count = await page.$$eval('.business-reviews-card-view__review', els => els.length);

            if (count === prevCount) {
                sameCount++;
            } else {
                sameCount = 0;
                prevCount = count;
            }

            if (count >= 600) break;
        }

        // Имя организации
        const orgName = await page.evaluate(() => {
            const el = document.querySelector('[class*="orgpage-header-view__name"]') ?? document.querySelector('h1');
            return el?.textContent.trim() ?? document.title.replace(' — Яндекс Карты', '').trim();
        });

        // Рейтинг — склеиваем спаны "4" + "," + "6" → "4.6"
        const avgRating = await page.evaluate(() => {
            const spans = document.querySelectorAll('.business-summary-rating-badge-view__rating-text');
            if (!spans.length) return null;
            const text = Array.from(spans).map(s => s.textContent.trim()).join('').replace(',', '.');
            return parseFloat(text) || null;
        });

        const ratingsCount = await page.$eval(
            '.business-summary-rating-badge-view__rating-count',
            el => parseInt(el.textContent.replace(/[^\d]/g, ''))
        ).catch(() => null);

        // Отзывы
        const reviews = await page.$$eval('.business-reviews-card-view__review', items =>
            items.map(el => {
                const author = el.querySelector('.business-review-view__author-name')
                    ?.textContent.trim() ?? 'Аноним';

                const fullStars = el.querySelectorAll('.business-rating-badge-view__star._full');
                const rating = fullStars.length > 0 ? String(fullStars.length) : null;

                const dateEl = el.querySelector('.business-review-view__date');
                const date = dateEl?.getAttribute('title') ?? dateEl?.textContent.trim() ?? '';

                const textEl = el.querySelector('.spoiler-view__text-container')
                    ?? el.querySelector('.business-review-view__body-text')
                    ?? el.querySelector('[itemprop="reviewBody"]');
                const text = textEl?.textContent.trim() ?? '';

                return { author, rating, date, text };
            })
        );

        await browser.close();

        console.log(JSON.stringify({
            name: orgName,
            avg_rating: avgRating,
            ratings_count: ratingsCount,
            reviews_count: reviews.length,
            reviews,
        }));

    } catch (err) {
        await browser.close();
        console.error(JSON.stringify({ error: err.message }));
        process.exit(1);
    }
})();
