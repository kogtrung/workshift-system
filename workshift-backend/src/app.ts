import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { loadAuthEnv } from './config/env';
import authRoutes from './routes/authRoutes';
import groupRoutes from './routes/groupRoutes';
import adminRoutes from './routes/adminRoutes';
import positionRoutes from './routes/positionRoutes';
import shiftTemplateRoutes from './routes/shiftTemplateRoutes';
import shiftRoutes from './routes/shiftRoutes';
import shiftRequirementRoutes from './routes/shiftRequirementRoutes';
import shiftRegistrationRoutes from './routes/shiftRegistrationRoutes';
import registrationRoutes from './routes/registrationRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';

export function createApp() {
  loadAuthEnv();

  const app = express();
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: '*',
      credentials: false,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'OK', message: 'Workshift API is running' });
  });

  app.get('/', (_req, res) => {
    res.send('Workshift Management System API');
  });

  app.use('/api/v1/auth', authRoutes);
  /* Route cụ thể /groups/:groupId/... phải trước router /groups để không bị nuốt bởi :id */
  app.use('/api/v1/groups/:groupId/positions', positionRoutes);
  app.use('/api/v1/groups/:groupId/shift-templates', shiftTemplateRoutes);
  app.use('/api/v1/groups/:groupId/shifts', shiftRoutes);
  app.use('/api/v1/groups', groupRoutes);
  app.use('/api/v1/shifts/:shiftId/requirements', shiftRequirementRoutes);
  app.use('/api/v1/shifts/:shiftId', shiftRegistrationRoutes);
  app.use('/api/v1/registrations', registrationRoutes);
  app.use('/api/v1/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
