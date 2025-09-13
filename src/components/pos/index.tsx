import React, { useState, useEffect } from 'react';
import { Search, Trash2, AlertTriangle, X, ChevronLeft, ChevronRight, Plus, Store, Eye, User, MapPin, Calendar, CheckCircle, XCircle, CreditCard, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAppSelector } from '../../reducers/store';
import { BASE_URL } from '../../utils/constants';

interface BankDetail {
  _id: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  user: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface OtherDetail {
  _id: string;
  user: string;
  role: string;
  cropsHandled: string[];
  crops: string[];
  createdAt: string;
  updatedAt: string;
}

interface POS {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  mobileVerified: boolean;
  bankVerified: boolean;
  otherDetailsVerified: boolean;
  profileStatus: string;
  authMethod?: string;
  address: {
    state: string;
    district: string;
    tehsil: string;
    block: string;
    village: string;
    pincode: string;
  };
}

interface POSDetails extends POS {
  bankDetails?: BankDetail[];
  otherDetails?: OtherDetail[];
}

interface GetPOSResponse {
  success: boolean;
  page: number;
  totalPages: number;
  totalUsers: number;
  users: POS[];
}

interface CreatePOSData {
  name: string;
  email: string;
  password: string;
  mobile: string;
  address: {
    state: string;
    district: string;
    tehsil: string;
    block: string;
    village: string;
    pincode: string;
  };
}

const POS: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);
  const [posList, setPOSList] = useState<POS[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPOS, setTotalPOS] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    pos: POS | null;
  }>({ isOpen: false, pos: null });

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    pos: POSDetails | null;
    loading: boolean;
  }>({ isOpen: false, pos: null, loading: false });

  const ITEMS_PER_PAGE = 8;

  const [formData, setFormData] = useState<CreatePOSData>({
    name: '',
    email: '',
    password: '',
    mobile: '',
    address: {
      state: '',
      district: '',
      tehsil: '',
      block: '',
      village: '',
      pincode: ''
    }
  });

  // Fetch POS data
  const fetchPOSList = async (page: number = currentPage, name: string = searchTerm) => {
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        filters: {
          role: "POS",
          ...(name && { name })
        },
        limit: ITEMS_PER_PAGE,
        page,
        sort: 'asc'
      };

      const response = await axios.post(`${BASE_URL}api/admin/get-all-users`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data: GetPOSResponse = response.data;
      
      if (data.success) {
        setPOSList(data.users);
        setTotalPages(data.totalPages);
        setTotalPOS(data.totalUsers);
        setCurrentPage(data.page);
      } else {
        toast.error('Failed to fetch POS list');
      }
    } catch (error: any) {
      console.error('Error fetching POS:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to fetch POS list');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch POS details
  const fetchPOSDetails = async (posId: string) => {
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    setDetailsModal(prev => ({ ...prev, loading: true }));
    try {
      const response = await axios.post(`${BASE_URL}api/admin/get-user-details`, {
        id: posId,
        role: "POS"
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        setDetailsModal(prev => ({ 
          ...prev, 
          pos: response.data.data[0],
          loading: false 
        }));
      } else {
        toast.error('Failed to fetch POS details');
        setDetailsModal(prev => ({ ...prev, loading: false }));
      }
    } catch (error: any) {
      console.error('Error fetching POS details:', error);
      toast.error('Failed to fetch POS details');
      setDetailsModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle view details
  const handleViewDetails = (pos: POS) => {
    setDetailsModal({ isOpen: true, pos: null, loading: true });
    fetchPOSDetails(pos._id);
  };

  // Handle create POS
  const handleCreatePOS = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    if (!formData.name || !formData.email || !formData.password || !formData.mobile) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(`${BASE_URL}api/admin/create-pos`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('POS created successfully');
        setShowCreateModal(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          mobile: '',
          address: {
            state: '',
            district: '',
            tehsil: '',
            block: '',
            village: '',
            pincode: ''
          }
        });
        fetchPOSList();
      } else {
        toast.error(response.data.message || 'Failed to create POS');
      }
    } catch (error: any) {
      console.error('Error creating POS:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to create POS');
      }
    } finally {
      setCreating(false);
    }
  };

  // Handle delete
  const handleDelete = async (pos: POS) => {
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      const response = await axios.delete(`${BASE_URL}api/admin/delete-user`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          userId: pos._id,
          role: "POS"
        }
      });

      const data = response.data;
      
      if (data.success) {
        toast.success(`${pos.name} has been deleted successfully`);
        setDeleteModal({ isOpen: false, pos: null });
        fetchPOSList(currentPage, searchTerm);
      } else {
        toast.error(data.message || 'Failed to delete POS');
      }
    } catch (error: any) {
      console.error('Error deleting POS:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to delete POS');
      }
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPOSList(page, searchTerm);
  };

  // Handle form input change
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");

        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof CreatePOSData] as Record<string, any>),
            [child]: value,
          },
        };
      } else {
        return {
          ...prev,
          [field]: value,
        };
      }
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDetailedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format address
  const formatAddress = (address: POS['address']) => {
    const parts = [address.village, address.block, address.tehsil, address.district, address.state].filter(Boolean);
    return parts.join(', ');
  };

  // Get status info based on verification
  const getStatusInfo = (pos: POS) => {
    if (pos.profileStatus === 'completed' && pos.isVerified) {
      return {
        color: 'bg-green-100 text-green-800',
        text: 'Verified'
      };
    } else if (pos.profileStatus === 'completed' && !pos.isVerified) {
      return {
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Pending Verification'
      };
    } else if (pos.profileStatus === 'incomplete') {
      return {
        color: 'bg-orange-100 text-orange-800',
        text: 'Incomplete'
      };
    } else {
      return {
        color: 'bg-gray-100 text-gray-800',
        text: 'Pending'
      };
    }
  };

  // Effects
  useEffect(() => {
    if (token) {
      fetchPOSList(1, '');
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    
    const timeoutId = setTimeout(() => {
      fetchPOSList(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, token]);

  if (!token) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-500">Please log in to access POS management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#01A63C] rounded-lg">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            POS Management
          </h1>
        </div>
        <p className="text-gray-600">
          Manage Point of Sale locations and operators
        </p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-xl shadow-sm mb-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search POS by name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <span className="bg-[#01A63C]/10 text-[#01A63C] px-3 py-1 rounded-full font-medium text-sm">
              Total: {totalPOS} POS
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#01A63C] hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add POS
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  POS Details
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01A63C]"></div>
                      <span className="ml-3 text-gray-500">Loading POS...</span>
                    </div>
                  </td>
                </tr>
              ) : posList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No POS found</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Try adjusting your search terms.' : 'No POS locations registered yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                posList.map((pos) => {
                  const statusInfo = getStatusInfo(pos);
                  return (
                    <tr key={pos._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-[#01A63C] flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {pos.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {pos.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {pos._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm text-gray-900">{pos.email}</div>
                        <div className="text-sm text-gray-500">{pos.mobile}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={formatAddress(pos.address)}>
                            {formatAddress(pos.address)}
                          </div>
                          <div className="text-gray-500">{pos.address.pincode}</div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                        <div className="flex gap-1 mt-1">
                          {pos.mobileVerified && (
                            <span className="inline-flex px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                              Mobile ✓
                            </span>
                          )}
                          {pos.bankVerified && (
                            <span className="inline-flex px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                              Bank ✓
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                        {formatDate(pos.createdAt)}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(pos)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, pos })}
                            className="inline-flex items-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete POS"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {((currentPage - 1) * ITEMS_PER_PAGE) + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalPOS)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{totalPOS}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === currentPage
                              ? 'z-10 bg-[#01A63C] border-[#01A63C] text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create POS Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreatePOS} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New POS</h2>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent"
                  />
                </div>

                {/* Address Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.address.district}
                    onChange={(e) => handleInputChange('address.district', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tehsil
                  </label>
                  <input
                    type="text"
                    value={formData.address.tehsil}
                    onChange={(e) => handleInputChange('address.tehsil', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Block
                  </label>
                  <input
                    type="text"
                    value={formData.address.block}
                    onChange={(e) => handleInputChange('address.block', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Village
                  </label>
                  <input
                    type="text"
                    value={formData.address.village}
                    onChange={(e) => handleInputChange('address.village', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.address.pincode}
                    onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-[#01A63C] text-white hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create POS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POS Details Modal */}
      {detailsModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">POS Details</h2>
                <button
                  onClick={() => setDetailsModal({ isOpen: false, pos: null, loading: false })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {detailsModal.loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01A63C]"></div>
                  <span className="ml-3 text-gray-500">Loading POS details...</span>
                </div>
              ) : detailsModal.pos ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="w-5 h-5 text-[#01A63C]" />
                      <h3 className="text-lg font-semibold text-gray-900">POS Information</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="h-16 w-16 rounded-full bg-[#01A63C] flex items-center justify-center mr-4">
                          <span className="text-xl font-bold text-white">
                            {detailsModal.pos.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{detailsModal.pos.name}</h4>
                          <p className="text-sm text-gray-500">POS Operator</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-sm text-gray-900">{detailsModal.pos.email}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                          <p className="text-sm text-gray-900">{detailsModal.pos.mobile}</p>
                        </div>
                        
                        {detailsModal.pos.authMethod && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Authentication Method</label>
                            <p className="text-sm text-gray-900 capitalize">{detailsModal.pos.authMethod}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-[#01A63C]" />
                      <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Complete Address</label>
                        <p className="text-sm text-gray-900">
                          {detailsModal.pos.address.village}, {detailsModal.pos.address.block},<br />
                          {detailsModal.pos.address.tehsil}, {detailsModal.pos.address.district},<br />
                          {detailsModal.pos.address.state} - {detailsModal.pos.address.pincode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  {detailsModal.pos.bankDetails && detailsModal.pos.bankDetails.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-5 h-5 text-[#01A63C]" />
                        <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {detailsModal.pos.bankDetails.map((bank) => (
                          <div key={bank._id} className="border-l-4 border-[#01A63C] pl-4">
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="text-sm font-medium text-gray-500">Bank Name</label>
                                <p className="text-sm text-gray-900">{bank.bankName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Account Holder</label>
                                <p className="text-sm text-gray-900">{bank.accountHolderName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Account Number</label>
                                <p className="text-sm text-gray-900">{bank.accountNumber}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                                <p className="text-sm text-gray-900">{bank.ifscCode}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Branch</label>
                                <p className="text-sm text-gray-900">{bank.branch}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Details */}
                  {detailsModal.pos.otherDetails && detailsModal.pos.otherDetails.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-5 h-5 text-[#01A63C]" />
                        <h3 className="text-lg font-semibold text-gray-900">Other Details</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {detailsModal.pos.otherDetails.map((detail) => (
                          <div key={detail._id}>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Crops Handled</label>
                              <p className="text-sm text-gray-900">
                                {detail.cropsHandled && detail.cropsHandled.length > 0 
                                  ? detail.cropsHandled.join(', ') 
                                  : 'No crops specified'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Crops</label>
                              <p className="text-sm text-gray-900">
                                {detail.crops && detail.crops.length > 0 
                                  ? detail.crops.join(', ') 
                                  : 'No crops specified'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Status */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-5 h-5 text-[#01A63C]" />
                      <h3 className="text-lg font-semibold text-gray-900">Verification Status</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Profile Status</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          detailsModal.pos.profileStatus === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {detailsModal.pos.profileStatus}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Overall Verification</span>
                        {detailsModal.pos.isVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Mobile Verified</span>
                        {detailsModal.pos.mobileVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Bank Verified</span>
                        {detailsModal.pos.bankVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Other Details Verified</span>
                        {detailsModal.pos.otherDetailsVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-5 h-5 text-[#01A63C]" />
                      <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Account Created</label>
                        <p className="text-sm text-gray-900">{formatDetailedDate(detailsModal.pos.createdAt)}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-sm text-gray-900">{formatDetailedDate(detailsModal.pos.updatedAt)}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">POS ID</label>
                        <p className="text-sm text-gray-900">{detailsModal.pos._id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Failed to load POS details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.pos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete POS
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: false, pos: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{deleteModal.pos.name}</span>?
                This will permanently remove this POS location and all associated data.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, pos: null })}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.pos!)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Delete POS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
