import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import SignUp from './pages/SignUp.jsx'
import SignIn from './pages/SignIn.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import UserLayout from './pages/user/UserLayout.jsx'
import Overview from './pages/user/Overview.jsx'
import Transactions from './pages/user/Transactions.jsx'
import Analytics from './pages/user/Analytics.jsx'
import Settings from './pages/user/Settings.jsx'
import AIAssistant from './pages/user/AIAssistant.jsx'

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/dashboard/transactions" element={<Transactions />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/ai-assistant" element={<AIAssistant />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App
