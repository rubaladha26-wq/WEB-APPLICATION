import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs } from '../../redux/slices/settingSlice';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { ShieldCheck, Search, Filter, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

const AuditLogs = () => {
  const dispatch = useDispatch();
  const { auditLogs, auditTotal, loading } = useSelector((state) => state.settings);

  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    dispatch(
      fetchAuditLogs({
        entityType: entityFilter,
        page,
        limit,
      })
    );
  }, [dispatch, entityFilter, page]);

  const totalPages = Math.ceil(auditTotal / limit) || 1;

  const getActionBadge = (action) => {
    if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200';
    if (action.includes('DELETE')) return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200';
    if (action.includes('PAYMENT')) return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200';
    return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-600" /> System Audit Trail & Compliance Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable log of all invoices generated, payments recorded, and administrator activities.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filter Entity:
          </span>
        </div>
        <select
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Entities</option>
          <option value="Invoice">Invoices</option>
          <option value="Payment">Payments</option>
          <option value="Customer">Customers</option>
          <option value="Product">Products & Services</option>
          <option value="Settings">System Settings</option>
          <option value="User">User Management</option>
          <option value="Auth">Authentication</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Executed By</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {auditLogs && auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {log.entityType}
                    </td>

                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium max-w-xs truncate">
                      {log.description}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {log.user?.name ? (
                        <span>
                          {log.user.name} <span className="text-[10px] text-slate-400">({log.user.role})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">System</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {formatDate(log.createdAt, true)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={Activity}
                      title="No Audit Logs Recorded"
                      description="User operations and audit actions will be recorded here automatically."
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
              Page <strong className="text-slate-800 dark:text-slate-200">{page}</strong> of <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
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

export default AuditLogs;

