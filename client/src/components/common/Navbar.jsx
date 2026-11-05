import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, toggleMobileSidebar } from '../../redux/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import NotificationDropdown from './NotificationDropdown';
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getRoleBadge = (r) => {
    switch (r) {
      case 'Admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Accountant':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Staff':
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6">
      {/* Left side: Hamburger button + breadcrumb/search */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleMobileSidebar())}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle mobile sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-bold">
            <FileText className="w-4 h-4" /> Nexus Billing
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-700 dark:text-slate-300">Management Console</span>
        </div>
      </div>

      {/* Right side: Quick actions, Theme toggle, Notification, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* User Info chip */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              {user?.name || 'User'}
            </span>
            <span
              className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border self-end uppercase ${getRoleBadge(
                role
              )}`}
            >
              {role}
            </span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-brand-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

