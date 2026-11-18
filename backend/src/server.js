import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) throw new Error('Set MONGODB_URI and JWT_SECRET in your environment.');
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong.' });
});
const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI).then(() => app.listen(port, () => console.log(`Student Task Manager API listening on ${port}`)))
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
