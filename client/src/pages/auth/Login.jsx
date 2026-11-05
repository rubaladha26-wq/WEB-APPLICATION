import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearAuthError } from '../../redux/slices/authSlice';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate('/dashboard');
    }
  };

  // Quick 1-click Demo credentials filler
  const handleQuickDemo = (role) => {
    if (role === 'admin') {
      setFormData({ email: 'admin@nexusbill.com', password: 'password123' });
    } else if (role === 'accountant') {
      setFormData({ email: 'accountant@nexusbill.com', password: 'password123' });
    } else {
      setFormData({ email: 'staff@nexusbill.com', password: 'password123' });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Sign In
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Welcome back! Access your billing dashboard and records.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" /> Sign In
            </>
          )}
        </button>
      </form>

      {/* Demo Quick Logins */}
      <div className="mt-6 pt-5 border-t border-slate-150 dark:border-slate-800">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center mb-2.5 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Demo Accounts
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="py-1.5 px-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg text-[11px] font-bold text-purple-700 dark:text-purple-300 transition-colors"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('accountant')}
            className="py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-300 transition-colors"
          >
            Accountant
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('staff')}
            className="py-1.5 px-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] font-bold text-blue-700 dark:text-blue-300 transition-colors"
          >
            Staff
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;

