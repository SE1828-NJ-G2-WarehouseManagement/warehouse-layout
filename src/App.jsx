// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginForm from './components/pages/users/LoginForm';
import {AuthProvider} from './context/AuthContext'; 
import { ROLE } from "./constant/key";
import MainLayout from "./components/MainLayout";
import NotFound from './components/404';
import Unauthorized from "./components/Unauthorized";
import ForgotPasswordForm from './components/pages/users/ForgotPassword';
import VerifyOtpForm from './components/pages/users/VerifyOtpForm';
import SetNewPasswordForm from './components/pages/users/SetNewPasswordForm';


export default function App() {
  return (
    <Router>
      <AuthProvider> 
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
           <Route path="/verify-otp" element={<VerifyOtpForm />} /> 
          <Route path="/set-new-password" element={<SetNewPasswordForm />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLE.STAFF_WAREHOUSE, ROLE.ADMIN_WAREHOUSE]}>
                <MainLayout />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
