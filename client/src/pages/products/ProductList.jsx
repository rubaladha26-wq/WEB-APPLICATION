import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct, fetchCategories } from '../../redux/slices/productSlice';
import ProductModal from '../../components/products/ProductModal';
import CategoryModal from '../../components/products/CategoryModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import { useAuth } from '../../hooks/useAuth';
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

const ProductList = () => {
  const dispatch = useDispatch();
  const { products, categories, total, totalPages, currentPage, loading } = useSelector((state) => state.products);
  const { isAccountant } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        search: searchTerm,
        category: selectedCategory,
        lowStock: lowStockOnly,
        page,
        limit: 10,
      })
    );
  }, [dispatch, searchTerm, selectedCategory, lowStockOnly, page]);

  const handleExportExcel = () => {
    const data = products.map((p) => ({
      Name: p.name,
      SKU: p.sku || '',
      Category: p.category?.name || 'Uncategorized',
      Type: p.isService ? 'Service' : 'Physical Product',
      Price: p.price,
      'Cost Price': p.costPrice || 0,
      'Tax Rate (%)': p.taxRate || 0,
      Stock: p.isService ? 'N/A' : p.stockQuantity,
      Unit: p.unit,
      Status: p.status,
    }));
    exportToExcel(data, 'Products_Inventory');
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await dispatch(deleteProduct(productToDelete._id)).unwrap();
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (err) {
      alert(`Error deleting product: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Products & Inventory Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain item prices, tax rates, services, and physical inventory stock alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
          {isAccountant && (
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-colors"
            >
              <Layers className="w-4 h-4 text-purple-600" /> Categories
            </button>
          )}
          {isAccountant && (
            <button
              onClick={() => {
                setProductToEdit(null);
                setProductModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or description..."
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
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 max-w-[180px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setLowStockOnly(!lowStockOnly);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border flex items-center gap-1.5 transition-all ${
              lowStockOnly
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Low Stock Alerts
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Item & Description</th>
                <th className="py-3.5 px-4">SKU / Code</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th className="py-3.5 px-4 text-center">Tax %</th>
                <th className="py-3.5 px-4 text-center">Stock Level</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {products && products.length > 0 ? (
                products.map((p) => {
                  const isLow = !p.isService && p.stockQuantity <= (p.lowStockThreshold || 5);
                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                        {p.description && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {p.description}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {p.sku || 'N/A'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium text-[11px]">
                          {p.category?.name || 'General'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.price)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {formatCurrency(p.costPrice || 0)}
                      </td>

                      <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {p.taxRate || 0}%
                      </td>

                      <td className="py-3 px-4 text-center">
                        {p.isService ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200">
                            Service
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              isLow
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200'
                            }`}
                          >
                            {isLow && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                            {p.stockQuantity} {p.unit || 'units'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isAccountant && (
                            <button
                              onClick={() => {
                                setProductToEdit(p);
                                setProductModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Item"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {isAccountant && (
                            <button
                              onClick={() => {
                                setProductToDelete(p);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12">
                    <EmptyState
                      icon={Package}
                      title="No Products or Services Found"
                      description="Create items to easily populate your invoices with 1 click."
                      actionLabel="+ Add Item"
                      onAction={() => {
                        setProductToEdit(null);
                        setProductModalOpen(true);
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

      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productToEdit={productToEdit}
        onSuccess={() => dispatch(fetchProducts({ page, limit: 10 }))}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete ${productToDelete?.name}? This action cannot be reversed.`}
        confirmText="Delete Item"
      />
    </div>
  );
};

export default ProductList;

