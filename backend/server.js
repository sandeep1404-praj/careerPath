// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';

import connectDB from './config/db.js';
import { initRedis } from './config/redis.js';
import authRoutes from './routes/auth.js';
import roadmapRoutes from "./routes/roadmap.js";
import tasksRoutes from './routes/tasks.js';
import userRoutes from './routes/user.js';
import resumeRoutes from './routes/resumeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import testRoutes from './routes/test.js';

dotenv.config();
const app = express();

import { startTaskEmailScheduler } from './utils/taskEmailScheduler.js';

// Security headers with helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable CSP for now, configure later
}));

// Enable gzip compression with higher level for better compression
app.use(compression({ level: 6, threshold: 1024 }));

// CORS configuration (dynamic, supports multiple frontends)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://careerpathsan.netlify.app'
].filter(Boolean);

console.log('🔐 CORS Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow REST tools or same-origin (no origin header)
    if (!origin) {
      console.log('✅ CORS: No origin header (same-origin or REST tool)');
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Origin allowed - ${origin}`);
      return callback(null, true);
    }
    console.error(`❌ CORS: Origin blocked - ${origin}`);
    return callback(new Error(`CORS blocked: ${origin} not in allowed origins`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // cache preflight for 24 hours
}));

// Optionally specify success status for legacy browsers
app.use((req, res, next) => {
  res.header('Vary', 'Origin');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: 'text/plain', limit: '10mb' }));

// Attempt to parse JSON bodies that arrived as text/plain (common in older clients)
app.use((req, res, next) => {
  if (typeof req.body === 'string') {
    const trimmed = req.body.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        req.body = JSON.parse(trimmed);
      } catch (parseError) {
        // Silent parse error
      }
    }
  }
  next();
});


// Connect MongoDB
connectDB();

// Initialize Redis for caching (non-blocking)
// If Redis is not available, app will continue without caching
initRedis().catch(err => {
  console.warn('⚠️ Redis initialization failed:', err.message);
  console.warn('⚠️ App will continue without Redis caching');
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root route to prevent noisy 404 logs from platform probes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'CareerPath API running', health: '/health' });
});

// Favicon placeholder (avoid 404 spam from browsers requesting /favicon.ico)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/test', testRoutes);

// Import error handlers
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}`);
  startTaskEmailScheduler();
  console.log('📧 Task email scheduler started\n');
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server Error:', err);
  process.exit(1);
});
