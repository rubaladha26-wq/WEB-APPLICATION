import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { emailInvoice } from '../../redux/slices/invoiceSlice';
import Modal from '../common/Modal';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

const SendEmailModal = ({ isOpen, onClose, invoice, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!invoice) return;
    setLoading(true);

    try {
      await dispatch(emailInvoice(invoice._id)).unwrap();
      setSent(true);
      setTimeout(() => {
        setSent(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      alert(`Error sending invoice email: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Invoice to Customer" maxWidth="max-w-md">
      {sent ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Invoice Dispatched!
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            PDF copy was sent to {invoice.customer?.email}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Recipient</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-brand-500" />
              {invoice.customer?.email || 'No email registered'}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Invoice: <strong className="text-slate-800 dark:text-slate-200">{invoice.invoiceNumber}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Grand Total: <strong className="text-slate-800 dark:text-slate-200">${invoice.grandTotal?.toFixed(2)}</strong>
            </p>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            A generated PDF copy with full item breakdowns and payment instructions will be attached and sent directly to this customer.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-150 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !invoice.customer?.email}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Invoice
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SendEmailModal;

