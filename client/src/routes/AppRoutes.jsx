import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Application Pages
import Dashboard from '../pages/dashboard/Dashboard';
import InvoiceList from '../pages/invoices/InvoiceList';
import InvoiceCreate from '../pages/invoices/InvoiceCreate';
import InvoiceEdit from '../pages/invoices/InvoiceEdit';
import InvoiceDetail from '../pages/invoices/InvoiceDetail';
import CustomerList from '../pages/customers/CustomerList';
import CustomerDetail from '../pages/customers/CustomerDetail';
import ProductList from '../pages/products/ProductList';
import PaymentList from '../pages/payments/PaymentList';
import ReportsAnalytics from '../pages/reports/ReportsAnalytics';
import Settings from '../pages/settings/Settings';
import AuditLogs from '../pages/settings/AuditLogs';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect to Dashboard or Login */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Protected Invoicing & Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/invoices/new" element={<InvoiceCreate />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/payments" element={<PaymentList />} />
        <Route path="/reports" element={<ReportsAnalytics />} />
        <Route path="/settings" element={<Settings />} />

        {/* Admin only route */}
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

