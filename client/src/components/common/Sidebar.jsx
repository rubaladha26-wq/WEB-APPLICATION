import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { closeMobileSidebar } from '../../redux/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  ShieldCheck,
  Receipt,
  X,
  PlusCircle,
} from 'lucide-react';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarOpen, mobileSidebarOpen } = useSelector((state) => state.ui);
  const { isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', path: '/invoices', icon: FileSpreadsheet },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Products & Stock', path: '/products', icon: Package },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck });
  }

  const renderNavLinks = () => (
    <nav className="flex-1 space-y-1.5 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => dispatch(closeMobileSidebar())}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className={!sidebarOpen ? 'lg:hidden' : 'inline'}>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => dispatch(closeMobileSidebar())}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Nexus<span className="text-brand-600">Bill</span>
            </span>
          </div>
          <button
            onClick={() => dispatch(closeMobileSidebar())}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderNavLinks()}

        <div className="p-4 border-t border-slate-150 dark:border-slate-800">
          <NavLink
            to="/invoices/new"
            onClick={() => dispatch(closeMobileSidebar())}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-sm shadow-md shadow-brand-500/20"
          >
            <PlusCircle className="w-4 h-4" /> Create Invoice
          </NavLink>
        </div>
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20 flex-shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                Nexus<span className="text-brand-600">Bill</span>
              </span>
            )}
          </div>
        </div>

        {renderNavLinks()}

        {/* Create Invoice button footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <NavLink
            to="/invoices/new"
            title="Create Invoice"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>New Invoice</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

