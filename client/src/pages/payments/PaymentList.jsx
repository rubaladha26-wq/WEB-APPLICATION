import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPayments } from '../../redux/slices/paymentSlice';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import {
  CreditCard,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
} from 'lucide-react';

const PaymentList = () => {
  const dispatch = useDispatch();
  const { payments, total, totalPages, currentPage, loading } = useSelector((state) => state.payments);

  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchPayments({
        paymentMethod: methodFilter,
        page,
        limit: 10,
      })
    );
  }, [dispatch, methodFilter, page]);

  const handleExportExcel = () => {
    const data = payments.map((p) => ({
      'Receipt #': p.receiptNumber || 'REC-AUTO',
      'Invoice #': p.invoice?.invoiceNumber,
      Customer: p.customer?.name,
      Company: p.customer?.companyName || '',
      'Payment Date': formatDate(p.paymentDate, true),
      Method: p.paymentMethod,
      'Transaction Ref': p.transactionId || '',
      Amount: p.amount,
      RecordedBy: p.recordedBy?.name || 'System',
    }));
    exportToExcel(data, 'Payment_Receipts_Export');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Payment & Settlement Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete audit trail of all customer remittances, wire settlements, and partial payments.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-600" /> Export Excel
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Payment Method:
          </label>
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Payment Methods</option>
            <option value="Bank Transfer">Bank Wire / Transfer</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI / Instant Pay</option>
            <option value="PayPal">PayPal</option>
            <option value="Stripe">Stripe</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Transaction Ref</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4 text-right">Amount Settled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {payments && payments.length > 0 ? (
                payments.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {p.receiptNumber}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold">
                      {p.invoice ? (
                        <Link
                          to={`/invoices/${p.invoice._id}`}
                          className="text-slate-800 dark:text-slate-200 hover:text-brand-600 underline"
                        >
                          {p.invoice.invoiceNumber}
                        </Link>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {p.customer?.name}
                      </p>
                      {p.customer?.companyName && (
                        <p className="text-[10px] text-slate-400">
                          {p.customer.companyName}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                        <CreditCard className="w-3.5 h-3.5 text-brand-500" />
                        {p.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500">
                      {p.transactionId || 'None'}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(p.paymentDate, true)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      +{formatCurrency(p.amount, p.invoice?.currency || 'USD')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12">
                    <EmptyState
                      icon={CreditCard}
                      title="No Payments Recorded"
                      description="When payments are recorded against invoices, receipts will appear here."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Showing page <strong className="text-slate-800 dark:text-slate-200">{currentPage}</strong> of <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong> ({total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentList;

