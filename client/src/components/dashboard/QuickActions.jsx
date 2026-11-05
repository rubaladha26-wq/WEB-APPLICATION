import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, UserPlus, PackagePlus, CreditCard, BarChart2 } from 'lucide-react';

const QuickActions = ({ onAddCustomer, onAddProduct, onRecordPayment }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
        Quick Actions
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Fast shortcuts to everyday invoicing workflows
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/invoices/new"
          className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/50 dark:bg-brand-950/30 hover:bg-brand-100/70 dark:hover:bg-brand-900/40 text-brand-700 dark:text-brand-300 transition-all text-center group"
        >
          <div className="p-2 rounded-lg bg-brand-600 text-white mb-2 shadow-sm group-hover:scale-110 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">New Invoice</span>
        </Link>

        <button
          type="button"
          onClick={onAddCustomer}
          className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all text-center group"
        >
          <div className="p-2 rounded-lg bg-emerald-600 text-white mb-2 shadow-sm group-hover:scale-110 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">Add Customer</span>
        </button>

        <button
          type="button"
          onClick={onAddProduct}
          className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all text-center group"
        >
          <div className="p-2 rounded-lg bg-amber-500 text-white mb-2 shadow-sm group-hover:scale-110 transition-transform">
            <PackagePlus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">New Item</span>
        </button>

        <button
          type="button"
          onClick={onRecordPayment}
          className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all text-center group"
        >
          <div className="p-2 rounded-lg bg-purple-600 text-white mb-2 shadow-sm group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">Record Pay</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;

