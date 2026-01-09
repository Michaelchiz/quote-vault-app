import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useStore } from '../store/StoreContext';
import { Search as SearchIcon, Sparkles, Copy, CheckCircle2, Loader2, Info } from 'lucide-react';
import { Quote } from '../types';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const { searchQuotes, searchQuotesByIntent } = useStore();
  const [query, setQuery] = useState('');
  
  // AI Search State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<{ quote: Quote; subCategoryTitle: string }[] | null>(null);
  const [aiError, setAiError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Standard Keyword Results (filtered out if AI results are showing to avoid clutter, or shown below)
  const keywordResults = searchQuotes(query);

  const handleAiSearch = async () => {
    if (!query.trim()) return;
    setIsAiLoading(true);
    setAiResults(null);
    setAiError(false);

    try {
      const matches = await searchQuotesByIntent(query);
      if (matches.length > 0) {
        setAiResults(matches);
      } else {
        setAiError(true); // No matches found by AI
      }
    } catch (e) {
      setAiError(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopy = (text: string, quoteId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(quoteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAiSearch();
    }
  };

  return (
    <Layout title="Search">
      <div className="space-y-6">
        <div className="relative group">
          <input
            type="text"
            placeholder="Describe a situation or type keywords..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // Clear AI results when typing changes significantly, or keep them? 
              // Let's keep them until manual clear or new search for stability.
              if (e.target.value === '') {
                setAiResults(null);
                setAiError(false);
              }
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-skin-card text-skin-text pl-11 pr-14 py-3.5 rounded-xl border border-skin-border shadow-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-skin-muted"
            autoFocus
          />
          <SearchIcon className="absolute left-4 top-3.5 text-skin-muted" size={20} />
          
          <button 
            onClick={handleAiSearch}
            disabled={!query.trim() || isAiLoading}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 disabled:opacity-50 disabled:bg-transparent disabled:text-skin-muted transition-colors"
            title="AI Search"
          >
            {isAiLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Sparkles size={20} className={query.trim() ? "fill-brand-200" : ""} />
            )}
          </button>
        </div>

        {/* AI Intent Search Results */}
        {(aiResults || isAiLoading || aiError) && (
            <div className="animate-fade-in space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Sparkles size={16} className="text-brand-600 fill-brand-200" />
                    <h3 className="text-xs font-bold text-skin-muted uppercase tracking-wider">
                        {isAiLoading ? 'Analyzing Intent...' : 'AI Recommendations'}
                    </h3>
                </div>

                {isAiLoading && (
                    <div className="space-y-3 opacity-50">
                        {[1, 2].map(i => (
                            <div key={i} className="h-24 bg-skin-card rounded-xl animate-pulse border border-skin-border"></div>
                        ))}
                    </div>
                )}

                {!isAiLoading && aiError && (
                    <div className="bg-skin-card p-4 rounded-xl border border-skin-border text-center text-sm text-skin-muted">
                        Could not find specific quotes for this situation. Try the keyword results below.
                    </div>
                )}

                {!isAiLoading && aiResults && aiResults.map((item, idx) => (
                    <div 
                        key={`ai-${idx}`}
                        className="bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-skin-card p-5 rounded-xl border border-brand-200 dark:border-brand-800 shadow-sm relative group"
                    >
                        <p className="text-skin-text font-medium text-lg mb-3 pr-6">"{item.quote.text}"</p>
                        <div className="flex items-center justify-between border-t border-brand-100 dark:border-brand-800/50 pt-3">
                            <span className="text-xs font-bold text-brand-600 uppercase tracking-wide">{item.subCategoryTitle}</span>
                            <button 
                                onClick={() => handleCopy(item.quote.text, item.quote.id)}
                                className={`p-2 rounded-lg transition-all ${
                                copiedId === item.quote.id 
                                    ? 'bg-green-500/10 text-green-600' 
                                    : 'text-brand-400 hover:text-brand-600 hover:bg-brand-100'
                                }`}
                            >
                                {copiedId === item.quote.id ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Keyword Results Divider */}
        {aiResults && keywordResults.length > 0 && (
             <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-skin-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-skin-base text-xs text-skin-muted">Keyword Matches</span>
                </div>
             </div>
        )}

        {/* Keyword Results */}
        {!isAiLoading && (!aiResults || keywordResults.length > 0) && (
            <div className="space-y-3">
            {!aiResults && query.trim() !== '' && keywordResults.length > 0 && (
                <div className="px-1 flex items-center gap-2">
                     <SearchIcon size={14} className="text-skin-muted" />
                     <h3 className="text-xs font-bold text-skin-muted uppercase tracking-wider">Text Matches</h3>
                </div>
            )}
            
            {query.trim() === '' ? (
                !aiResults && (
                    <div className="flex flex-col items-center justify-center py-16 text-skin-muted space-y-4">
                        <div className="w-16 h-16 bg-skin-card rounded-full flex items-center justify-center shadow-sm">
                            <Sparkles size={32} className="text-brand-300" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-medium text-skin-text">Type a vibe or situation</p>
                            <p className="text-xs">e.g. "She replied late and said sorry"</p>
                        </div>
                    </div>
                )
            ) : keywordResults.length === 0 && !aiResults ? (
                <div className="text-center text-skin-muted py-12 text-sm">
                    No text matches. Try clicking the <Sparkles size={14} className="inline text-brand-500" /> button for an AI search.
                </div>
            ) : (
                keywordResults.map((item, idx) => (
                <div 
                    key={`kw-${idx}`}
                    className="bg-skin-card p-4 rounded-xl border border-skin-border shadow-sm hover:border-skin-muted transition-colors"
                >
                    <p className="text-skin-text font-medium mb-2 line-clamp-3">"{item.quote.text}"</p>
                    <div className="flex items-center justify-between text-xs text-skin-muted border-t border-skin-border pt-2">
                    <span className="font-semibold text-skin-text opacity-70">{item.subCategoryTitle}</span>
                    <button 
                        onClick={() => handleCopy(item.quote.text, item.quote.id)}
                        className={`flex items-center gap-1 hover:text-skin-text transition-colors ${copiedId === item.quote.id ? 'text-green-600' : ''}`}
                    >
                        {copiedId === item.quote.id ? (
                           <>Copied <CheckCircle2 size={12} /></>
                        ) : (
                           <>Copy <Copy size={12} /></>
                        )}
                    </button>
                    </div>
                </div>
                ))
            )}
            </div>
        )}
      </div>
    </Layout>
  );
};