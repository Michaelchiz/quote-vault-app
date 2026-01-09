export type CategoryName = 'Flirty' | 'Motivation' | 'Relationships' | 'Confidence' | 'Mindset' | 'Other';

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
