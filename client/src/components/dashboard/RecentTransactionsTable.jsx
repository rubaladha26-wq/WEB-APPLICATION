import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreditCard, ExternalLink } from 'lucide-react';

const RecentTransactionsTable = ({ transactions = [] }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Payments Received
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time settled receipts and settlements
          </p>
        </div>
        <Link
          to="/payments"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          View All <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="pb-3 font-semibold">Receipt / Ref</th>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold">Method</th>
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr
                  key={tx._id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 font-mono font-medium text-brand-600 dark:text-brand-400">
                    {tx.receiptNumber || tx.transactionId || 'REC-AUTO'}
                  </td>
                  <td className="py-3">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {tx.customer?.name || 'Customer'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {tx.customer?.companyName || tx.customer?.email}
                    </p>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">
                    {formatDate(tx.paymentDate)}
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No payment transactions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;

