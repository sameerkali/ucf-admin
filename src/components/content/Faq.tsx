import React, { useState } from 'react';
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
  Check,
  FileText,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
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

// --- HELPER & UI COMPONENTS ---

const StatCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string; }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 flex items-center gap-5">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-slate-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const FAQItem: React.FC<{ faq: FAQ; onEdit: () => void; onDelete: () => void; onPublishToggle: () => void; }> = ({ faq, onEdit, onDelete, onPublishToggle }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200/80 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
                <p className="font-bold text-slate-800 mb-1">{faq.question}</p>
                <p className="text-sm text-slate-500 line-clamp-2">{faq.answer}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={onEdit} title="Edit" className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"><Edit3 size={16} /></button>
                <button onClick={onPublishToggle} title={faq.isPublished ? "Unpublish" : "Publish"} className={`p-2 rounded-md transition-colors ${faq.isPublished ? 'hover:bg-amber-100 text-amber-600' : 'hover:bg-emerald-100 text-emerald-600'}`}>
                    {faq.isPublished ? <X size={16} /> : <Check size={16} />}
                </button>
                <button onClick={onDelete} title="Delete" className="p-2 rounded-md hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${faq.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {faq.isPublished ? 'Published' : 'Draft'}
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
}> = ({ isOpen, onClose, onSave, formData, setFormData, isEditing }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit FAQ' : 'Create New FAQ'}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><X className="text-slate-500" /></button>
                </header>
                <main className="p-6 space-y-5 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Question *</label>
                        <input
                            type="text"
                            value={formData.question}
                            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            placeholder="e.g., How do I reset my password?"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Answer *</label>
                        <textarea
                            value={formData.answer}
                            onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                            rows={8}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-vertical transition"
                            placeholder="Provide a clear and concise answer..."
                        />
                    </div>
                </main>
                <footer className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button
                        onClick={onSave}
                        disabled={!formData.question.trim() || !formData.answer.trim()}
                        className="px-5 py-2.5 flex items-center gap-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save size={16} />
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
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
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
                    <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">Confirm Delete</button>
                </footer>
            </div>
        </div>
    );
};

// --- MAIN CONTENT PAGE ---
const Faq = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([
    { id: '1', question: 'How do I reset my password?', answer: 'To reset your password, click on the "Forgot Password" link on the login page and follow the instructions.', isPublished: true, lastModified: '2025-09-15' },
    { id: '2', question: 'How can I contact customer support?', answer: 'You can reach our team through the contact form, by emailing support@example.com, or by calling 1-800-123-4567.', isPublished: true, lastModified: '2025-09-14' },
    { id: '3', question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and bank transfers.', isPublished: false, lastModified: '2025-09-18' }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<FAQFormData>({ question: '', answer: '' });
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);

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

  const handleSave = () => {
    if (!formData.question.trim() || !formData.answer.trim()) return;
    const newFaq: FAQ = {
      id: editingFaq?.id || Date.now().toString(),
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      isPublished: editingFaq?.isPublished || false,
      lastModified: new Date().toISOString().split('T')[0]
    };
    if (editingFaq) {
      setFaqs(prev => prev.map(faq => faq.id === editingFaq.id ? newFaq : faq));
    } else {
      setFaqs(prev => [...prev, newFaq]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setFaqs(prev => prev.filter(faq => faq.id !== id));
    setDeleteCandidate(null);
  };

  const handlePublishToggle = (id: string) => {
    setFaqs(prev => prev.map(faq => faq.id === id ? { ...faq, isPublished: !faq.isPublished } : faq));
  };
  
  const publishedFaqs = faqs.filter(faq => faq.isPublished);
  const draftFaqs = faqs.filter(faq => !faq.isPublished);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">FAQ Content Management</h1>
              <p className="text-sm text-slate-500">Create, edit, and publish FAQs for your users.</p>
            </div>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add New FAQ</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Published FAQs" value={publishedFaqs.length} icon={Check} color="bg-emerald-500" />
          <StatCard title="Drafts" value={draftFaqs.length} icon={FileText} color="bg-amber-500" />
          <StatCard title="Total FAQs" value={faqs.length} icon={MessageSquare} color="bg-sky-500" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* FAQ Management Column */}
          <div className="space-y-6">
            <FAQSection title="Published" faqs={publishedFaqs} onEdit={handleEdit} onDelete={setDeleteCandidate} onPublishToggle={handlePublishToggle} />
            <FAQSection title="Drafts" faqs={draftFaqs} onEdit={handleEdit} onDelete={setDeleteCandidate} onPublishToggle={handlePublishToggle} />
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
                        <p className="text-slate-500">Publish an FAQ to see it here.</p>
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
      />

      <ConfirmationModal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={() => deleteCandidate && handleDelete(deleteCandidate)}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
      />
    </div>
  );
};

const FAQSection: React.FC<{
    title: string;
    faqs: FAQ[];
    onEdit: (faq: FAQ) => void;
    onDelete: (id: string) => void;
    onPublishToggle: (id: string) => void;
}> = ({ title, faqs, onEdit, onDelete, onPublishToggle }) => (
    <div>
        <h2 className="text-xl font-bold text-slate-700 mb-4">{title}</h2>
        {faqs.length > 0 ? (
            <div className="space-y-4">
                {faqs.map(faq => (
                    <FAQItem 
                        key={faq.id} 
                        faq={faq} 
                        onEdit={() => onEdit(faq)} 
                        onDelete={() => onDelete(faq.id)} 
                        onPublishToggle={() => onPublishToggle(faq.id)} 
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-10 px-6 bg-white rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-slate-500">No {title.toLowerCase()} FAQs yet.</p>
            </div>
        )}
    </div>
);

export default Faq;
