require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit   = require('express-rate-limit');

const { testConnection } = require('./config/db');
const { connectRedis }   = require('./config/redis');
const logger             = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/error');

const authRoutes       = require('./routes/auth.routes');
const classesRoutes    = require('./routes/classes.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const usersRoutes      = require('./routes/users.routes');
const subjectsRoutes   = require('./routes/subjects.routes');

const app = express();
app.set('trust proxy', 1);

// ── Security middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ── Rate limiting ─────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});

const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 5,
  message: { success: false, error: 'Too many scan attempts' },
});

app.use('/api/', apiLimiter);
app.use('/api/v1/attendance/scan', scanLimiter);

// ── Request parsing ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/v1/auth',       authRoutes);
app.use('/api/v1/classes',    classesRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/users',      usersRoutes);
app.use('/api/v1/subjects',   subjectsRoutes);

// ── Error handling ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 3000;

async function startServer() {
  try {
    await testConnection();
    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`✓ SmartAttend API running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;