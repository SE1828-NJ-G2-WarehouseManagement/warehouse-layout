import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/pages/users/LoginForm';
import { AuthProvider } from './context/AuthContext';
import { ROLE } from './constant/key';
import MainLayout from './components/MainLayout';
import NotFound from './components/404';
import Unauthorized from './components/Unauthorized';
import ForgotPasswordForm from './components/pages/users/ForgotPassword';
import VerifyOtpForm from './components/pages/users/VerifyOtpForm';
import SetNewPasswordForm from './components/pages/users/SetNewPasswordForm';
import ImportTransaction from './components/pages/warehouseStaff/ImportTransaction';
import ExportTransaction from './components/pages/warehouseStaff/ExportTransaction';
import ExpiredProductsList from './components/pages/warehouseStaff/ExpiredItems';
import ZoneList from './components/pages/warehouseStaff/ZoneList';
import ZoneProduct from './components/pages/warehouseStaff/ZoneProducts';
import InternalZoneTransfer from './components/pages/warehouseStaff/InternalZoneTransfer';
import InternalWarehouseTransfer from './components/pages/warehouseStaff/InternalWarehouseTransfer';
import SupplierList from './components/pages/warehouseStaff/SupplierList';
import CategoryList from './components/pages/warehouseStaff/CategoryList';
import CustomerList from './components/pages/warehouseStaff/CustomerList';
import ProductList from './components/pages/warehouseStaff/ProductList';

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
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            element={
              <ProtectedRoute allowedRoles={[ROLE.STAFF_WAREHOUSE, ROLE.ADMIN_WAREHOUSE]}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<></>} /> 
            <Route path="/importTransaction" element={<ImportTransaction />} />
            <Route path="/exportTransaction" element={<ExportTransaction />} />
            <Route path="/expiredProductsList" element={<ExpiredProductsList />} />
            <Route path="/zoneList" element={<ZoneList />} />
            <Route path="/zone/:zoneId" element={<ZoneProduct />} />
            <Route path= "/internalZoneTransfer" element={<InternalZoneTransfer />} />
             <Route path= "/internalWarehouseTransfer" element={<InternalWarehouseTransfer />} />
             <Route path= "/suppliers" element={<SupplierList />} />
             <Route path="/categories" element={<CategoryList />} />
             <Route path='/customers' element={<CustomerList />} />
             <Route path= '/products' element={<ProductList />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}