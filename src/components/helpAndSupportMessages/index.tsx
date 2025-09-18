import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../../utils/constants';

// Updated Types to match actual API response
interface SupportMessage {
  _id: string;
  user: string;
  text: string;
  isRead: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  data: SupportMessage[];
  message?: string;
}

// Helper function to get admin token
const getAdminToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper function to get status color based on isRead
const getStatusColor = (isRead: boolean): string => {
  return isRead 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-yellow-100 text-yellow-800 border-yellow-200';
};

// Helper function to get role color
const getRoleColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'farmer':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'admin':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'user':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to get user initials
const getUserInitials = (role: string): string => {
  return role.slice(0, 2).toUpperCase();
};

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch support messages
  const fetchMessages = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAdminToken();
      if (!token) {
        throw new Error('Admin token not found');
      }

      const response = await axios.post<ApiResponse>(
        `${BASE_URL}api/support/list`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setMessages(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch messages');
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(`Failed to fetch messages: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete support message
  const deleteMessage = async (messageId: string): Promise<void> => {
    try {
      setDeletingId(messageId);
      
      const token = getAdminToken();
      if (!token) {
        throw new Error('Admin token not found');
      }

      const response = await axios.post(
        `${BASE_URL}/api/support/delete`,
        { id: messageId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        toast.success('Message deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete message');
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'An unexpected error occurred';
      toast.error(`Failed to delete message: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle user icon click
  const handleUserIconClick = (userId: string): void => {
    navigator.clipboard.writeText(userId);
    toast.info(`User ID: ${userId}`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Messages</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchMessages}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Support Messages</h1>
                <p className="text-gray-600 mt-1">
                  {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                </p>
              </div>
              <button
                onClick={fetchMessages}
                disabled={loading}
                className="mt-3 sm:mt-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="divide-y divide-gray-200">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📧</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Found</h3>
                <p className="text-gray-600">There are no support messages to display.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* User Icon */}
                    <button
                      onClick={() => handleUserIconClick(message.user)}
                      className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 cursor-pointer group"
                      title="Click to copy User ID"
                    >
                      {getUserInitials(message.role)}
                    </button>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            Support Message
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(message.role)}`}>
                              {message.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(message.isRead)}`}>
                            {message.isRead ? 'READ' : 'UNREAD'}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {message.text}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center text-sm text-gray-500 gap-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(message.createdAt)}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            ID: {message._id.slice(-8)}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteMessage(message._id)}
                          disabled={deletingId === message._id}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === message._id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                          {deletingId === message._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Messages;
