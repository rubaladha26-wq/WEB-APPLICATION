import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCustomers, deleteCustomer } from '../../redux/slices/customerSlice';
import CustomerModal from '../../components/customers/CustomerModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react';

const CustomerList = () => {
  const dispatch = useDispatch();
  const { customers, total, totalPages, currentPage, loading } = useSelector((state) => state.customers);
  const { isAccountant } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchCustomers({ search: searchTerm, page, limit: 10 }));
  }, [dispatch, searchTerm, page]);

  const handleExportExcel = () => {
    const data = customers.map((c) => ({
      Name: c.name,
      Company: c.companyName || '',
      Email: c.email,
      Phone: c.phone || '',
      'Tax ID': c.gstNumber || '',
      'Total Billed': c.totalBilled || 0,
      'Total Paid': c.totalPaid || 0,
      Balance: c.balance || 0,
      Status: c.status,
    }));
    exportToExcel(data, 'Customers_Directory');
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      await dispatch(deleteCustomer(customerToDelete._id)).unwrap();
      setDeleteConfirmOpen(false);
      setCustomerToDelete(null);
    } catch (err) {
      alert(`Error deleting customer: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Client Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your customer database, addresses, contact profiles, and billing histories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={() => {
              setCustomerToEdit(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, company, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Client / Company</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Tax / GST #</th>
                <th className="py-3.5 px-4 text-right">Total Billed</th>
                <th className="py-3.5 px-4 text-right">Total Paid</th>
                <th className="py-3.5 px-4 text-right">Outstanding</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {customers && customers.length > 0 ? (
                customers.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={`/customers/${c._id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-brand-600 block"
                      >
                        {c.name}
                      </Link>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {c.companyName || 'Individual Client'}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Mail className="w-3 h-3 text-slate-400" /> {c.email}
                      </p>
                      {c.phone && (
                        <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500">
                      {c.gstNumber || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(c.totalBilled || 0, c.currency)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(c.totalPaid || 0, c.currency)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={c.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                        {formatCurrency(c.balance || 0, c.currency)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/customers/${c._id}`}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setCustomerToEdit(c);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {isAccountant && (
                          <button
                            onClick={() => {
                              setCustomerToDelete(c);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12">
                    <EmptyState
                      icon={Users}
                      title="No Customers Yet"
                      description="Add your first customer to begin recording orders and issuing invoices."
                      actionLabel="+ Add Customer"
                      onAction={() => {
                        setCustomerToEdit(null);
                        setModalOpen(true);
                      }}
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

      <CustomerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customerToEdit={customerToEdit}
        onSuccess={() => dispatch(fetchCustomers({ page, limit: 10 }))}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customerToDelete?.name}? Customers with unpaid balances cannot be deleted.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default CustomerList;

