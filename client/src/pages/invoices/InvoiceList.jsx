import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchInvoices, deleteInvoice } from '../../redux/slices/invoiceSlice';
import { fetchCustomers } from '../../redux/slices/customerSlice';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';
import InvoicePreviewModal from '../../components/invoices/InvoicePreviewModal';
import SendEmailModal from '../../components/invoices/SendEmailModal';
import PaymentRecordModal from '../../components/invoices/PaymentRecordModal';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  DollarSign,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from 'lucide-react';

const InvoiceList = () => {
  const dispatch = useDispatch();
  const { invoices, total, totalPages, currentPage, loading } = useSelector((state) => state.invoices);
  const { customers } = useSelector((state) => state.customers);
  const { isAdmin, isAccountant } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    dispatch(fetchCustomers({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchInvoices({
        search: searchTerm,
        status: statusFilter,
        customer: customerFilter,
        page,
        limit: 10,
      })
    );
  }, [dispatch, searchTerm, statusFilter, customerFilter, page]);

  const handleDownloadPDF = async (inv) => {
    try {
      setDownloadingId(inv._id);
      const response = await api.get(`/invoices/${inv._id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${inv.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(`Error downloading PDF: ${err.message || err}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = invoices.map((inv) => ({
      'Invoice #': inv.invoiceNumber,
      Customer: inv.customer?.name,
      Company: inv.customer?.companyName || '',
      'Issue Date': formatDate(inv.issueDate),
      'Due Date': formatDate(inv.dueDate),
      Status: inv.status,
      Currency: inv.currency,
      Subtotal: inv.subtotal,
      Tax: inv.taxAmount,
      Discount: inv.discountAmount,
      'Grand Total': inv.grandTotal,
      'Total Paid': inv.totalPaid,
      'Balance Due': inv.balanceDue,
    }));
    exportToExcel(exportData, 'Invoices_Export');
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;
    try {
      await dispatch(deleteInvoice(invoiceToDelete._id)).unwrap();
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
    } catch (err) {
      alert(`Error deleting invoice: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Invoice Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, track, and manage client billings, receipts, and recurring subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> New Invoice
          </Link>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, notes, customer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Pending">Pending</option>
            <option value="Sent">Sent</option>
            <option value="Overdue">Overdue</option>
            <option value="Draft">Draft</option>
          </select>

          <select
            value={customerFilter}
            onChange={(e) => {
              setCustomerFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 max-w-[180px]"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/invoices/${inv._id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                        {inv.isRecurring && (
                          <span title={`Recurring: ${inv.recurringFrequency}`}>
                            <RotateCw className="w-3 h-3 text-purple-500" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {inv.customer?.name || 'N/A'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {inv.customer?.companyName || inv.customer?.email}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {formatDate(inv.issueDate)}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {formatDate(inv.dueDate)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(inv.grandTotal, inv.currency)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={inv.balanceDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {formatCurrency(inv.balanceDue, inv.currency)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge status={inv.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick View Preview */}
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPreviewOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Preview Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Download PDF */}
                        <button
                          onClick={() => handleDownloadPDF(inv)}
                          disabled={downloadingId === inv._id}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          {downloadingId === inv._id ? (
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>

                        {/* Send Email */}
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setEmailOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Email Invoice"
                        >
                          <Mail className="w-4 h-4" />
                        </button>

                        {/* Record Payment (if balance remains) */}
                        {inv.balanceDue > 0 && isAccountant && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit invoice */}
                        <Link
                          to={`/invoices/${inv._id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete invoice (Admin/Accountant) */}
                        {isAccountant && (
                          <button
                            onClick={() => {
                              setInvoiceToDelete(inv);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete Invoice"
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
                  <td colSpan={8} className="py-12">
                    <EmptyState
                      icon={FileSpreadsheet}
                      title="No Invoices Found"
                      description="Create your first client invoice to begin billing."
                      actionLabel="+ Create Invoice"
                      onAction={() => window.location.href = '/invoices/new'}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
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

      {/* Modals */}
      <InvoicePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoice={selectedInvoice}
        onOpenEmailModal={(inv) => {
          setSelectedInvoice(inv);
          setEmailOpen(true);
        }}
      />
      <SendEmailModal
        isOpen={emailOpen}
        onClose={() => setEmailOpen(false)}
        invoice={selectedInvoice}
        onSuccess={() => dispatch(fetchInvoices())}
      />
      <PaymentRecordModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        invoice={selectedInvoice}
        onSuccess={() => dispatch(fetchInvoices())}
      />
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Invoice"
        message={`Are you sure you want to permanently delete invoice ${invoiceToDelete?.invoiceNumber}? This action cannot be reversed.`}
        confirmText="Delete Invoice"
      />
    </div>
  );
};

export default InvoiceList;

