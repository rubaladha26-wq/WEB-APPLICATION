import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchCustomerById } from '../../redux/slices/customerSlice';
import CustomerModal from '../../components/customers/CustomerModal';
import InvoicePreviewModal from '../../components/invoices/InvoicePreviewModal';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Building,
  MapPin,
  DollarSign,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
} from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentCustomer, invoices, payments, stats, loading } = useSelector((state) => state.customers);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomerById(id));
  }, [dispatch, id]);

  if (loading && !currentCustomer) {
    return <LoadingSpinner text="Loading customer profile & ledger..." />;
  }

  if (!currentCustomer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Customer not found</h3>
        <Link to="/customers" className="text-sm text-brand-600 hover:underline mt-2 inline-block">
          Return to Client Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/customers"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {currentCustomer.name}
              </h1>
              <Badge status={currentCustomer.status || 'active'} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentCustomer.companyName || 'Individual Client'} • Client since {formatDate(currentCustomer.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl shadow-sm transition-colors"
          >
            <Edit className="w-4 h-4 text-amber-500" /> Edit Profile
          </button>
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Issue Invoice
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(stats?.totalBilled || currentCustomer.totalBilled || 0, currentCustomer.currency)}
          subtitle={`${stats?.totalInvoices || 0} invoices issued`}
          icon={FileSpreadsheet}
          color="blue"
        />
        <StatCard
          title="Total Paid"
          value={formatCurrency(stats?.totalPaid || currentCustomer.totalPaid || 0, currentCustomer.currency)}
          subtitle="Lifetime received"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(stats?.balance || currentCustomer.balance || 0, currentCustomer.currency)}
          subtitle="Remaining unpaid"
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="Currency"
          value={currentCustomer.currency || 'USD'}
          subtitle={`Tax ID: ${currentCustomer.gstNumber || 'None'}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Profile & Address Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Contact & Address Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Contact Details
            </span>
            <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300 py-1">
              <Mail className="w-4 h-4 text-brand-500" /> {currentCustomer.email}
            </p>
            {currentCustomer.phone && (
              <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300 py-1">
                <Phone className="w-4 h-4 text-brand-500" /> {currentCustomer.phone}
              </p>
            )}
            {currentCustomer.companyName && (
              <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300 py-1">
                <Building className="w-4 h-4 text-brand-500" /> {currentCustomer.companyName}
              </p>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Billing Address
            </span>
            <p className="text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                {currentCustomer.billingAddress?.street || 'No street specified'}<br />
                {currentCustomer.billingAddress?.city && `${currentCustomer.billingAddress.city}, `}
                {currentCustomer.billingAddress?.state} {currentCustomer.billingAddress?.postalCode}<br />
                {currentCustomer.billingAddress?.country}
              </span>
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Account Notes
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {currentCustomer.notes || 'No custom billing notes added for this client.'}
            </p>
          </div>
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Invoice History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3">Invoice #</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Grand Total</th>
                <th className="pb-3 text-right">Balance Due</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-brand-600">
                      <Link to={`/invoices/${inv._id}`} className="hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{formatDate(inv.issueDate)}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{formatDate(inv.dueDate)}</td>
                    <td className="py-3"><Badge status={inv.status} /></td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(inv.grandTotal, inv.currency)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(inv.balanceDue, inv.currency)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setPreviewModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No invoices issued for this customer yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        customerToEdit={currentCustomer}
        onSuccess={() => dispatch(fetchCustomerById(id))}
      />

      <InvoicePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default CustomerDetail;

