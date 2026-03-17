import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import SignUp from './pages/SignUp.jsx'
import SignIn from './pages/SignIn.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import UserOversight from './pages/admin/UserOversight.jsx'
import SystemHealth from './pages/admin/SystemHealth.jsx'
import UserLayout from './pages/user/UserLayout.jsx'
import Overview from './pages/user/Overview.jsx'
import Transactions from './pages/user/Transactions.jsx'
import Analytics from './pages/user/Analytics.jsx'
import Settings from './pages/user/Settings.jsx'
import AIAssistant from './pages/user/AIAssistant.jsx'
import RoleGate from './components/auth/RoleGate.jsx'
import NotFound from './pages/NotFound.jsx'

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route
          element={
            <RoleGate allowedRoles={['user']} redirectTo="/admin/dashboard">
              <UserLayout />
            </RoleGate>
          }
        >
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/dashboard/transactions" element={<Transactions />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/ai-assistant" element={<AIAssistant />} />
          <Route path="/dashboard/settings" element={<Settings />} />
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
    </BrowserRouter>
  )
}

export default App
