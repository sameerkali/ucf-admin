import React, { useState, useEffect } from 'react';
import { X, Eye, Check, AlertTriangle, Clock, User, MapPin, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAppSelector } from '../../reducers/store';
import { BASE_URL } from '../../utils/constants';

interface RequestUser {
  _id: string;
  name: string;
  mobile: string;
}

interface UserAddress {
  state: string;
  district: string;
  tehsil: string;
  block: string;
  village: string;
  pincode: string;
}

interface POSRequest {
  _id: string;
  user: RequestUser | null;
  userModel: string;
  userAddress: UserAddress;
  type: string;
  title: string;
  description: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface RequestsResponse {
  success: boolean;
  requests: POSRequest[];
}

interface RequestReviewProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequestReview: React.FC<RequestReviewProps> = ({ isOpen, onClose }) => {
  const { token } = useAppSelector((state) => state.auth);
  const [requests, setRequests] = useState<POSRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<POSRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Fetch all requests
  const fetchRequests = async () => {
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}api/requests/getAll`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: RequestsResponse = response.data;
      
      if (data.success) {
        setRequests(data.requests || []);
      } else {
        toast.error('Failed to fetch requests');
      }
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to fetch requests');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update request status
  const updateRequestStatus = async (requestId: string, status: 'verified' | 'rejected') => {
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    setUpdatingStatus(requestId);
    try {
      const response = await axios.put(`${BASE_URL}api/requests/updateStatus`, {
        requestId,
        status
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success(`Request ${status} successfully`);
        fetchRequests(); // Refresh the list
        if (showDetailsModal) {
          setShowDetailsModal(false);
          setSelectedRequest(null);
        }
      } else {
        toast.error(`Failed to ${status} request`);
      }
    } catch (error: any) {
      console.error(`Error updating request status:`, error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error(`Failed to ${status} request`);
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format address
  const formatAddress = (address: UserAddress) => {
    const parts = [address.village, address.block, address.tehsil, address.district, address.state].filter(Boolean);
    return parts.join(', ');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      case 'pending':
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Get user model color
  const getUserModelColor = (userModel: string) => {
    switch (userModel.toLowerCase()) {
      case 'pos':
        return 'bg-blue-100 text-blue-800';
      case 'farmer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle view details
  const handleViewDetails = (request: POSRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Effect to fetch requests when modal opens
  useEffect(() => {
    if (isOpen && token) {
      fetchRequests();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#01A63C] rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Verification Requests Review</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01A63C]"></div>
                <span className="ml-3 text-gray-500">Loading requests...</span>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Found</h3>
                <p className="text-gray-500">There are no verification requests to review at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* User Avatar */}
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-[#01A63C] flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {request.user?.name ? request.user.name.charAt(0).toUpperCase() : request.userModel.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Request Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {request.user?.name || 'Unknown User'}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserModelColor(request.userModel)}`}>
                              {request.userModel}
                            </span>
                          </div>

                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-700">{request.title}</p>
                            <p className="text-xs text-gray-500">{request.description}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            {request.user && (
                              <>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>ID: {request.user._id.slice(-8)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4 flex items-center justify-center text-xs">📱</span>
                                  <span>{request.user.mobile}</span>
                                </div>
                              </>
                            )}
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{formatAddress(request.userAddress)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(request.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>

                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateRequestStatus(request._id, 'verified')}
                              disabled={updatingStatus === request._id}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {updatingStatus === request._id ? 'Accepting...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => updateRequestStatus(request._id, 'rejected')}
                              disabled={updatingStatus === request._id}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4 mr-1" />
                              {updatingStatus === request._id ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Request Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-5 h-5 text-[#01A63C]" />
                    <h4 className="text-lg font-semibold text-gray-900">User Information</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-[#01A63C] flex items-center justify-center mr-4">
                        <span className="text-xl font-bold text-white">
                          {selectedRequest.user?.name ? selectedRequest.user.name.charAt(0).toUpperCase() : selectedRequest.userModel.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h5 className="text-lg font-medium text-gray-900">
                          {selectedRequest.user?.name || 'Unknown User'}
                        </h5>
                        <p className="text-sm text-gray-500">{selectedRequest.userModel} Request</p>
                      </div>
                    </div>
                    
                    {selectedRequest.user ? (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-500">User ID</label>
                          <p className="text-sm text-gray-900 font-mono">{selectedRequest.user._id}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                          <p className="text-sm text-gray-900">{selectedRequest.user.mobile}</p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          User information is not available (user may have been deleted)
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">User Type</label>
                      <p className="text-sm text-gray-900">{selectedRequest.userModel}</p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-[#01A63C]" />
                    <h4 className="text-lg font-semibold text-gray-900">Address Information</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Complete Address</label>
                      <p className="text-sm text-gray-900">
                        {selectedRequest.userAddress.village}, {selectedRequest.userAddress.block},<br />
                        {selectedRequest.userAddress.tehsil}, {selectedRequest.userAddress.district},<br />
                        {selectedRequest.userAddress.state} - {selectedRequest.userAddress.pincode}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">State</label>
                        <p className="text-sm text-gray-900">{selectedRequest.userAddress.state}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">District</label>
                        <p className="text-sm text-gray-900">{selectedRequest.userAddress.district}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tehsil</label>
                        <p className="text-sm text-gray-900">{selectedRequest.userAddress.tehsil}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Block</label>
                        <p className="text-sm text-gray-900">{selectedRequest.userAddress.block}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Village</label>
                        <p className="text-sm text-gray-900">{selectedRequest.userAddress.village}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Pincode</label>
                        <p className="text-sm text-gray-900">{selectedRequest.userAddress.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-[#01A63C]" />
                    <h4 className="text-lg font-semibold text-gray-900">Request Information</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Request Type</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedRequest.type}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Title</label>
                      <p className="text-sm text-gray-900">{selectedRequest.title}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm text-gray-900">{selectedRequest.description}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Status</label>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusIcon(selectedRequest.status)}
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </span>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Request ID</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedRequest._id}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-[#01A63C]" />
                    <h4 className="text-lg font-semibold text-gray-900">Timeline</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Request Submitted</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedRequest.updatedAt)}</p>
                    </div>
                    
                    {selectedRequest.createdAt !== selectedRequest.updatedAt && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          This request has been updated since it was initially created.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' && (
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => updateRequestStatus(selectedRequest._id, 'rejected')}
                    disabled={updatingStatus === selectedRequest._id}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    {updatingStatus === selectedRequest._id ? 'Rejecting...' : 'Reject Request'}
                  </button>
                  <button
                    onClick={() => updateRequestStatus(selectedRequest._id, 'verified')}
                    disabled={updatingStatus === selectedRequest._id}
                    className="px-4 py-2 bg-[#01A63C] text-white hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {updatingStatus === selectedRequest._id ? 'Accepting...' : 'Accept Request'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestReview;
