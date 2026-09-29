import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import shiftRoutes from './routes/shiftRoutes';
import careHomeRoutes from './routes/careHomeRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import externalApiRoutes from './routes/externalApiRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import prisma from './utils/prisma';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5002;

app.use(
  cors({
    origin: [
      'http://localhost:3000',  // Keris frontend
      'http://localhost:3001',  // Care Home frontend
      'http://localhost:5001',  // Keris backend
      'http://localhost:5002',  // Care Home backend (self)
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Service-Name'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'UK Care Home Shift & Vacancy Platform API',
    timestamp: new Date().toISOString(),
  });
});

// Root Info
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'UK Care Home Shift & Vacancy Management Platform API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      shifts: 'GET /api/shifts',
      openShifts: 'GET /api/shifts/open',
      urgentShifts: 'GET /api/shifts/urgent',
      shiftById: 'GET /api/shifts/:id',
      careHomes: 'GET /api/care-homes',
      dashboardSummary: 'GET /api/dashboard/summary',
    },
  });
});

// Feature Routes
app.use('/api/shifts', shiftRoutes);
app.use('/api/care-homes', careHomeRoutes);
app.use('/api/dashboard', dashboardRoutes);
// External API routes (protected by API key)
app.use('/api/external', externalApiRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`\n================================================================`);
  console.log(`🏥 UK Care Home Shift Platform API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Shifts API: http://localhost:${PORT}/api/shifts`);
  console.log(`📈 Dashboard API: http://localhost:${PORT}/api/dashboard/summary`);
  console.log(`================================================================\n`);
});

async function gracefulShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down cleanly...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database connection released.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default app;
