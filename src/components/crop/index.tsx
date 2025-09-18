// Crop.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, X, Upload, AlertTriangle, Settings } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/constants';

// Types and Interfaces
interface SubCategory {
  name: string;
  price: number;
}

interface CropType {
  _id: string;
  name: string;
  subCategories: SubCategory[];
  isVisible: boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  // For backward compatibility with old structure
  subCategory?: string;
  price?: number;
}

interface CreateCropRequest {
  name: string;
  subCategories: string;
  image: File;
}

interface UpdateCropRequest {
  name?: string;
  subCategories?: string;
  isVisible?: boolean;
  image?: File;
}

interface CropFormData {
  name: string;
  subCategories: SubCategory[];
  isVisible: boolean;
  image: File | null;
}

// API Service
const API_BASE = `${BASE_URL}api/admin`;

const createAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

const cropService = {
  async getAllCrops(): Promise<{ success: boolean; count: number; crops: CropType[] }> {
    const response = await axios.get(`${API_BASE}/get-all-crops`, {
      headers: createAuthHeaders(),
    });
    return response.data;
  },

  async createCrop(data: CreateCropRequest): Promise<{ success: boolean; message: string; crop: CropType }> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('subCategories', data.subCategories);
    formData.append('image', data.image);

    const response = await axios.post(`${API_BASE}/add-crop`, formData, {
      headers: {
        ...createAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateCrop(id: string, data: UpdateCropRequest): Promise<{ success: boolean; message: string; crop: CropType }> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.subCategories) formData.append('subCategories', data.subCategories);
    if (data.isVisible !== undefined) formData.append('isVisible', data.isVisible.toString());
    if (data.image) formData.append('image', data.image);

    const response = await axios.patch(`${API_BASE}/update-crop/${id}`, formData, {
      headers: {
        ...createAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteCrop(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(`${API_BASE}/delete-crop/${id}`, {
      headers: createAuthHeaders(),
    });
    return response.data;
  },
};

// Crop Form Modal Component
interface CropFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit:any;
  crop?: CropType;
  title: string;
  submitText: string;
}

const CropFormModal: React.FC<CropFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  crop,
  title,
  submitText,
}) => {
  const [formData, setFormData] = useState<CropFormData>({
    name: '',
    subCategories: [],
    isVisible: true,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (crop) {
      // Handle backward compatibility
      let subCategories = crop.subCategories || [];
      
      // If it's old structure with single subCategory and price
      if (crop.subCategory && crop.price && subCategories.length === 0) {
        subCategories = [{
          name: crop.subCategory,
          price: crop.price
        }];
      }

      setFormData({
        name: crop.name,
        subCategories: subCategories,
        isVisible: crop.isVisible,
        image: null,
      });
      setImagePreview(crop.image);
    } else {
      setFormData({
        name: '',
        subCategories: [],
        isVisible: true,
        image: null,
      });
      setImagePreview('');
    }
  }, [crop, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSubCategory = () => {
    setFormData(prev => ({
      ...prev,
      subCategories: [...prev.subCategories, { name: '', price: 0 }],
    }));
  };

  const removeSubCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, i) => i !== index),
    }));
  };

  const updateSubCategory = (index: number, field: keyof SubCategory, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.map((sub, i) =>
        i === index ? { ...sub, [field]: value } : sub
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);
    const success = await onSubmit(formData);
    setLoading(false);
    
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Crop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter crop name"
              required
            />
          </div>

        

          {/* Visibility Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVisible"
              checked={formData.isVisible}
              onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isVisible" className="ml-2 text-sm font-medium text-gray-700">
              Visible to users
            </label>
          </div>

          {/* Sub Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Sub Categories
              </label>
              <button
                type="button"
                onClick={addSubCategory}
                className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            <div className="space-y-3">
              {formData.subCategories.map((sub, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={sub.name}
                    onChange={(e) => updateSubCategory(index, 'name', e.target.value)}
                    placeholder="Sub category name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    value={sub.price || ''}
                    onChange={(e) => updateSubCategory(index, 'price', parseInt(e.target.value) || 0)}
                    placeholder="Price"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubCategory(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.subCategories.length === 0 && (
                <p className="text-sm text-gray-500 italic">No sub categories added yet</p>
              )}
            </div>
          </div>

            {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Image {!crop && '*'}
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="crop-image"
                />
                <label
                  htmlFor="crop-image"
                  className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Image
                </label>
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim() }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Loading...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Crop Component
const Crop: React.FC = () => {
  // State Management
  const [crops, setCrops] = useState<CropType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropType | null>(null);
  const [deletingCrop, setDeletingCrop] = useState<CropType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Normalize crop data for backward compatibility
  const normalizeCrop = (crop: CropType): CropType => {
    // If it has old structure, convert to new structure
    if (crop.subCategory && crop.price && (!crop.subCategories || crop.subCategories.length === 0)) {
      return {
        ...crop,
        subCategories: [{
          name: crop.subCategory,
          price: crop.price
        }]
      };
    }
    return {
      ...crop,
      subCategories: crop.subCategories || []
    };
  };

  // Fetch crops function
  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await cropService.getAllCrops();
      if (response.success) {
        // Normalize all crops for consistent display
        const normalizedCrops = response.crops.map(normalizeCrop);
        setCrops(normalizedCrops);
      } else {
        toast.error('Failed to fetch crops');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch crops';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create crop function
  const createCrop = async (data: { name: string; subCategories: any[]; image: File }) => {
    try {
      const response = await cropService.createCrop({
        name: data.name,
        subCategories: JSON.stringify(data.subCategories),
        image: data.image,
      });
      if (response.success) {
        const normalizedCrop = normalizeCrop(response.crop);
        setCrops(prev => [...prev, normalizedCrop]);
        toast.success(response.message);
        return true;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create crop';
      toast.error(errorMessage);
      return false;
    }
  };

  // Update crop function
  const updateCrop = async (id: string, data: { name?: string; subCategories?: any[]; isVisible?: boolean; image?: File }) => {
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.subCategories) updateData.subCategories = JSON.stringify(data.subCategories);
      if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;
      if (data.image) updateData.image = data.image;

      const response = await cropService.updateCrop(id, updateData);
      if (response.success) {
        const normalizedCrop = normalizeCrop(response.crop);
        setCrops(prev => prev.map(crop => crop._id === id ? normalizedCrop : crop));
        toast.success(response.message);
        return true;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update crop';
      toast.error(errorMessage);
      return false;
    }
  };

  // Delete crop function
  const deleteCrop = async (id: string) => {
    try {
      const response = await cropService.deleteCrop(id);
      if (response.success) {
        setCrops(prev => prev.filter(crop => crop._id !== id));
        toast.success(response.message);
        return true;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete crop';
      toast.error(errorMessage);
      return false;
    }
  };

  // Load crops on component mount
  useEffect(() => {
    fetchCrops();
  }, []);

  // Filter crops based on search
  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Event Handlers
  const handleCreate = async (data: any) => {
    return await createCrop(data);
  };

  const handleUpdate = async (data: any) => {
    if (!editingCrop) return false;
    return await updateCrop(editingCrop._id, data);
  };

  const handleDelete = async () => {
    if (!deletingCrop) return;
    setDeleteLoading(true);
    const success = await deleteCrop(deletingCrop._id);
    setDeleteLoading(false);
    if (success) {
      setDeletingCrop(null);
    }
  };

  const toggleVisibility = async (crop: CropType) => {
    await updateCrop(crop._id, { isVisible: !crop.isVisible });
  };

  // Get total subcategories count
  const getTotalSubCategories = () => {
    return crops.reduce((total, crop) => total + (crop.subCategories?.length || 0), 0);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crop Management</h1>
          <p className="text-gray-600">Manage your crops and subcategories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Crop
        </button>
      </div> */}
       <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <div>
                         <h1 className="text-3xl font-bold text-gray-900">Crop Management</h1>
          <p className="text-gray-600">Manage your crops and subcategories</p>
              </div>
              
            </div>
                    <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Crop
        </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search crops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ImageIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Crops</p>
              <p className="text-2xl font-bold text-gray-900">{crops.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Visible Crops</p>
              <p className="text-2xl font-bold text-gray-900">
                {crops.filter(crop => crop.isVisible).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ImageIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sub Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {getTotalSubCategories()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No crops found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first crop'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <div key={crop._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Crop Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZmFmYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTY5ZmIzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                  }}
                />
              </div>

              {/* Crop Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{crop.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleVisibility(crop)}
                      className={`p-2 rounded-lg transition-colors ${
                        crop.isVisible
                          ? 'text-green-600 bg-green-100 hover:bg-green-200'
                          : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {crop.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingCrop(crop)}
                      className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCrop(crop)}
                      className="p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub Categories */}
                {crop.subCategories && crop.subCategories.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Sub Categories:</h4>
                    <div className="space-y-1">
                      {crop.subCategories.map((sub, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{sub.name}</span>
                          <span className="font-medium text-gray-900">₹{sub.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No sub categories
                  </div>
                )}

                {/* Status Badge */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    crop.isVisible
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {crop.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CropFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Add New Crop"
        submitText="Create Crop"
      />

      {editingCrop && (
        <CropFormModal
          isOpen={!!editingCrop}
          onClose={() => setEditingCrop(null)}
          onSubmit={handleUpdate}
          crop={editingCrop}
          title="Edit Crop"
          submitText="Update Crop"
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deletingCrop}
        onClose={() => setDeletingCrop(null)}
        onConfirm={handleDelete}
        title="Delete Crop"
        message={`Are you sure you want to delete "${deletingCrop?.name}"? This action cannot be undone and will remove all associated sub categories.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Crop;
