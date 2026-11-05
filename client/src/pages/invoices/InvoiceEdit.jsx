import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchInvoiceById, updateInvoice } from '../../redux/slices/invoiceSlice';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

const InvoiceEdit = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentInvoice, loading } = useSelector((state) => state.invoices);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchInvoiceById(id));
  }, [dispatch, id]);

  const handleSubmit = async (invoiceData) => {
    setSubmitting(true);
    try {
      await dispatch(updateInvoice({ id, data: invoiceData })).unwrap();
      navigate(`/invoices/${id}`);
    } catch (err) {
      alert(`Error updating invoice: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !currentInvoice) {
    return <LoadingSpinner text="Loading invoice details..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/invoices/${id}`}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Edit Invoice: {currentInvoice?.invoiceNumber}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update line items, pricing, or terms.
          </p>
        </div>
      </div>

      {currentInvoice && (
        <InvoiceForm
          initialData={currentInvoice}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      )}
    </div>
  );
};

export default InvoiceEdit;

