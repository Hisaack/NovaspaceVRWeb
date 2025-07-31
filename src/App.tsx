import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
import TrainingSteps from './pages/TrainingSteps';
import VirtualUsers from './pages/VirtualUsers';
import Courses from './pages/Courses';
import CourseModules from './pages/CourseModules';
import Devices from './pages/Devices';
import Admin from './pages/Admin';
import AddModule from './pages/AddModule';
import VirtualDashboard from './pages/VirtualDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Virtual User Dashboard - Separate from main portal */}
        <Route path="/virtual-dashboard" element={<VirtualDashboard />} />
        
        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/training" element={<Training />} />
                <Route path="/training/steps/:userId" element={<TrainingSteps />} />
                <Route path="/virtual-users" element={<VirtualUsers />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId/modules" element={<CourseModules />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="/admin/modules/:courseId" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddModule />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;