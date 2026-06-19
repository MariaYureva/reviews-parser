FROM php:8.4-cli

# System dependencies
RUN apt-get update && apt-get install -y \
    curl git unzip sqlite3 libsqlite3-dev \
    chromium fonts-liberation \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 \
    libcups2 libdbus-1-3 libdrm2 libgbm1 \
    libgtk-3-0 libnspr4 libnss3 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    xdg-utils ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install pdo pdo_sqlite

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm ci && npm run build

# Copy built frontend to Laravel public
RUN cp -r dist/. /app/backend/public/

# Install Laravel dependencies
WORKDIR /app/backend
RUN composer install --no-dev --optimize-autoloader

# Install scraper dependencies + Playwright Chromium
WORKDIR /app/backend/scraper
RUN npm ci && npx playwright install chromium --with-deps

# Configure Laravel
WORKDIR /app/backend
RUN cp .env.example .env \
    && php artisan key:generate \
    && touch database/database.sqlite \
    && php artisan migrate --force \
    && php artisan db:seed --force

EXPOSE ${PORT:-8000}

CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
