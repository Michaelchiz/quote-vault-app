import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SubCategory, Quote, CategoryName, UserAccount, LinkHistoryItem } from '../types';
import { geminiService } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface StoreContextType {
  subCategories: SubCategory[];
  userAccount: UserAccount;
  linkHistory: LinkHistoryItem[];
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'quotevault_data_v1';
const ACCOUNT_KEY = 'quotevault_account_v1';
const HISTORY_KEY = 'quotevault_link_history_v1';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [userAccount, setUserAccount] = useState<UserAccount>({ credits: 0, lastDailyClaim: null, streak: 0 });
  const [linkHistory, setLinkHistory] = useState<LinkHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedAccount = localStorage.getItem(ACCOUNT_KEY);
      const savedHistory = localStorage.getItem(HISTORY_KEY);

      if (savedData) setSubCategories(JSON.parse(savedData));
      if (savedAccount) setUserAccount(JSON.parse(savedAccount));
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
    }
  }, [subCategories, userAccount, linkHistory, isLoaded]);

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
      deleteLinkFromHistory
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