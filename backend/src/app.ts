import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { healthController } from './modules/health/health.controller';
import { authRoutes } from './modules/authentication/auth.routes';
import { userRoutes } from './modules/users/user.routes';
import { onboardingRoutes } from './modules/onboarding/onboarding.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { workoutRoutes } from './modules/workouts/workouts.routes';
import { adaptivePlanningRoutes } from './modules/adaptive-planning/adaptive-planning.routes';
import { recoveryRoutes } from './modules/recovery-score/recovery-score.routes';
import { versionControlRoutes } from './modules/workout-version-control/version-control.routes';
import { decisionExplanationRoutes } from './modules/ai-decision-explanation/decision-explanation.routes';
import { workoutSessionRoutes } from './modules/adaptive-planning/workout-session.routes';
import { notificationRoutes } from './modules/notifications/notification.routes';
import { coachRoutes } from './modules/ai-coach/coach.routes';
import { memoryRoutes } from './modules/memories/memory.routes';
import { habitRoutes } from './modules/smart-habits/habit.routes';
import { calendarRoutes } from './modules/smart-calendar/calendar.routes';

export const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
});

app.use('/api', limiter);
app.use(requestLogger);

app.get('/api/v1/health', healthController.getHealth);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/workout-plans', adaptivePlanningRoutes);
app.use('/api/v1/workout-plans', versionControlRoutes);
app.use('/api/v1/workout-plans', decisionExplanationRoutes);
app.use('/api/v1/recovery', recoveryRoutes);
app.use('/api/v1/workout-sessions', workoutSessionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/ai-coach', coachRoutes);
app.use('/api/v1/memories', memoryRoutes);
app.use('/api/v1/smart-habits', habitRoutes);
app.use('/api/v1/smart-calendar', calendarRoutes);

app.use((req, _res, next) => {
  try {
    notFoundHandler(req);
  } catch (error) {
    next(error);
  }
});
app.use(errorHandler);
