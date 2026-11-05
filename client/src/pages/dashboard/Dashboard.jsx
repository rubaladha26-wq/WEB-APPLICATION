import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../redux/slices/reportSlice';
import StatCard from '../../components/common/StatCard';
import RevenueAnalyticsChart from '../../components/dashboard/RevenueAnalyticsChart';
import InvoiceStatusPieChart from '../../components/dashboard/InvoiceStatusPieChart';
import RecentTransactionsTable from '../../components/dashboard/RecentTransactionsTable';
import QuickActions from '../../components/dashboard/QuickActions';
import CustomerModal from '../../components/customers/CustomerModal';
import ProductModal from '../../components/products/ProductModal';
import PaymentRecordModal from '../../components/invoices/PaymentRecordModal';
import InvoicePreviewModal from '../../components/invoices/InvoicePreviewModal';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  DollarSign,
  Users,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, loading } = useSelector((state) => state.reports);

  // Modals state
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const stats = dashboard?.statsByStatus || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Executive Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time billing performance, revenue tracking, and account statuses.
          </p>
        </div>
        <Link
          to="/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          + Create New Invoice
        </Link>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Collected"
          value={formatCurrency(dashboard?.totalRevenue || 0)}
          subtitle="Net cash collected"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Active Clients"
          value={dashboard?.totalCustomers || 0}
          subtitle="Registered accounts"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Invoiced"
          value={dashboard?.totalInvoices || 0}
          subtitle="Generated invoices"
          icon={FileSpreadsheet}
          color="purple"
        />
        <StatCard
          title="Fully Paid"
          value={stats.Paid?.count || 0}
          subtitle={formatCurrency(stats.Paid?.amount || 0)}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Pending / Sent"
          value={(stats.Pending?.count || 0) + (stats.Sent?.count || 0)}
          subtitle={formatCurrency((stats.Pending?.amount || 0) + (stats.Sent?.amount || 0))}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Overdue Balance"
          value={stats.Overdue?.count || 0}
          subtitle={formatCurrency(stats.Overdue?.balance || 0)}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <QuickActions
        onAddCustomer={() => setCustomerModalOpen(true)}
        onAddProduct={() => setProductModalOpen(true)}
        onRecordPayment={() => {
          if (dashboard?.recentInvoices && dashboard.recentInvoices.length > 0) {
            setSelectedInvoiceForPayment(dashboard.recentInvoices[0]);
            setPaymentModalOpen(true);
          } else {
            alert('No pending invoices available to record payments.');
          }
        }}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueAnalyticsChart data={dashboard?.monthlyAnalytics || []} />
        </div>
        <div>
          <InvoiceStatusPieChart stats={stats} />
        </div>
      </div>

      {/* Tables Section: Recent Invoices & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Invoices
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest billing documents generated
              </p>
            </div>
            <Link
              to="/invoices"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              All Invoices <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Invoice</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Total</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {dashboard?.recentInvoices && dashboard.recentInvoices.length > 0 ? (
                  dashboard.recentInvoices.map((inv) => (
                    <tr
                      key={inv._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                        <Link to={`/invoices/${inv._id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-3">
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">
                          {inv.customer?.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          {formatDate(inv.issueDate)}
                        </p>
                      </td>
                      <td className="py-3">
                        <Badge status={inv.status} />
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(inv.grandTotal, inv.currency)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedInvoiceForPreview(inv);
                            setPreviewModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Quick Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No invoices created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions Card */}
        <RecentTransactionsTable transactions={dashboard?.recentTransactions || []} />
      </div>

      {/* Global Modals for Quick Actions */}
      <CustomerModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSuccess={() => dispatch(fetchDashboardStats())}
      />
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
      />
      <PaymentRecordModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoice={selectedInvoiceForPayment}
        onSuccess={() => dispatch(fetchDashboardStats())}
      />
      <InvoicePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        invoice={selectedInvoiceForPreview}
      />
    </div>
  );
};

export default Dashboard;

