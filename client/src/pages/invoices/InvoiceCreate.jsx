import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { createInvoice } from '../../redux/slices/invoiceSlice';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import CustomerModal from '../../components/customers/CustomerModal';
import { ArrowLeft } from 'lucide-react';

const InvoiceCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const handleSubmit = async (invoiceData) => {
    setLoading(true);
    try {
      const result = await dispatch(createInvoice(invoiceData)).unwrap();
      navigate(`/invoices/${result._id}`);
    } catch (err) {
      alert(`Error creating invoice: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/invoices"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create New Invoice
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure line items, automatic discounts, taxes, and customer terms.
          </p>
        </div>
      </div>

      <InvoiceForm
        onSubmit={handleSubmit}
        loading={loading}
        onOpenCustomerModal={() => setCustomerModalOpen(true)}
      />

      <CustomerModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
      />
    </div>
  );
};

export default InvoiceCreate;

