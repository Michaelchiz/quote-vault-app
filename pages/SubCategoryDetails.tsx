import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useStore } from '../store/StoreContext';
import { Copy, Trash2, Link as LinkIcon, CheckCircle2, Pencil, Check, X, Plus } from 'lucide-react';
import { CategoryName } from '../types';

const CATEGORIES: CategoryName[] = ['Flirty', 'Motivation', 'Relationships', 'Confidence', 'Mindset', 'Other'];

export const SubCategoryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subCategories, deleteSubCategory, deleteQuote, updateSubCategory, addQuoteToSubCategory, updateQuote } = useStore();
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // Edit States
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<CategoryName>('Other');
  const [newQuoteText, setNewQuoteText] = useState('');
  const [editQuoteText, setEditQuoteText] = useState('');

  const subCategory = subCategories.find(sc => sc.id === id);

  if (!subCategory) {
    return (
      <Layout showBack title="Not Found">
        <div className="text-center mt-12 text-skin-muted">Collection not found.</div>
      </Layout>
    );
  }

  const handleDeleteCollection = () => {
    if (window.confirm('Delete this entire collection?')) {
      deleteSubCategory(subCategory.id);
      navigate(-1);
    }
  };

  const handleCopy = (text: string, quoteId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(quoteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startHeaderEdit = () => {
    setEditTitle(subCategory.title);
    setEditCategory(subCategory.categoryId);
    setIsEditingHeader(true);
  };

  const saveHeaderEdit = () => {
    if (editTitle.trim()) {
      updateSubCategory(subCategory.id, { title: editTitle, categoryId: editCategory });
    }
    setIsEditingHeader(false);
  };

  const handleAddQuote = () => {
    if (newQuoteText.trim()) {
      addQuoteToSubCategory(subCategory.id, newQuoteText);
      setNewQuoteText('');
      setIsAddingQuote(false);
    }
  };

  const startQuoteEdit = (quoteId: string, text: string) => {
    setEditingQuoteId(quoteId);
    setEditQuoteText(text);
  };

  const saveQuoteEdit = (quoteId: string) => {
    if (editQuoteText.trim()) {
      updateQuote(subCategory.id, quoteId, editQuoteText);
    }
    setEditingQuoteId(null);
  };

  return (
    <Layout 
      showBack 
      title={isEditingHeader ? "Edit Collection" : subCategory.title}
      headerAction={
        !isEditingHeader && (
          <button onClick={handleDeleteCollection} className="text-skin-muted hover:text-red-500 p-2">
            <Trash2 size={20} />
          </button>
        )
      }
    >
      <div className="space-y-6">
        {/* Meta Header / Edit Header */}
        {isEditingHeader ? (
          <div className="bg-skin-card p-4 rounded-xl border border-skin-border shadow-sm space-y-3 animate-fade-in">
            <div>
              <label className="text-[10px] font-bold text-skin-muted uppercase tracking-wider block mb-1">Title</label>
              <input 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-skin-base p-2 rounded-lg border border-skin-border outline-none focus:border-brand-500 text-sm font-semibold"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-skin-muted uppercase tracking-wider block mb-1">Category</label>
              <select 
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as CategoryName)}
                className="w-full bg-skin-base p-2 rounded-lg border border-skin-border outline-none focus:border-brand-500 text-sm"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveHeaderEdit} className="flex-1 bg-brand-600 text-white py-2 rounded-lg text-sm font-bold flex justify-center gap-1">
                <Check size={16} /> Save
              </button>
              <button onClick={() => setIsEditingHeader(false)} className="flex-1 bg-skin-hover text-skin-text py-2 rounded-lg text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-2 text-xs text-skin-muted">
                <span className="bg-skin-card border border-skin-border px-2 py-1 rounded-full text-skin-text font-medium">{subCategory.categoryId}</span>
                <span>• {new Date(subCategory.createdAt).toLocaleDateString()}</span>
             </div>
             <button onClick={startHeaderEdit} className="p-1.5 text-skin-muted hover:text-brand-600 hover:bg-skin-hover rounded-lg transition-colors">
               <Pencil size={16} />
             </button>
          </div>
        )}

        {/* Quotes List */}
        <div className="space-y-4">
          {/* Add Quote Section */}
          {!isAddingQuote ? (
            <button 
              onClick={() => setIsAddingQuote(true)}
              className="w-full py-3 border-2 border-dashed border-skin-border rounded-xl text-skin-muted font-medium text-sm flex items-center justify-center gap-2 hover:border-brand-500/50 hover:text-brand-600 hover:bg-brand-500/5 transition-all"
            >
              <Plus size={18} /> Add Quote
            </button>
          ) : (
            <div className="bg-skin-card p-4 rounded-xl border border-skin-border shadow-sm animate-fade-in">
              <textarea 
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                placeholder="Enter new quote..."
                className="w-full bg-transparent resize-none outline-none text-skin-text placeholder:text-skin-muted mb-3"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                 <button onClick={() => setIsAddingQuote(false)} className="p-2 text-skin-muted hover:bg-skin-hover rounded-lg">
                    <X size={18} />
                 </button>
                 <button 
                  onClick={handleAddQuote} 
                  disabled={!newQuoteText.trim()}
                  className="px-4 py-2 bg-brand-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center gap-1"
                 >
                    Add <Check size={16} />
                 </button>
              </div>
            </div>
          )}

          {subCategory.quotes.map((quote) => (
            <div key={quote.id} className="bg-skin-card p-5 rounded-xl shadow-sm border border-skin-border relative group hover:border-skin-muted transition-colors">
              
              {editingQuoteId === quote.id ? (
                <div className="animate-fade-in">
                   <textarea 
                      value={editQuoteText}
                      onChange={(e) => setEditQuoteText(e.target.value)}
                      className="w-full bg-skin-base p-3 rounded-lg border border-skin-border text-skin-text outline-none focus:border-brand-500 resize-none mb-3"
                      rows={4}
                      autoFocus
                   />
                   <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingQuoteId(null)} className="px-3 py-1.5 text-sm font-medium text-skin-muted hover:text-skin-text">Cancel</button>
                      <button onClick={() => saveQuoteEdit(quote.id)} className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-sm font-bold shadow-sm">Save</button>
                   </div>
                </div>
              ) : (
                <>
                  <p className="text-skin-text text-lg leading-relaxed font-medium mb-4 pr-6">
                    "{quote.text}"
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-skin-border pt-3 mt-2">
                    <div className="flex items-center gap-2">
                      {quote.sourceLink && (
                        <a 
                          href={quote.sourceLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-skin-muted hover:text-brand-600 flex items-center gap-1 text-xs"
                        >
                          <LinkIcon size={12} /> Source
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                       <button 
                        onClick={() => startQuoteEdit(quote.id, quote.text)}
                        className="p-2 text-skin-muted hover:text-brand-600 hover:bg-skin-hover rounded-lg transition-colors"
                        title="Edit quote"
                      >
                        <Pencil size={16} />
                      </button>
                       <button 
                        onClick={() => deleteQuote(subCategory.id, quote.id)}
                        className="p-2 text-skin-muted hover:text-red-500 hover:bg-skin-hover rounded-lg transition-colors"
                        title="Delete quote"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleCopy(quote.text, quote.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          copiedId === quote.id 
                            ? 'bg-green-500/10 text-green-600' 
                            : 'bg-skin-hover text-skin-muted hover:bg-skin-border hover:text-skin-text'
                        }`}
                      >
                        {copiedId === quote.id ? (
                          <>
                            <CheckCircle2 size={14} /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};