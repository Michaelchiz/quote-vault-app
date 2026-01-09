import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useStore } from '../store/StoreContext';
import { CategoryName } from '../types';
import { Heart, Zap, User, Star, Brain, Grid } from 'lucide-react';

const CATEGORIES: { id: CategoryName; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'Flirty', label: 'Flirty', icon: <Heart size={20} />, color: 'bg-rose-500/10 text-rose-500 border border-rose-500/20' },
  { id: 'Motivation', label: 'Motivation', icon: <Zap size={20} />, color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' },
  { id: 'Relationships', label: 'Relationships', icon: <User size={20} />, color: 'bg-violet-500/10 text-violet-500 border border-violet-500/20' },
  { id: 'Confidence', label: 'Confidence', icon: <Star size={20} />, color: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' },
  { id: 'Mindset', label: 'Mindset', icon: <Brain size={20} />, color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' },
  { id: 'Other', label: 'Other', icon: <Grid size={20} />, color: 'bg-skin-hover text-skin-muted border border-skin-border' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { subCategories } = useStore();

  const getCount = (cat: CategoryName) => subCategories.filter(sc => sc.categoryId === cat).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Intro */}
        <div className="bg-brand-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full -mr-8 -mt-8 blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2 tracking-tight">My Vault</h2>
            <p className="opacity-90 text-sm mb-6 font-medium text-brand-50">
                Turn TikTok screenshots into searchable wisdom.
            </p>
            <button 
                onClick={() => navigate('/add')}
                className="bg-white text-brand-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform hover:bg-brand-50"
            >
                + Add New Quote
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <section>
          <h3 className="text-lg font-bold text-skin-text mb-4 px-1">Categories</h3>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${cat.id}`)}
                className="bg-skin-card p-4 rounded-2xl shadow-sm border border-skin-border flex flex-col items-start gap-3 hover:shadow-md hover:border-brand-500/50 transition-all active:scale-[0.98]"
              >
                <div className={`p-2.5 rounded-xl ${cat.color}`}>
                  {cat.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-skin-text text-sm">{cat.label}</div>
                  <div className="text-[10px] font-medium text-skin-muted uppercase tracking-wide mt-0.5">{getCount(cat.id)} collections</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Collections */}
        {subCategories.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-skin-text mb-4 px-1">Recent Collections</h3>
            <div className="space-y-3">
              {subCategories.slice(0, 3).map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => navigate(`/subcategory/${sc.id}`)}
                  className="w-full bg-skin-card p-4 rounded-2xl shadow-sm border border-skin-border flex items-center justify-between hover:border-brand-500/50 transition-colors"
                >
                  <div className="text-left">
                    <h4 className="font-semibold text-skin-text text-sm">{sc.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-skin-hover text-skin-muted px-1.5 py-0.5 rounded-md font-medium border border-skin-border">{sc.categoryId}</span>
                        <span className="text-[10px] text-skin-muted">{sc.quotes.length} quotes</span>
                    </div>
                  </div>
                  <div className="text-skin-muted">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};