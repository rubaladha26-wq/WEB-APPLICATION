import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Receipt, ShieldCheck } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 transition-colors duration-200">
      {/* Top Bar with theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 shadow-sm"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="p-3 rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/25">
              <Receipt className="w-7 h-7" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Nexus<span className="text-brand-600">Bill</span>
            </span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Enterprise Billing & Financial Invoicing Suite
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> 256-bit SSL Bank-Grade Encryption
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

