# SmartAttend — Система контроля посещаемости с динамическими QR-кодами

## Технологический стек

| Слой        | Технология                              |
|-------------|-----------------------------------------|
| Backend     | Node.js 20 + Express 4                  |
| База данных | PostgreSQL 15                           |
| Кэш / TTL   | Redis 7                                 |
| Frontend    | React 18 + Vite + Redux Toolkit         |
| Графики     | Recharts                                |
| Контейнеры  | Docker + Docker Compose                 |

---

## Быстрый старт

### Вариант 1 — Docker (рекомендуется)

```bash
git clone <repo> && cd smartattend
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker-compose up -d
# Наполнить тестовыми данными:
docker exec sa_api node src/config/seed.js
```

### Вариант 2 — Локально (требуется PostgreSQL + Redis)

```bash
# Настроить .env файлы
cp backend/.env.example backend/.env   # заполнить DB_* и REDIS_*
cp frontend/.env.example frontend/.env

# Backend
cd backend && npm install && npm run seed && npm run dev

# Frontend (новый терминал)
cd frontend && npm install && npm run dev
```

---

## Доступ

| Сервис      | URL                      |
|-------------|--------------------------|
| Frontend    | http://localhost:5173    |
| Backend API | http://localhost:3000    |
| Health      | http://localhost:3000/health |

---

## Тестовые аккаунты

| Роль            | Email                    | Пароль       |
|-----------------|--------------------------|--------------|
| Администратор   | admin@smartattend.kz     | Admin123!    |
| Преподаватель   | teacher@smartattend.kz   | Teacher123!  |
| Студент         | student@smartattend.kz   | Student123!  |

---

## Структура проекта

```
smartattend/
├── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── app.js                  # Точка входа Express
│   │   ├── config/
│   │   │   ├── db.js               # Подключение PostgreSQL
│   │   │   ├── redis.js            # Подключение Redis
│   │   │   ├── init.sql            # DDL-схема БД
│   │   │   └── seed.js             # Тестовые данные
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT аутентификация + авторизация по ролям
│   │   │   └── error.js            # Централизованный обработчик ошибок
│   │   ├── services/
│   │   │   ├── auth.service.js     # Логика JWT, login, refresh, logout
│   │   │   ├── qr.service.js       # HMAC-SHA256 генерация/верификация QR-токенов
│   │   │   └── attendance.service.js # Геолокация, статус, журнал
│   │   ├── controllers/            # HTTP-обработчики (тонкий слой)
│   │   ├── routes/                 # Express-маршруты
│   │   ├── validators/             # Joi-схемы валидации
│   │   └── utils/
│   │       ├── logger.js           # Winston логгер
│   │       └── geo.js              # Формула Хаверсина
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
└── frontend/
    ├── src/
    │   ├── main.jsx                # Точка входа React
    │   ├── App.jsx                 # Роутинг по ролям
    │   ├── api/                    # Axios + API-методы
    │   ├── store/
    │   │   └── slices/             # Redux Toolkit slices
    │   ├── components/
    │   │   ├── common/             # ProtectedRoute, Toast, Badges
    │   │   ├── layout/             # Sidebar, layouts по ролям
    │   │   └── teacher/            # QRDisplay, AttendanceTable
    │   ├── pages/
    │   │   ├── auth/               # Страница входа
    │   │   ├── student/            # Дашборд, журнал, сканирование
    │   │   ├── teacher/            # Дашборд, список, создание, детали занятия
    │   │   └── admin/              # Дашборд с графиками, пользователи, занятия
    │   └── styles/global.css       # Все стили
    ├── .env.example
    ├── Dockerfile
    ├── nginx.conf
    └── package.json
```

---

## API Endpoints

| Метод  | URL                              | Роль            |
|--------|----------------------------------|-----------------|
| POST   | /api/v1/auth/login               | Все             |
| POST   | /api/v1/auth/refresh             | Все             |
| POST   | /api/v1/auth/logout              | Авториз.        |
| GET    | /api/v1/auth/me                  | Авториз.        |
| GET    | /api/v1/classes                  | Teacher/Admin   |
| POST   | /api/v1/classes                  | Teacher/Admin   |
| GET    | /api/v1/classes/:id/qr           | Teacher/Admin   |
| GET    | /api/v1/classes/:id/attendance   | Teacher/Admin   |
| POST   | /api/v1/attendance/scan          | Student         |
| GET    | /api/v1/attendance/my            | Student         |
| GET    | /api/v1/users                    | Admin           |
| POST   | /api/v1/users                    | Admin           |
| GET    | /api/v1/users/stats              | Admin           |
| GET    | /api/v1/subjects                 | Авториз.        |
| GET    | /api/v1/subjects/groups          | Авториз.        |

---

## Безопасность

- **HMAC-SHA256** — подпись QR-токенов, срок жизни 90 сек
- **One-time token** — токен удаляется из Redis после первого использования
- **JWT** — access (15 мин) + refresh (7 дней) с blacklist
- **Геолокация** — проверка радиуса 150 м от аудитории
- **Rate limiting** — 500 req/15 min, 5 scan/min
- **Helmet** — HTTP security headers
- **TLS 1.3** — на продакшн-окружении
