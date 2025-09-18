import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  Eye,
  FileText,
  MessageSquare,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { BASE_URL } from '../../utils/constants';

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface FAQFromAPI {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  __v: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  isPublished: boolean;
  lastModified: string;
}

interface FAQFormData {
  question: string;
  answer: string;
}

interface FAQsResponse {
  data: FAQFromAPI[];
  pagination: PaginationInfo;
}

// --- API SERVICE ---
class FAQService {
  
  private static getAuthHeaders() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getAllFAQs(page: number = 1, limit: number = 50): Promise<FAQsResponse> {
    try {
      const response = await axios.get(
        `${BASE_URL}api/faq/getAll?page=${page}&limit=${limit}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  }

  static async createFAQ(faqData: FAQFormData): Promise<APIResponse<FAQFromAPI>> {
    try {
      const response = await axios.post(
        `${BASE_URL}api/faq/create`,
        faqData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating FAQ:', error);
      throw error;
    }
  }

  static async updateFAQ(id: string, faqData: Partial<FAQFormData>): Promise<APIResponse<any>> {
    try {
      const response = await axios.put(
        `${BASE_URL}api/faq/update/${id}`,
        faqData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      throw error;
    }
  }

  static async deleteFAQ(id: string): Promise<APIResponse<any>> {
    try {
      const response = await axios.delete(
        `${BASE_URL}api/faq/delete/${id}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      throw error;
    }
  }
}

// --- UTILITY FUNCTIONS ---
const transformAPIFAQToFAQ = (apiFaq: FAQFromAPI): FAQ => ({
  id: apiFaq._id,
  question: apiFaq.question,
  answer: apiFaq.answer,
  isPublished: true, // All FAQs from API are considered published
  lastModified: new Date(apiFaq.createdAt).toISOString().split('T')[0]
});

// --- HELPER & UI COMPONENTS ---
const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Loader2 className={`animate-spin`} size={size} />
);

const StatCard: React.FC<{ 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  color: string; 
  isLoading?: boolean;
}> = ({ title, value, icon: Icon, color, isLoading = false }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 flex items-center gap-5">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      {isLoading ? <LoadingSpinner /> : <Icon className="w-6 h-6 text-white" />}
    </div>
    <div>
      <p className="text-slate-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-slate-800">
        {isLoading ? '-' : value}
      </p>
    </div>
  </div>
);

const FAQItem: React.FC<{ 
  faq: FAQ; 
  onEdit: () => void; 
  onDelete: () => void; 
  onPublishToggle: () => void;
  isLoading?: boolean;
}> = ({ faq, onEdit, onDelete, isLoading = false }) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200/80 transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="font-bold text-slate-800 mb-1">{faq.question}</p>
        <p className="text-sm text-slate-500 line-clamp-2">{faq.answer}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button 
          onClick={onEdit} 
          title="Edit" 
          disabled={isLoading}
          className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner size={16} /> : <Edit3 size={16} />}
        </button>
        <button 
          onClick={onDelete} 
          title="Delete" 
          disabled={isLoading}
          className="p-2 rounded-md hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
        Published
      </span>
      <p className="text-xs text-slate-400">Modified: {faq.lastModified}</p>
    </div>
  </div>
);

const FAQModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: FAQFormData;
  setFormData: React.Dispatch<React.SetStateAction<FAQFormData>>;
  isEditing: boolean;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSave, formData, setFormData, isEditing, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit FAQ' : 'Create New FAQ'}</h3>
          <button onClick={onClose} disabled={isLoading} className="p-2 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50">
            <X className="text-slate-500" />
          </button>
        </header>
        <main className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Question *</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 disabled:bg-gray-100"
              placeholder="e.g., How do I reset my password?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Answer *</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
              rows={8}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-vertical transition disabled:opacity-50 disabled:bg-gray-100"
              placeholder="Provide a clear and concise answer..."
            />
          </div>
        </main>
        <footer className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="px-5 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!formData.question.trim() || !formData.answer.trim() || isLoading}
            className="px-5 py-2.5 flex items-center gap-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <LoadingSpinner size={16} /> : <Save size={16} />}
            {isEditing ? 'Update' : 'Create'}
          </button>
        </footer>
      </div>
    </div>
  );
};

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading: boolean;
}> = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-slate-500 mt-1">{message}</p>
          </div>
        </div>
        <footer className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <LoadingSpinner size={16} /> : null}
            Confirm Delete
          </button>
        </footer>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Faq: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<FAQFormData>({ question: '', answer: '' });
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // Load FAQs from API
  const loadFAQs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await FAQService.getAllFAQs();
      const transformedFAQs = response.data.map(transformAPIFAQToFAQ);
      setFaqs(transformedFAQs);
    } catch (error: any) {
      console.error('Error loading FAQs:', error);
      toast.error(error?.response?.data?.message || 'Failed to load FAQs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFAQs();
  }, [loadFAQs]);

  const handleCreateNew = () => {
    setEditingFaq(null);
    setFormData({ question: '', answer: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({ question: faq.question, answer: faq.answer });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsModalLoading(true);
      
      if (editingFaq) {
        // Update existing FAQ
        await FAQService.updateFAQ(editingFaq.id, {
          question: formData.question.trim(),
          answer: formData.answer.trim()
        });
        toast.success('FAQ updated successfully');
      } else {
        // Create new FAQ
        await FAQService.createFAQ({
          question: formData.question.trim(),
          answer: formData.answer.trim()
        });
        toast.success('FAQ created successfully');
      }
      
      setIsModalOpen(false);
      setFormData({ question: '', answer: '' });
      setEditingFaq(null);
      await loadFAQs(); // Reload the list
    } catch (error: any) {
      console.error('Error saving FAQ:', error);
      toast.error(error?.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleteLoading(true);
      await FAQService.deleteFAQ(id);
      toast.success('FAQ deleted successfully');
      setDeleteCandidate(null);
      await loadFAQs(); // Reload the list
    } catch (error: any) {
      console.error('Error deleting FAQ:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete FAQ');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadFAQs();
    toast.success('FAQs refreshed');
  };

  // Since API doesn't support publish/unpublish, we'll remove this functionality
  const publishedFaqs = faqs; // All FAQs are considered published
  

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">FAQ Content Management</h1>
              <p className="text-sm text-slate-500">Create, edit, and manage FAQs for your users.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleCreateNew}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Plus size={16} />
              <span>Add New FAQ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total FAQs" 
            value={faqs.length} 
            icon={MessageSquare} 
            color="bg-sky-500" 
            isLoading={isLoading}
          />
          <StatCard 
            title="Active Items" 
            value={faqs.length} 
            icon={FileText} 
            color="bg-purple-500" 
            isLoading={isLoading}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* FAQ Management Column */}
          <div className="space-y-6">
            <FAQSection 
              title="All FAQs" 
              faqs={faqs} 
              onEdit={handleEdit} 
              onDelete={setDeleteCandidate} 
              isLoading={isLoading}
            />
          </div>

          {/* Live Preview Column */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80">
              <header className="p-5 border-b border-slate-200/80 flex items-center gap-3">
                <Eye className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-800">Live Preview</h2>
              </header>
              {publishedFaqs.length > 0 ? (
                <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                  {publishedFaqs.map(faq => (
                    <div key={faq.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedPreview(expandedPreview === faq.id ? null : faq.id)}
                        className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-medium text-slate-700">{faq.question}</span>
                        {expandedPreview === faq.id ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                      </button>
                      {expandedPreview === faq.id && (
                        <div className="px-4 pb-4 text-slate-600 border-t border-slate-200/80">
                          <p className="pt-3">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner />
                      <p className="text-slate-500">Loading FAQs...</p>
                    </div>
                  ) : (
                    <p className="text-slate-500">No FAQs available yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <FAQModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingFaq}
        isLoading={isModalLoading}
      />

      <ConfirmationModal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={() => deleteCandidate && handleDelete(deleteCandidate)}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
        isLoading={isDeleteLoading}
      />
    </div>
  );
};

const FAQSection: React.FC<{
  title: string;
  faqs: FAQ[];
  onEdit: (faq: FAQ) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}> = ({ title, faqs, onEdit, onDelete, isLoading }) => (
  <div>
    <h2 className="text-xl font-bold text-slate-700 mb-4">{title}</h2>
    {isLoading ? (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    ) : faqs.length > 0 ? (
      <div className="space-y-4">
        {faqs.map(faq => (
          <FAQItem 
            key={faq.id} 
            faq={faq} 
            onEdit={() => onEdit(faq)} 
            onDelete={() => onDelete(faq.id)} 
            onPublishToggle={() => {}} // Not used since API doesn't support this
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-10 px-6 bg-white rounded-lg border-2 border-dashed border-slate-200">
        <HelpCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <p className="text-slate-500">No FAQs available yet.</p>
        <p className="text-sm text-slate-400 mt-1">Create your first FAQ to get started.</p>
      </div>
    )}
  </div>
);

export default Faq;
