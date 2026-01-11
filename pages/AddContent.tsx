import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { geminiService } from '../services/geminiService';
import { useStore, FREE_QUOTE_LIMIT } from '../store/StoreContext';
import { ProcessedResult, SubCategory } from '../types';
import { Image as ImageIcon, Link as LinkIcon, Loader2, Check, AlertCircle, Trash2, ArrowRight, RefreshCw, Wand2, PenTool, Crown, ShieldCheck } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type ViewState = 'input' | 'processing' | 'review' | 'success' | 'failure' | 'upgrade';

export const AddContent: React.FC = () => {
  const navigate = useNavigate();
  const { addSubCategory, addLinkToHistory, categories, userAccount, totalQuotes, upgradeToPro } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [viewState, setViewState] = useState<ViewState>('input');
  const [mode, setMode] = useState<'upload' | 'link' | 'manual'>('upload');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState('');
  
  // Manual Entry State
  const [manualCategory, setManualCategory] = useState<string>('Motivation');
  const [manualTitle, setManualTitle] = useState('');
  const [manualQuote, setManualQuote] = useState('');
  
  // Staging state
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [sourceLink, setSourceLink] = useState<string>('');
  const [savedId, setSavedId] = useState<string | null>(null);

  const reset = () => {
    setViewState('input');
    setResult(null);
    setSourceLink('');
    setLinkInput('');
    setManualTitle('');
    setManualQuote('');
    setManualCategory(categories[0]?.id || 'Other');
    setErrorMsg(null);
    setSavedId(null);
  };

  const checkLimit = (newCount: number) => {
    if (!userAccount.isPremium && (totalQuotes + newCount) > FREE_QUOTE_LIMIT) {
        setViewState('upgrade');
        return false;
    }
    return true;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      setViewState('processing');
      setErrorMsg(null);
      
      try {
        const availableCategoryIds = categories.map(c => c.id);
        const data = await geminiService.processImages(files, availableCategoryIds);
        setResult(data);
        setViewState('review');
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to process images.");
        setViewState('failure');
      }
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput) return;
    setSourceLink(linkInput);
    addLinkToHistory(linkInput);
    setViewState('processing');
    setErrorMsg(null);

    setTimeout(() => {
        const demoCat = categories.find(c => c.id === 'Motivation') ? 'Motivation' : categories[0].id;
        const mockResult: ProcessedResult = {
            category: demoCat,
            subCategoryTitle: 'Viral Wisdom (Demo)',
            quotes: [
                "Discipline is choosing between what you want now and what you want most.",
                "Your direction is more important than your speed.",
                "The magic you're looking for is in the work you're avoiding."
            ]
        };
        setResult(mockResult);
        setViewState('review');
    }, 2500);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualQuote) return;
    const data: ProcessedResult = {
        category: manualCategory,
        subCategoryTitle: manualTitle,
        quotes: [manualQuote]
    };
    setResult(data);
    setViewState('review');
  };

  const handleSave = () => {
    if (!result) return;
    if (!checkLimit(result.quotes.length)) return;
    
    const newId = uuidv4();
    const newSubCategory: SubCategory = {
      id: newId,
      title: result.subCategoryTitle,
      categoryId: result.category,
      createdAt: Date.now(),
      quotes: result.quotes.map(text => ({
        id: uuidv4(),
        text,
        sourceLink: sourceLink || undefined,
        createdAt: Date.now()
      }))
    };

    addSubCategory(newSubCategory);
    setSavedId(newId);
    setViewState('success');
  };

  const handleUpgrade = () => {
    upgradeToPro();
    setViewState('review'); // Return to review to allow saving
  };

  // --- Views ---

  if (viewState === 'upgrade') {
    return (
      <div className="h-screen bg-slate-950 flex flex-col p-6 text-white overflow-y-auto no-scrollbar animate-fade-in">
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-violet-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/20 animate-bounce-short">
                <Crown size={54} strokeWidth={2.5} />
            </div>
            
            <div className="space-y-3 px-4">
                <h2 className="text-3xl font-extrabold tracking-tight">Vault Pro</h2>
                <p className="text-slate-400 text-lg">You've reached the free limit of {FREE_QUOTE_LIMIT} quotes.</p>
            </div>

            <div className="w-full space-y-4 pt-6 max-w-xs">
                <div className="flex items-start gap-4 text-left">
                    <div className="bg-amber-500/20 p-1 rounded-full text-amber-500"><Check size={18} strokeWidth={3} /></div>
                    <div>
                        <p className="font-bold">Unlimited Storage</p>
                        <p className="text-sm text-slate-400">Save thousands of collections and lines.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 text-left">
                    <div className="bg-amber-500/20 p-1 rounded-full text-amber-500"><Check size={18} strokeWidth={3} /></div>
                    <div>
                        <p className="font-bold">Priority AI Processing</p>
                        <p className="text-sm text-slate-400">Faster analysis and smarter categorization.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 text-left">
                    <div className="bg-amber-500/20 p-1 rounded-full text-amber-500"><Check size={18} strokeWidth={3} /></div>
                    <div>
                        <p className="font-bold">Pro Badge</p>
                        <p className="text-sm text-slate-400">Show your status in the vault.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-3 pb-8">
            <button 
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 py-4 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all flex flex-col items-center leading-tight"
            >
                <span>Upgrade for $3.99/mo</span>
                <span className="text-xs opacity-70">Cancel anytime.</span>
            </button>
            <button 
                onClick={reset}
                className="w-full text-slate-500 py-2 text-sm font-medium hover:text-white transition-colors"
            >
                Maybe Later
            </button>
        </div>
      </div>
    );
  }

  if (viewState === 'processing') {
    return (
      <div className="h-screen bg-brand-600 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 relative">
          <Loader2 className="animate-spin text-white" size={40} />
          <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse"></div>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {mode === 'link' ? 'Processing Link...' : 'Analyzing Images...'}
        </h2>
        <p className="text-brand-100 mb-8 max-w-xs mx-auto">
          Extracting text, categorizing content, and generating titles.
        </p>
        <button 
          onClick={reset}
          className="px-6 py-2 border border-white/30 rounded-full text-sm font-medium hover:bg-white/10 transition-colors active:scale-95"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (viewState === 'success') {
    return (
      <div className="h-screen bg-brand-600 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-brand-600 mb-6 shadow-xl animate-bounce-short">
          <Check size={48} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Quote Added!</h2>
        <p className="text-brand-100 mb-10 max-w-xs mx-auto text-lg">
          Your new collection has been successfully saved to the vault.
        </p>
        
        <div className="w-full max-w-sm space-y-3">
          <button 
            onClick={() => navigate(`/subcategory/${savedId}`)}
            className="w-full bg-white text-brand-700 py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            View New Quotes <ArrowRight size={20} />
          </button>
          <button 
            onClick={reset}
            className="w-full bg-brand-700 text-white py-4 rounded-xl font-semibold shadow-inner active:scale-[0.98] transition-all"
          >
            Add Another
          </button>
          <button 
            onClick={() => navigate('/')}
            className="text-brand-200 text-sm font-medium py-4 hover:text-white transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (viewState === 'failure') {
    const isLinkFailure = mode === 'link';
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center animate-fade-in">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border shadow-xl ${
            isLinkFailure 
            ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-amber-900/20' 
            : 'bg-red-500/20 text-red-200 border-red-500/50 shadow-red-900/20'
        }`}>
          {isLinkFailure ? <ImageIcon size={36} /> : <AlertCircle size={36} />}
        </div>
        <h2 className="text-2xl font-bold mb-3">{isLinkFailure ? 'Screenshots Required' : 'Processing Failed'}</h2>
        <p className="text-slate-300 mb-8 max-w-xs mx-auto leading-relaxed text-sm">{errorMsg || "Something went wrong while processing your content."}</p>
        <div className="w-full max-w-sm space-y-3">
          <button onClick={reset} className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-slate-50"><RefreshCw size={20} /> Try Again</button>
          <button onClick={() => navigate('/')} className={`w-full py-3 rounded-xl font-medium transition-colors ${isLinkFailure ? 'text-slate-400 hover:text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'}`}>Go to Home</button>
        </div>
      </div>
    );
  }

  if (viewState === 'review' && result) {
    return (
      <Layout title="Review Content" showBack>
        <div className="space-y-6">
          {mode === 'link' && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-3">
               <div className="bg-amber-500/20 p-1.5 rounded-lg text-amber-600 mt-0.5"><Wand2 size={16} /></div>
               <div className="text-xs text-amber-800 dark:text-amber-200">
                 <span className="font-bold block mb-0.5">Demo Simulation Active</span>
                 Actual link scraping is disabled in this demo environment. We've generated example content.
               </div>
            </div>
          )}

          <div className="bg-skin-card p-5 rounded-2xl shadow-sm border border-skin-border">
            <h3 className="text-xs font-bold text-skin-muted uppercase tracking-wider mb-3">Classification</h3>
            <div className="grid gap-4">
              <div>
                <label className="text-xs text-skin-muted block mb-1">Category</label>
                <div className="relative">
                  <select 
                    value={result.category}
                    onChange={(e) => setResult({...result, category: e.target.value})}
                    className="w-full appearance-none bg-skin-hover text-skin-text font-bold text-lg p-3 rounded-xl border border-skin-border outline-none focus:border-brand-500 transition-colors"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-skin-muted block mb-1">Collection Title</label>
                <input 
                  value={result.subCategoryTitle}
                  onChange={(e) => setResult({...result, subCategoryTitle: e.target.value})}
                  className="w-full font-semibold text-skin-text bg-transparent border-b-2 border-skin-border focus:border-brand-500 outline-none py-1 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-skin-muted uppercase tracking-wider">Extracted Quotes ({result.quotes.length})</h3>
                <button 
                    onClick={() => setResult({...result, quotes: [...result.quotes, ""]})}
                    className="text-xs text-brand-600 font-bold hover:underline bg-brand-500/10 px-2 py-1 rounded-md active:scale-95 transition-all"
                >
                    + Add
                </button>
            </div>
            {result.quotes.map((quote, idx) => (
              <div key={idx} className="bg-skin-card p-4 rounded-xl border border-skin-border text-skin-text text-sm flex gap-3 shadow-sm group focus-within:ring-2 focus-within:ring-brand-500/40 transition-all">
                <textarea 
                  value={quote}
                  onChange={(e) => {
                    const newQuotes = [...result.quotes];
                    newQuotes[idx] = e.target.value;
                    setResult({...result, quotes: newQuotes});
                  }}
                  className="w-full resize-none outline-none bg-transparent leading-relaxed placeholder-skin-muted"
                  rows={3}
                  placeholder="Enter quote text..."
                />
                <button 
                  onClick={() => {
                     const newQuotes = result.quotes.filter((_, i) => i !== idx);
                     setResult({...result, quotes: newQuotes});
                  }}
                  className="text-skin-muted hover:text-red-500 h-fit p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all active:scale-90"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-3">
            {!userAccount.isPremium && (
                <div className="bg-amber-500/10 p-3 rounded-xl flex items-center justify-between border border-amber-500/20">
                    <div className="flex items-center gap-2">
                        <Crown size={16} className="text-amber-500" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-200">
                            Usage: {totalQuotes}/{FREE_QUOTE_LIMIT} quotes
                        </span>
                    </div>
                    <span className="text-[10px] text-amber-600 font-black uppercase">Free Tier</span>
                </div>
            )}
            
            <button
                onClick={handleSave}
                className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <Check size={20} /> Save to Vault
            </button>
            
            <button
                onClick={reset}
                className="w-full text-skin-muted py-3 font-medium hover:text-skin-text active:scale-[0.98] transition-all"
            >
                Discard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Input View
  return (
    <Layout title="Add Content">
      <div className="space-y-8 mt-2">
        <div className="bg-skin-card p-1.5 rounded-xl flex font-medium border border-skin-border shadow-sm">
          <button className={`flex-1 py-2.5 rounded-lg text-sm transition-all duration-200 active:scale-95 ${mode === 'upload' ? 'bg-skin-hover shadow-sm text-brand-600 font-bold border border-skin-border' : 'text-skin-muted hover:text-skin-text'}`} onClick={() => setMode('upload')}>Upload</button>
          <button className={`flex-1 py-2.5 rounded-lg text-sm transition-all duration-200 active:scale-95 ${mode === 'link' ? 'bg-skin-hover shadow-sm text-brand-600 font-bold border border-skin-border' : 'text-skin-muted hover:text-skin-text'}`} onClick={() => setMode('link')}>Link</button>
          <button className={`flex-1 py-2.5 rounded-lg text-sm transition-all duration-200 active:scale-95 ${mode === 'manual' ? 'bg-skin-hover shadow-sm text-brand-600 font-bold border border-skin-border' : 'text-skin-muted hover:text-skin-text'}`} onClick={() => setMode('manual')}>Manual</button>
        </div>

        {mode === 'upload' && (
          <div className="group bg-skin-card border-2 border-dashed border-skin-border rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-6 hover:border-brand-500/50 hover:bg-skin-hover transition-all active:scale-[0.99] cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <div className="w-20 h-20 bg-skin-base rounded-full flex items-center justify-center text-skin-muted group-hover:bg-brand-500/10 group-hover:text-brand-600 transition-colors"><ImageIcon size={40} /></div>
            <div><p className="font-bold text-skin-text text-lg group-hover:text-brand-600">Upload Screenshots</p><p className="text-sm text-skin-muted mt-2">Select images from your TikTok or Instagram carousel.</p></div>
          </div>
        )}
        
        {mode === 'link' && (
          <form onSubmit={handleLinkSubmit} className="space-y-6">
            <div className="bg-skin-card border border-skin-border rounded-2xl p-6 shadow-sm focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500/50 transition-all">
              <label className="block text-xs font-bold text-skin-muted uppercase tracking-wider mb-3">Paste Link</label>
              <div className="flex gap-2"><input type="url" placeholder="https://tiktok.com/..." className="flex-1 bg-transparent text-skin-text placeholder:text-skin-muted outline-none font-medium text-lg" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} autoFocus /></div>
            </div>
            <button type="submit" disabled={!linkInput} className="w-full bg-brand-600 disabled:bg-skin-border disabled:text-skin-muted text-white py-4 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"><LinkIcon size={22} />Process Link</button>
          </form>
        )}

        {mode === 'manual' && (
           <form onSubmit={handleManualSubmit} className="space-y-5 animate-fade-in">
             <div className="bg-skin-card p-5 rounded-2xl border border-skin-border space-y-4 shadow-sm">
                <div>
                  <label className="text-xs font-bold text-skin-muted uppercase tracking-wider block mb-2">Category</label>
                  <select value={manualCategory} onChange={(e) => setManualCategory(e.target.value)} className="w-full bg-skin-base p-3 rounded-xl border border-skin-border outline-none focus:border-brand-500 transition-colors text-skin-text">
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-skin-muted uppercase tracking-wider block mb-2">Collection Title</label>
                  <input type="text" placeholder="e.g. Gym Motivation" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} className="w-full bg-skin-base p-3 rounded-xl border border-skin-border outline-none focus:border-brand-500 transition-colors text-skin-text" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-skin-muted uppercase tracking-wider block mb-2">Quote</label>
                  <textarea placeholder="Type your quote here..." rows={4} value={manualQuote} onChange={(e) => setManualQuote(e.target.value)} className="w-full bg-skin-base p-3 rounded-xl border border-skin-border outline-none focus:border-brand-500 transition-colors text-skin-text resize-none" required />
                </div>
             </div>
             <button type="submit" disabled={!manualTitle || !manualQuote} className="w-full bg-brand-600 disabled:bg-skin-border disabled:text-skin-muted text-white py-4 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"><PenTool size={20} />Create Quote</button>
           </form>
        )}
      </div>
    </Layout>
  );
};