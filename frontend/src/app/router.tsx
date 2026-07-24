import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { OnboardingLayout } from './layout/OnboardingLayout';
import { LandingPage } from '../features/landing/LandingPage';
import { SignInPage } from '../features/authentication/SignInPage';
import { SignUpPage } from '../features/authentication/SignUpPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { NotFoundPage } from './NotFoundPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { PublicOnlyRoute } from '../components/common/PublicOnlyRoute';
import { GeneratePlanPage } from '../features/workouts/GeneratePlanPage';
import { CurrentPlanPage } from '../features/workouts/CurrentPlanPage';
import { WorkoutDayDetailPage } from '../features/workouts/WorkoutDayDetailPage';
import { RecoveryCheckInPage } from '../features/workouts/RecoveryCheckInPage';
import { WorkoutSessionPage } from '../features/workouts/WorkoutSessionPage';
import { PlanHistoryPage } from '../features/workouts/PlanHistoryPage';
import { VersionComparisonPage } from '../features/workouts/VersionComparisonPage';
import { DecisionExplanationsPage } from '../features/workouts/DecisionExplanationsPage';
import { NutritionPage } from '../features/nutrition/NutritionPage';
import { GoalsPage } from '../features/goals/GoalsPage';
import { CalendarPage } from '../features/calendar/CalendarPage';
import { CoachPage } from '../features/coach/CoachPage';
import { MemoryPage } from '../features/memories/MemoryPage';
import { HabitsPage } from '../features/habits/HabitsPage';


export const router = createBrowserRouter([
  // Public/unauthenticated landing page (no AppLayout)
  {
    path: '/',
    element: <LandingPage />,
  },
  
  // Public Auth Pages
  {
    path: 'signin',
    element: (
      <PublicOnlyRoute>
        <SignInPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: 'login',
    element: (
      <PublicOnlyRoute>
        <SignInPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: 'signup',
    element: (
      <PublicOnlyRoute>
        <SignUpPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: 'register',
    element: (
      <PublicOnlyRoute>
        <SignUpPage />
      </PublicOnlyRoute>
    ),
  },

  // Onboarding (authenticated, onboarding incomplete)
  {
    path: 'onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <OnboardingPage /> },
    ],
  },

  // Protected App Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'workouts', element: <CurrentPlanPage /> },
      { path: 'workouts/current', element: <CurrentPlanPage /> },
      { path: 'workouts/generate', element: <GeneratePlanPage /> },
      { path: 'workouts/day/:dayId', element: <WorkoutDayDetailPage /> },
      { path: 'workouts/session/:sessionId', element: <WorkoutSessionPage /> },
      { path: 'workouts/history', element: <PlanHistoryPage /> },
      { path: 'workouts/compare', element: <VersionComparisonPage /> },
      { path: 'workouts/explanations', element: <DecisionExplanationsPage /> },
      { path: 'recovery', element: <RecoveryCheckInPage /> },
      { path: 'nutrition', element: <NutritionPage /> },
      { path: 'settings', element: <ProfilePage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'coach', element: <CoachPage /> },
      { path: 'memory', element: <MemoryPage /> },
      { path: 'habits', element: <HabitsPage /> },
    ],
  },

  // Wildcard Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
