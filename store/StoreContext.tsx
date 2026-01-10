import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SubCategory, Quote, UserAccount, LinkHistoryItem, Category } from '../types';
import { geminiService } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface StoreContextType {
  subCategories: SubCategory[];
  userAccount: UserAccount;
  linkHistory: LinkHistoryItem[];
  categories: Category[];
  addSubCategory: (subCategory: SubCategory) => void;
  updateSubCategory: (id: string, updates: Partial<SubCategory>) => void;
  deleteSubCategory: (id: string) => void;
  addQuoteToSubCategory: (subCategoryId: string, text: string) => void;
  updateQuote: (subCategoryId: string, quoteId: string, text: string) => void;
  deleteQuote: (subCategoryId: string, quoteId: string) => void;
  getRecentQuotes: (limit?: number) => Quote[];
  searchQuotes: (query: string) => { quote: Quote; subCategoryTitle: string }[];
  searchQuotesByIntent: (query: string) => Promise<{ quote: Quote; subCategoryTitle: string }[]>;
  claimDailyReward: () => boolean; // Returns true if successful
  addLinkToHistory: (url: string) => void;
  deleteLinkFromHistory: (id: string) => void;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => void;
  togglePinCategory: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'quotevault_data_v1';
const ACCOUNT_KEY = 'quotevault_account_v1';
const HISTORY_KEY = 'quotevault_link_history_v1';
const CATEGORIES_KEY = 'quotevault_categories_v1';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'Mindset', label: 'Mindset', theme: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20', icon: 'Brain', isDefault: true },
  { id: 'Motivation', label: 'Motivation', theme: 'bg-amber-500/10 text-amber-500 border border-amber-500/20', icon: 'Zap', isDefault: true },
  { id: 'Confidence', label: 'Confidence', theme: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20', icon: 'Star', isDefault: true },
  { id: 'Relationships', label: 'Relationships', theme: 'bg-violet-500/10 text-violet-500 border border-violet-500/20', icon: 'User', isDefault: true },
  { id: 'Flirty', label: 'Flirty', theme: 'bg-rose-500/10 text-rose-500 border border-rose-500/20', icon: 'Heart', isDefault: true },
  { id: 'Other', label: 'Other', theme: 'bg-skin-hover text-skin-muted border border-skin-border', icon: 'Grid', isDefault: true },
];

const THEME_PRESETS = [
  'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  'bg-pink-500/10 text-pink-500 border border-pink-500/20',
  'bg-purple-500/10 text-purple-500 border border-purple-500/20',
  'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
  'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20',
  'bg-orange-500/10 text-orange-500 border border-orange-500/20',
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [userAccount, setUserAccount] = useState<UserAccount>({ credits: 0, lastDailyClaim: null, streak: 0 });
  const [linkHistory, setLinkHistory] = useState<LinkHistoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedAccount = localStorage.getItem(ACCOUNT_KEY);
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      const savedCategories = localStorage.getItem(CATEGORIES_KEY);

      if (savedData) setSubCategories(JSON.parse(savedData));
      if (savedAccount) setUserAccount(JSON.parse(savedAccount));
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else {
        // If no categories saved, use default but ensure 'Other' is there
        setCategories(DEFAULT_CATEGORIES);
      }
      
      if (savedHistory) {
        // Filter out links older than 30 days immediately upon load
        const history: LinkHistoryItem[] = JSON.parse(savedHistory);
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const validHistory = history.filter(item => item.createdAt > thirtyDaysAgo);
        setLinkHistory(validHistory);
      }
    } catch (e) {
      console.error("Failed to parse storage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subCategories));
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(userAccount));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(linkHistory));
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    }
  }, [subCategories, userAccount, linkHistory, categories, isLoaded]);

  // --- Category Management ---
  const addCategory = async (name: string) => {
    if (categories.some(c => c.id.toLowerCase() === name.toLowerCase())) return;
    
    // Optimistic update or waiting? Let's wait for icon
    // Select random theme
    const randomTheme = THEME_PRESETS[Math.floor(Math.random() * THEME_PRESETS.length)];
    
    // Get AI icon suggestion
    let icon = 'Grid';
    try {
        const style = await geminiService.suggestCategoryStyle(name);
        icon = style.icon;
    } catch(e) {
        console.warn("Could not fetch icon");
    }

    const newCategory: Category = {
        id: name,
        label: name,
        theme: randomTheme,
        icon: icon,
        isPinned: false,
        isDefault: false
    };
    
    // Insert before 'Other'
    const otherIndex = categories.findIndex(c => c.id === 'Other');
    if (otherIndex !== -1) {
        const newCats = [...categories];
        newCats.splice(otherIndex, 0, newCategory);
        setCategories(newCats);
    } else {
        setCategories([...categories, newCategory]);
    }
  };

  const deleteCategory = (id: string) => {
    if (id === 'Other') return; // Cannot delete Other
    
    // Remove category
    setCategories(prev => prev.filter(c => c.id !== id));
    
    // Move any subcategories in this category to 'Other'
    setSubCategories(prev => prev.map(sc => {
        if (sc.categoryId === id) {
            return { ...sc, categoryId: 'Other' };
        }
        return sc;
    }));
  };

  const togglePinCategory = (id: string) => {
    setCategories(prev => prev.map(c => {
        if (c.id === id) return { ...c, isPinned: !c.isPinned };
        return c;
    }));
  };

  // --- SubCategory & Quote Logic ---

  const addSubCategory = (subCategory: SubCategory) => {
    setSubCategories(prev => [subCategory, ...prev]);
  };

  const updateSubCategory = (id: string, updates: Partial<SubCategory>) => {
    setSubCategories(prev => prev.map(sc => sc.id === id ? { ...sc, ...updates } : sc));
  };

  const deleteSubCategory = (id: string) => {
    setSubCategories(prev => prev.filter(sc => sc.id !== id));
  };

  const addQuoteToSubCategory = (subCategoryId: string, text: string) => {
    const newQuote: Quote = {
      id: uuidv4(),
      text,
      createdAt: Date.now()
    };
    setSubCategories(prev => prev.map(sc => {
      if (sc.id !== subCategoryId) return sc;
      return { ...sc, quotes: [newQuote, ...sc.quotes] };
    }));
  };

  const updateQuote = (subCategoryId: string, quoteId: string, text: string) => {
    setSubCategories(prev => prev.map(sc => {
      if (sc.id !== subCategoryId) return sc;
      return {
        ...sc,
        quotes: sc.quotes.map(q => q.id === quoteId ? { ...q, text } : q)
      };
    }));
  };

  const deleteQuote = (subCategoryId: string, quoteId: string) => {
    setSubCategories(prev => prev.map(sc => {
      if (sc.id !== subCategoryId) return sc;
      return {
        ...sc,
        quotes: sc.quotes.filter(q => q.id !== quoteId)
      };
    }).filter(sc => sc.quotes.length > 0)); // Remove subcategory if empty
  };

  const getRecentQuotes = (limit = 5): Quote[] => {
    const allQuotes: Quote[] = [];
    subCategories.forEach(sc => allQuotes.push(...sc.quotes));
    return allQuotes.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  };

  const searchQuotes = (query: string) => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const results: { quote: Quote; subCategoryTitle: string }[] = [];

    subCategories.forEach(sc => {
      sc.quotes.forEach(q => {
        if (q.text.toLowerCase().includes(lowerQuery) || sc.title.toLowerCase().includes(lowerQuery)) {
          results.push({ quote: q, subCategoryTitle: sc.title });
        }
      });
    });
    return results;
  };

  const searchQuotesByIntent = async (query: string) => {
    const allQuotes: Quote[] = [];
    subCategories.forEach(sc => allQuotes.push(...sc.quotes));

    if (allQuotes.length === 0) return [];

    try {
      const relevantIds = await geminiService.findRelevantQuotes(query, allQuotes);
      const results: { quote: Quote; subCategoryTitle: string }[] = [];
      
      relevantIds.forEach(id => {
        for (const sc of subCategories) {
          const found = sc.quotes.find(q => q.id === id);
          if (found) {
            results.push({ quote: found, subCategoryTitle: sc.title });
            break;
          }
        }
      });
      return results;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  // --- User Account Logic ---

  const claimDailyReward = (): boolean => {
    const now = Date.now();
    const lastClaim = userAccount.lastDailyClaim || 0;
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Check if 24 hours have passed since start of that day (simplified logic: check if date string is different)
    const lastDate = new Date(lastClaim).toDateString();
    const todayDate = new Date(now).toDateString();

    if (lastDate === todayDate) {
      return false; // Already claimed today
    }

    // Check streak (if last claim was yesterday, increment. Else reset)
    const yesterday = new Date(now - oneDay).toDateString();
    let newStreak = userAccount.streak;
    
    if (lastDate === yesterday) {
        newStreak += 1;
    } else {
        newStreak = 1; // Reset if missed a day or first time
    }

    setUserAccount({
      credits: userAccount.credits + 10, // 10 credits per day
      lastDailyClaim: now,
      streak: newStreak
    });
    return true;
  };

  // --- Link History Logic ---

  const addLinkToHistory = (url: string) => {
    let platform: 'tiktok' | 'instagram' | 'other' = 'other';
    if (url.includes('tiktok.com')) platform = 'tiktok';
    if (url.includes('instagram.com')) platform = 'instagram';

    const newItem: LinkHistoryItem = {
      id: uuidv4(),
      url,
      platform,
      createdAt: Date.now()
    };

    setLinkHistory(prev => [newItem, ...prev]);
  };

  const deleteLinkFromHistory = (id: string) => {
    setLinkHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <StoreContext.Provider value={{ 
      subCategories, 
      userAccount,
      linkHistory,
      categories,
      addSubCategory, 
      updateSubCategory,
      deleteSubCategory, 
      addQuoteToSubCategory,
      updateQuote,
      deleteQuote, 
      getRecentQuotes, 
      searchQuotes, 
      searchQuotesByIntent,
      claimDailyReward,
      addLinkToHistory,
      deleteLinkFromHistory,
      addCategory,
      deleteCategory,
      togglePinCategory
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};