// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import roadmapRoutes from "./routes/roadmap.js";
import tasksRoutes from './routes/tasks.js';
import userRoutes from './routes/user.js';
import resumeRoutes from './routes/resumeRoutes.js';

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

// CORS configuration
app.use(cors({
  origin: [process.env.FRONTEND_URL , 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/resumes', resumeRoutes);

// Import error handlers
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0');

startTaskEmailScheduler();
