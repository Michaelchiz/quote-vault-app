import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useStore } from '../store/StoreContext';
import { CategoryName } from '../types';
import { FolderOpen } from 'lucide-react';

export const CategoryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subCategories } = useStore();
  
  const categoryId = id as CategoryName;
  const items = subCategories.filter(sc => sc.categoryId === categoryId);

  return (
    <Layout showBack title={categoryId}>
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-skin-muted">
            <FolderOpen size={48} className="mb-4 opacity-50" />
            <p className="text-sm">No collections yet.</p>
            <button 
              onClick={() => navigate('/add')}
              className="mt-4 text-brand-600 font-medium text-sm hover:underline"
            >
              Create one now
            </button>
          </div>
        ) : (
          items.map((sc) => (
            <button
              key={sc.id}
              onClick={() => navigate(`/subcategory/${sc.id}`)}
              className="w-full bg-skin-card p-4 rounded-xl shadow-sm border border-skin-border flex items-center justify-between group active:scale-[0.99] transition-transform hover:border-brand-500/30"
            >
              <div className="text-left">
                <h3 className="font-semibold text-skin-text group-hover:text-brand-600 transition-colors">{sc.title}</h3>
                <p className="text-xs text-skin-muted mt-1">{sc.quotes.length} quotes • {new Date(sc.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-skin-hover flex items-center justify-center text-skin-muted group-hover:bg-brand-500/10 group-hover:text-brand-600 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </button>
          ))
        )}
      </div>
    </Layout>
  );
};