// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import roadmapRoutes from "./routes/roadmap.js";
import { seedRoadmaps } from './utils/seedRoadmaps.js';

dotenv.config();
const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
        console.warn('⚠️ Failed to parse text/plain body as JSON:', parseError.message);
      }
    }
  }
  next();
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Raw body type:', typeof req.body);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});


// Connect MongoDB and seed data
connectDB().then(async () => {
  console.log('🔗 Database connected, attempting to seed roadmaps...');
  // Seed roadmaps on startup
  try {
    await seedRoadmaps();
    console.log('✅ Roadmap seeding completed successfully');
  } catch (error) {
    console.log('⚠️ Roadmap seeding skipped or failed:', error.message);
    console.error('Seeding error details:', error);
  }
}).catch((error) => {
  console.error('❌ Database connection failed:', error);
});

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/roadmaps", roadmapRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email verification: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
