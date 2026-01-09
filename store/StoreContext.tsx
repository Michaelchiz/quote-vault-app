import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SubCategory, Quote, CategoryName } from '../types';
import { geminiService } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface StoreContextType {
  subCategories: SubCategory[];
  addSubCategory: (subCategory: SubCategory) => void;
  updateSubCategory: (id: string, updates: Partial<SubCategory>) => void;
  deleteSubCategory: (id: string) => void;
  addQuoteToSubCategory: (subCategoryId: string, text: string) => void;
  updateQuote: (subCategoryId: string, quoteId: string, text: string) => void;
  deleteQuote: (subCategoryId: string, quoteId: string) => void;
  getRecentQuotes: (limit?: number) => Quote[];
  searchQuotes: (query: string) => { quote: Quote; subCategoryTitle: string }[];
  searchQuotesByIntent: (query: string) => Promise<{ quote: Quote; subCategoryTitle: string }[]>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'quotevault_data_v1';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSubCategories(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subCategories));
    }
  }, [subCategories, isLoaded]);

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
    // Flatten all quotes, sort by createdAt desc
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
      
      // Preserve ranking order from AI
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

  return (
    <StoreContext.Provider value={{ 
      subCategories, 
      addSubCategory, 
      updateSubCategory,
      deleteSubCategory, 
      addQuoteToSubCategory,
      updateQuote,
      deleteQuote, 
      getRecentQuotes, 
      searchQuotes, 
      searchQuotesByIntent 
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