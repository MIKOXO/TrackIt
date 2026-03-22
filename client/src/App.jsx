import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RoleGate from './components/auth/RoleGate.jsx'
import SecurityGate from './components/auth/SecurityGate.jsx'
import LoadingIndicator from './components/ui/LoadingIndicator.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const SignUp = lazy(() => import('./pages/SignUp.jsx'))
const SignIn = lazy(() => import('./pages/SignIn.jsx'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'))
const UserOversight = lazy(() => import('./pages/admin/UserOversight.jsx'))
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth.jsx'))
const UserLayout = lazy(() => import('./pages/user/UserLayout.jsx'))
const Overview = lazy(() => import('./pages/user/Overview.jsx'))
const Transactions = lazy(() => import('./pages/user/Transactions.jsx'))
const Analytics = lazy(() => import('./pages/user/Analytics.jsx'))
const Settings = lazy(() => import('./pages/user/Settings.jsx'))
const AIAssistant = lazy(() => import('./pages/user/AIAssistant.jsx'))
const SecurityQuestion = lazy(() => import('./pages/user/SecurityQuestion.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

const LoadingFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <LoadingIndicator />
  </div>
)

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          element={
            <RoleGate allowedRoles={['user']} redirectTo="/admin/dashboard">
              <SecurityGate>
                <UserLayout />
              </SecurityGate>
            </RoleGate>
          }
        >
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/dashboard/transactions" element={<Transactions />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/ai-assistant" element={<AIAssistant />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/security-question" element={<SecurityQuestion />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate replace to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserOversight />} />
          <Route path="system-health" element={<SystemHealth />} />
          <Route path="reports" element={<Navigate replace to="/admin/dashboard" />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)

export default App
