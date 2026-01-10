
export type CategoryName = string;

export interface Category {
  id: string; // Effectively the name, e.g., 'Motivation'
  label: string;
  theme: string; // Tailwind classes for colors
  icon?: string; // Key for the icon component
  isPinned?: boolean;
  isDefault?: boolean;
}

export interface Quote {
  id: string;
  text: string;
  sourceLink?: string; // The original TikTok link
  createdAt: number;
}

export interface SubCategory {
  id: string;
  title: string; // Generated title
  categoryId: CategoryName;
  quotes: Quote[];
  createdAt: number;
}

export interface ProcessedResult {
  category: CategoryName;
  subCategoryTitle: string;
  quotes: string[];
}

export interface LinkHistoryItem {
  id: string;
  url: string;
  platform: 'tiktok' | 'instagram' | 'other';
  createdAt: number;
}

export interface UserAccount {
  credits: number;
  lastDailyClaim: number | null; // Timestamp of last claim
  streak: number;
}
