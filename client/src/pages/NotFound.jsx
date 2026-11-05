import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800 text-brand-600 mb-4">
        <FileQuestion className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
        Page Not Found
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        The document, invoice, or section you are looking for has been moved or does not exist.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;

