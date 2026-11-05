import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings } from '../../redux/slices/settingSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import {
  Building,
  DollarSign,
  FileText,
  Mail,
  Save,
  CheckCircle2,
  Shield,
} from 'lucide-react';

const Settings = () => {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state) => state.settings);
  const { isAdmin } = useAuth();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyWebsite: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    taxId: '',
    defaultCurrency: 'USD',
    currencySymbol: '$',
    defaultTaxRate: 10,
    invoicePrefix: 'INV',
    invoiceFooterNotes: '',
    invoiceTermsAndConditions: '',
    enableQR: true,
    enableOverdueAlerts: true,
    smtpHost: '',
    smtpPort: 2525,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
  });

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || '',
        companyEmail: settings.companyEmail || '',
        companyPhone: settings.companyPhone || '',
        companyWebsite: settings.companyWebsite || '',
        street: settings.companyAddress?.street || '',
        city: settings.companyAddress?.city || '',
        state: settings.companyAddress?.state || '',
        postalCode: settings.companyAddress?.postalCode || '',
        country: settings.companyAddress?.country || 'United States',
        taxId: settings.taxId || '',
        defaultCurrency: settings.defaultCurrency || 'USD',
        currencySymbol: settings.currencySymbol || '$',
        defaultTaxRate: settings.defaultTaxRate !== undefined ? settings.defaultTaxRate : 10,
        invoicePrefix: settings.invoicePrefix || 'INV',
        invoiceFooterNotes: settings.invoiceFooterNotes || '',
        invoiceTermsAndConditions: settings.invoiceTermsAndConditions || '',
        enableQR: settings.enableQR !== undefined ? settings.enableQR : true,
        enableOverdueAlerts: settings.enableOverdueAlerts !== undefined ? settings.enableOverdueAlerts : true,
        smtpHost: settings.emailConfig?.host || '',
        smtpPort: settings.emailConfig?.port || 2525,
        smtpUser: settings.emailConfig?.user || '',
        smtpPassword: settings.emailConfig?.password || '',
        fromEmail: settings.emailConfig?.fromEmail || '',
        fromName: settings.emailConfig?.fromName || '',
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only administrators can modify system settings.');
      return;
    }

    setSaving(true);
    setSuccess(false);

    const payload = {
      companyName: formData.companyName,
      companyEmail: formData.companyEmail,
      companyPhone: formData.companyPhone,
      companyWebsite: formData.companyWebsite,
      companyAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      taxId: formData.taxId,
      defaultCurrency: formData.defaultCurrency,
      currencySymbol: formData.currencySymbol,
      defaultTaxRate: Number(formData.defaultTaxRate),
      invoicePrefix: formData.invoicePrefix,
      invoiceFooterNotes: formData.invoiceFooterNotes,
      invoiceTermsAndConditions: formData.invoiceTermsAndConditions,
      enableQR: formData.enableQR,
      enableOverdueAlerts: formData.enableOverdueAlerts,
      emailConfig: {
        host: formData.smtpHost,
        port: Number(formData.smtpPort),
        user: formData.smtpUser,
        password: formData.smtpPassword,
        fromEmail: formData.fromEmail,
        fromName: formData.fromName,
      },
    };

    try {
      await dispatch(updateSettings(payload)).unwrap();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(`Error saving settings: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return <LoadingSpinner text="Loading system preferences..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System & Organization Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure your company identity, tax rules, currency symbols, and invoice templates.
          </p>
        </div>

        {isAdmin && (
          <button
            type="submit"
            form="settings-form"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto disabled:opacity-60"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Configuration
          </button>
        )}
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          Settings successfully updated and applied across all new invoices!
        </div>
      )}

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Company Profile Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-600" /> Company Identity & Branding
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Company Legal Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Acme Global Solutions Inc."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Tax ID / GST / VAT Number
              </label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                placeholder="US-EIN-987654321"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Billing Support Email
              </label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="finance@company.com"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Telephone Number
              </label>
              <input
                type="text"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="+1 (415) 555-0199"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-800">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
              Registered Physical Address
            </label>
            <div className="space-y-3">
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street Address"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State / Region"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Zip / Postal"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Invoicing Defaults */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" /> Financial & Currency Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Default Currency Code
              </label>
              <select
                name="defaultCurrency"
                value={formData.defaultCurrency}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                name="currencySymbol"
                value={formData.currencySymbol}
                onChange={handleChange}
                placeholder="$"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Standard Tax / GST Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                name="defaultTaxRate"
                value={formData.defaultTaxRate}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                name="invoicePrefix"
                value={formData.invoicePrefix}
                onChange={handleChange}
                placeholder="INV"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Resulting invoices: {formData.invoicePrefix}-2026-0001
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Footer Notes & Terms */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" /> Default Invoice Disclaimers & Terms
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Standard Footer Note
              </label>
              <textarea
                name="invoiceFooterNotes"
                rows={2}
                value={formData.invoiceFooterNotes}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Terms and Conditions Boilerplate
              </label>
              <textarea
                name="invoiceTermsAndConditions"
                rows={3}
                value={formData.invoiceTermsAndConditions}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;

