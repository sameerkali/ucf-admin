import React, { useState, useEffect } from 'react';
import { Search, Trash2, Users, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAppSelector } from '../../reducers/store';
import { BASE_URL } from '../../utils/constants';

interface Farmer {
  _id: string;
  name: string;
  fatherName: string;
  mobile: string;
  adharNo: string;
  address: {
    state: string;
    district: string;
    tehsil: string;
    block: string;
    village: string;
    pincode: string;
  };
  role: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  mobileVerified: boolean;
  bankVerified: boolean;
  otherDetailsVerified: boolean;
  profileStatus: string;
  authMethod: string;
  posId?: string;
  isVerifiedBy?: {
    userId: string;
    role: string;
  };
}

interface GetFarmersResponse {
  success: boolean;
  page: number;
  totalPages: number;
  totalUsers: number;
  users: Farmer[];
}

const Farmer: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);
  console.log("token:", token);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    farmer: Farmer | null;
  }>({ isOpen: false, farmer: null });

  const ITEMS_PER_PAGE = 8;

  // Fetch farmers data
  const fetchFarmers = async (page: number = currentPage, name: string = searchTerm) => {
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        filters: {
          role: "Farmer",
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

      const data: GetFarmersResponse = response.data;
      
      if (data.success) {
        setFarmers(data.users);
        setTotalPages(data.totalPages);
        setTotalFarmers(data.totalUsers);
        setCurrentPage(data.page);
      } else {
        toast.error('Failed to fetch farmers');
      }
    } catch (error: any) {
      console.error('Error fetching farmers:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to fetch farmers');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle delete
  const handleDelete = async (farmer: Farmer) => {
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
          userId: farmer._id,
          role: "Farmer"
        }
      });

      const data = response.data;
      
      if (data.success) {
        toast.success(`${farmer.name} has been deleted successfully`);
        setDeleteModal({ isOpen: false, farmer: null });
        // Refresh the list
        fetchFarmers(currentPage, searchTerm);
      } else {
        toast.error(data.message || 'Failed to delete farmer');
      }
    } catch (error: any) {
      console.error('Error deleting farmer:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to delete farmer');
      }
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchFarmers(page, searchTerm);
  };

  // Effects
  useEffect(() => {
    if (token) {
      fetchFarmers(1, '');
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    
    const timeoutId = setTimeout(() => {
      fetchFarmers(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, token]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format address
  const formatAddress = (address: Farmer['address']) => {
    const parts = [address.village, address.block, address.tehsil, address.district, address.state].filter(Boolean);
    return parts.join(', ');
  };

  // Get status color and text
  const getStatusInfo = (farmer: Farmer) => {
    if (farmer.profileStatus === 'completed' && farmer.isVerified) {
      return {
        color: 'bg-green-100 text-green-800',
        text: 'Verified'
      };
    } else if (farmer.profileStatus === 'completed' && !farmer.isVerified) {
      return {
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Pending Verification'
      };
    } else {
      return {
        color: 'bg-red-100 text-red-800',
        text: 'Incomplete'
      };
    }
  };

  if (!token) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-500">Please log in to access farmer management.</p>
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
            <Users className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Farmer Management
          </h1>
        </div>
        <p className="text-gray-600">
          Manage and view all registered farmers in the system
        </p>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-xl shadow-sm mb-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search farmers by name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01A63C] focus:border-transparent outline-none"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="bg-[#01A63C]/10 text-[#01A63C] px-3 py-1 rounded-full font-medium">
              Total: {totalFarmers} farmers
            </span>
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
                  Farmer Details
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact & ID
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
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
                      <span className="ml-3 text-gray-500">Loading farmers...</span>
                    </div>
                  </td>
                </tr>
              ) : farmers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers found</h3>
                    <p className="text-gray-500">
                      {searchTerm ? 'Try adjusting your search terms.' : 'No farmers registered yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                farmers.map((farmer) => {
                  const statusInfo = getStatusInfo(farmer);
                  return (
                    <tr key={farmer._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-[#01A63C] flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {farmer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {farmer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Father: {farmer.fatherName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm text-gray-900">{farmer.mobile}</div>
                        <div className="text-sm text-gray-500">
                          Aadhar: {farmer.adharNo}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={formatAddress(farmer.address)}>
                            {formatAddress(farmer.address)}
                          </div>
                          <div className="text-gray-500">{farmer.address.pincode}</div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                        <div className="flex gap-1 mt-1">
                          {farmer.mobileVerified && (
                            <span className="inline-flex px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                              Mobile ✓
                            </span>
                          )}
                          {farmer.bankVerified && (
                            <span className="inline-flex px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                              Bank ✓
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                        {formatDate(farmer.createdAt)}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, farmer })}
                          className="inline-flex items-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete farmer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalFarmers)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{totalFarmers}</span> results
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

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.farmer && (
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
                  Delete Farmer
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: false, farmer: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{deleteModal.farmer.name}</span>?
                This will permanently remove their account and all associated data.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, farmer: null })}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.farmer!)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Delete Farmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Farmer;
