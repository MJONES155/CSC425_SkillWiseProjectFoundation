// TODO: Main Express application setup with middleware and routing
const Sentry = require('@sentry/node');
let profiling;
try {
  // Optional: profiling integration; skip if module unavailable
  // eslint-disable-next-line global-require
  ({ profilingIntegration: profiling } = require('@sentry/profiling-node'));
} catch (e) {
  profiling = null;
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const pino = require('pino');
const pinoHttp = require('pino-http');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const routes = require('./routes/index');

// Create Express app
const app = express();

// Create logger
const logger = pino({
  name: 'skillwise-api',
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// Initialize Sentry as early as possible (only if valid DSN provided)
const sentryDsn = process.env.SENTRY_DSN;
const isSentryEnabled =
  sentryDsn &&
  sentryDsn !== 'your-sentry-dsn-url' &&
  sentryDsn.startsWith('http');

if (isSentryEnabled) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
      ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
      : 1.0,
    profilesSampleRate: process.env.SENTRY_PROFILES_SAMPLE_RATE
      ? parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE)
      : 0.1,
    integrations: profiling ? [profiling()] : [],
  });
  console.log(
    '✅ Sentry initialized for environment:',
    process.env.NODE_ENV || 'development'
  );

  // Request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());
  // Tracing handler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
} else {
  console.log('⚠️  Sentry disabled: no valid DSN provided');
}

// Add request logging middleware
app.use(
  pinoHttp({
    logger,
    autoLogging: true,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
        },
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  })
);

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000, // limit each IP to 10000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(
      (parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000
    ),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/healthz' || req.path.startsWith('/static');
  },
});

app.use(limiter);

// Body parsing middleware
app.use(
  express.json({
    limit: '10mb',
    strict: true,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// Cookie parsing middleware
app.use(cookieParser());

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Mount API routes
app.use('/api', routes);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Sentry error handler should be before any other error middleware (only if enabled)
if (isSentryEnabled) {
  app.use(Sentry.Handlers.errorHandler());
}

// Global error handler (must be last)
app.use(errorHandler);

// Make logger available to other modules
app.set('logger', logger);

module.exports = app;
