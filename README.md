# Reviews Parser

Приложение для парсинга отзывов с Яндекс.Карт. Laravel 11 (API) + Vue 3 (SPA).

## Демо

https://reviews-parser-production.up.railway.app

**Логин:** admin@example.com  
**Пароль:** password

> **Важно:** Яндекс блокирует IP-адреса дата-центров. На хостинге парсинг может не работать — Яндекс возвращает CAPTCHA вместо отзывов. Локально всё работает корректно. В продакшне для обхода блокировки необходим резидентный прокси.

## Локальный запуск

### Требования

- PHP 8.4+
- Composer
- Node.js 20+
- SQLite

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/MariaYureva/reviews-parser.git
cd reviews-parser

# Настроить бэкенд
cd backend
cp .env.example .env
# В .env установить:
# DB_CONNECTION=sqlite
# DB_DATABASE=/абсолютный/путь/до/backend/database/database.sqlite

composer install
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan db:seed

# Установить зависимости парсера
cd scraper
npm install
cd ..

# Запустить бэкенд
php artisan serve
```

```bash
# В отдельном терминале — настроить фронтенд
cd frontend
cp .env.local.example .env.local  # или создать вручную
# Содержимое .env.local:
# VITE_API_URL=http://localhost:8000/api

npm install
npm run dev
```

Открыть: http://localhost:5173

### Переменные окружения

| Переменная | Описание | Пример |
|---|---|---|
| `DB_CONNECTION` | Драйвер БД | `sqlite` |
| `DB_DATABASE` | Путь к SQLite файлу | `/path/to/database.sqlite` |
| `APP_KEY` | Ключ приложения (генерируется) | `base64:...` |
| `VITE_API_URL` | URL API для фронтенда | `http://localhost:8000/api` |

## Docker / Railway

```bash
docker build -t reviews-parser .
docker run -p 8000:8000 reviews-parser
```

Открыть: http://localhost:8000

## Подход к парсингу

### Почему Playwright + Stealth

Яндекс.Карты не предоставляют публичного API для отзывов. Данные загружаются динамически через JavaScript при скролле страницы.

Были рассмотрены альтернативы:
- **Перехват внутренних API-запросов** — Яндекс шифрует и подписывает запросы, воспроизвести без реверс-инжиниринга сложно
- **Статический парсинг (curl/Guzzle)** — не работает, страница требует JS
- **Selenium** — тяжелее, хуже обходит защиту
- **Playwright + puppeteer-extra-plugin-stealth** — выбран как наиболее надёжный: маскирует headless-браузер под реального пользователя, умеет скроллить страницу для подгрузки отзывов

### Как работает парсер

1. Открывает страницу `/reviews/` организации в headless Chromium
2. Ждёт загрузки первых отзывов
3. Симулирует скролл мышью (`page.mouse.wheel`) — именно это триггерит подгрузку следующих отзывов (обычный `scrollTop` не работает)
4. Повторяет скролл пока не перестанут появляться новые отзывы или не достигнет ~600
5. Извлекает: название организации, средний рейтинг, количество оценок, все отзывы

### Кэширование

Результат парсинга сохраняется в БД. Повторный парсинг запускается только если прошло более 1 часа с последнего (`parsed_at`). Это позволяет быстро отдавать отзывы при повторных запросах и не нагружать Яндекс.

### Ограничения

- Яндекс отдаёт максимум ~600 последних отзывов — это техническое ограничение платформы
- На серверах дата-центров Яндекс блокирует headless-браузеры по IP. Для продакшн-использования нужен резидентный прокси (например Bright Data, Oxylabs)

## Архитектура

```
backend/
  app/
    Http/Controllers/
      AuthController.php       # Логин / логаут / текущий пользователь
      OrganizationController.php # Сохранение URL, запуск парсинга
      ReviewController.php     # Пагинированный список отзывов
    Models/
      Organization.php
      Review.php
      User.php
    Services/
      YandexParser.php         # Вся логика парсинга вынесена сюда
  scraper/
    parse.js                   # Node.js скрипт с Playwright

frontend/
  src/
    api/axios.js               # Axios с Bearer-токеном
    stores/
      auth.js                  # Pinia: авторизация
      organization.js          # Pinia: организация и отзывы
    views/
      LoginView.vue
      SettingsView.vue
      ReviewsView.vue
```

## Что доделал бы при наличии времени

- **Резидентный прокси** — чтобы парсинг работал с продакшн-сервера
- **Очередь задач (Laravel Queue)** — парсинг в фоне, без таймаута HTTP-запроса; фронтенд polling или WebSocket для статуса
- **Несколько организаций на пользователя** — сейчас одна на аккаунт
- **MySQL в продакшне** — сейчас SQLite, не подходит для нескольких реплик
- **Регистрация пользователей**
- **Экспорт отзывов в CSV/Excel**
- **Автообновление по расписанию** (Laravel Scheduler) — раз в час обновлять кэш
