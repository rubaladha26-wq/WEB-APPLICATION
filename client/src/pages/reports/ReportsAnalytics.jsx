import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, fetchDashboardStats } from '../../redux/slices/reportSlice';
import RevenueAnalyticsChart from '../../components/dashboard/RevenueAnalyticsChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  Download,
  Users,
  Package,
  CreditCard,
  Printer,
} from 'lucide-react';

const ReportsAnalytics = () => {
  const dispatch = useDispatch();
  const { analytics, dashboard, loading } = useSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const handleExportCustomersExcel = () => {
    if (!analytics?.customerSpending) return;
    const data = analytics.customerSpending.map((c) => ({
      Customer: c.customerName,
      Email: c.customerEmail,
      Company: c.companyName || '',
      'Total Invoices': c.invoiceCount,
      'Total Billed': c.totalBilled,
      'Total Paid': c.totalPaid,
      'Balance Due': c.totalBalance,
    }));
    exportToExcel(data, 'Customer_Spending_Analysis');
  };

  const handleExportProductsExcel = () => {
    if (!analytics?.productSales) return;
    const data = analytics.productSales.map((p) => ({
      Product: p._id,
      'Units Sold': p.unitsSold,
      'Total Revenue Generated': p.totalRevenue,
    }));
    exportToExcel(data, 'Product_Sales_Performance');
  };

  if (loading && !analytics) {
    return <LoadingSpinner text="Crunching financial analytics and charts..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Financial Reports & Business Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            In-depth breakdowns of client revenues, product sales volume, and collection trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print Report
          </button>
          <button
            onClick={handleExportCustomersExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all"
          >
            <Download className="w-4 h-4" /> Export Analytics
          </button>
        </div>
      </div>

      {/* Main Revenue Trend Chart */}
      <RevenueAnalyticsChart data={dashboard?.monthlyAnalytics || []} />

      {/* Grid: Customer Spending & Product Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Spending Analysis Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" /> Top Client Spending
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Highest grossing accounts ranked by total billed volume
              </p>
            </div>
            <button
              onClick={handleExportCustomersExcel}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3 text-center">Invoices</th>
                  <th className="pb-3 text-right">Billed</th>
                  <th className="pb-3 text-right">Paid</th>
                  <th className="pb-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics?.customerSpending && analytics.customerSpending.length > 0 ? (
                  analytics.customerSpending.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3">
                        <p className="font-bold text-slate-900 dark:text-white">{c.customerName}</p>
                        <p className="text-[10px] text-slate-400">{c.companyName || c.customerEmail}</p>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {c.invoiceCount}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(c.totalBilled)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(c.totalPaid)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(c.totalBalance)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No customer billing activity yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Sales Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" /> Product & Service Sales Volume
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top selling products and billable offerings
              </p>
            </div>
            <button
              onClick={handleExportProductsExcel}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Product / Service</th>
                  <th className="pb-3 text-center">Units Sold</th>
                  <th className="pb-3 text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics?.productSales && analytics.productSales.length > 0 ? (
                  analytics.productSales.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">
                        {p._id}
                      </td>
                      <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {p.unitsSold}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.totalRevenue)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      No product sales recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;

