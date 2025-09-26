

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/constants';

// TypeScript Interfaces
interface Product {
  _id: string;
  category: string;
  subCategory: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  isActive: boolean;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
  updatedAt: string;
}
interface FormErrors {
  category?: string;
  subCategory?: string;
  buyingPrice?: string;
  sellingPrice?: string;
  stock?: string;
}
interface CategoryDropdown {
  category: string;
  subCategories: string[];
}

interface ProductResponse {
  status_code: number;
  pagination: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: Product[];
}

interface FormData {
  category: string;
  subCategory: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
}

const Products: React.FC = () => {
  // State Management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryDropdown[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showOtherCategory, setShowOtherCategory] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    category: '',
    subCategory: '',
    buyingPrice: 1,
    sellingPrice: 1,
    stock: 1
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const limit = 10;

  // API Configuration
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // API Calls
  const fetchProducts = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ProductResponse>(
        `${BASE_URL}api/products/all`,
        { page, limit },
        { headers: getAuthHeaders() }
      );

      if (response.data.status_code === 200) {
        setProducts(response.data.data);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      }
    } catch (error: any) {
      toast.error('Failed to fetch products');
      console.error('Fetch products error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}api/products/dropdown`,
        { headers: getAuthHeaders() }
      );

      if (response.data.status_code === 200) {
        setCategories(response.data.data);
      }
    } catch (error: any) {
      console.error('Fetch categories error:', error);
    }
  };

  const createProduct = async (productData: FormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}api/products/create`,
        productData,
        { headers: getAuthHeaders() }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success('Product created successfully!');
        fetchProducts(currentPage);
        fetchCategories();
        closeModal();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product');
      console.error('Create product error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, updateData: Partial<FormData>) => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}api/products/update`,
        { id, update: updateData },
        { headers: getAuthHeaders() }
      );

      if (response.data.status_code === 200) {
        toast.success('Product updated successfully!');
        fetchProducts(currentPage);
        closeModal();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product');
      console.error('Update product error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${BASE_URL}api/products/delete`,
        {
          headers: getAuthHeaders(),
          data: { id }
        }
      );

      if (response.data.status_code === 200) {
        toast.success('Product deleted successfully!');
        fetchProducts(currentPage);
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
      console.error('Delete product error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Form Validation
const validateForm = (): boolean => {
  const newErrors: FormErrors = {};

  if (!formData.category.trim()) {
    newErrors.category = 'Category is required';
  }

  if (!formData.subCategory.trim()) {
    newErrors.subCategory = 'Subcategory is required';
  }

  if (formData.buyingPrice < 1 || formData.buyingPrice > 100000) {
    newErrors.buyingPrice = 'Buying price must be between 1 and 100,000';
  }

  if (formData.sellingPrice < 1 || formData.sellingPrice > 100000) {
    newErrors.sellingPrice = 'Selling price must be between 1 and 100,000';
  }

  if (formData.stock < 1 || formData.stock > 100000) {
    newErrors.stock = 'Stock must be between 1 and 100,000';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // Event Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Price') || name === 'stock' ? Number(value) : value
    }));

    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'other') {
      setShowOtherCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setShowOtherCategory(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editingProduct) {
      const updateData = {
        category: formData.category,
        subCategory: formData.subCategory,
        buyingPrice: formData.buyingPrice,
        sellingPrice: formData.sellingPrice,
        stock: formData.stock
      };
      await updateProduct(editingProduct._id, updateData);
    } else {
      await createProduct(formData);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      category: '',
      subCategory: '',
      buyingPrice: 1,
      sellingPrice: 1,
      stock: 1
    });
    setShowOtherCategory(false);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      category: product.category,
      subCategory: product.subCategory,
      buyingPrice: product.buyingPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock
    });
    setShowOtherCategory(!categories.some(cat => 
      cat.category.toLowerCase() === product.category.toLowerCase()
    ));
    setErrors({});
    setIsModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setShowOtherCategory(false);
    setFormData({
      category: '',
      subCategory: '',
      buyingPrice: 1,
      sellingPrice: 1,
      stock: 1
    });
    setErrors({});
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchProducts(page);
    }
  };

  // Effects
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Management</h1>
              <p className="text-gray-600">Manage your product inventory</p>
            </div>
            <button
              onClick={openCreateModal}
              className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Products List</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: {totalItems} products
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="block sm:hidden">
                {products.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <div key={product._id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{product.category}</h3>
                            <p className="text-sm text-gray-600">{product.subCategory}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDeleteModal(product)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Buying: </span>
                            <span className="font-medium text-green-600">₹{product.buyingPrice}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Selling: </span>
                            <span className="font-medium text-green-600">₹{product.sellingPrice}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Stock: </span>
                            <span className="font-medium">{product.stock}</span>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              product.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Buying Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Selling Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.category}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.subCategory}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              ₹{product.buyingPrice.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              ₹{product.sellingPrice.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.stock.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditModal(product)}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors duration-200"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openDeleteModal(product)}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors duration-200"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === page
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                {!showOtherCategory && categories.length > 0 ? (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.category} value={cat.category}>
                        {cat.category}
                      </option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Enter category name"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {categories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowOtherCategory(false);
                          setFormData(prev => ({ ...prev, category: '' }));
                        }}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Choose from existing categories
                      </button>
                    )}
                  </div>
                )}
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {/* Subcategory Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory *
                </label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  placeholder="Enter subcategory name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.subCategory ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.subCategory && (
                  <p className="mt-1 text-sm text-red-600">{errors.subCategory}</p>
                )}
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buying Price *
                  </label>
                  <input
                    type="number"
                    name="buyingPrice"
                    value={formData.buyingPrice}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.buyingPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.buyingPrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.buyingPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.sellingPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.sellingPrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.sellingPrice}</p>
                  )}
                </div>
              </div>

             

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to delete this product?
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="font-medium text-gray-900">{productToDelete.category}</p>
                <p className="text-sm text-gray-600">{productToDelete.subCategory}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setProductToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteProduct(productToDelete._id)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Products