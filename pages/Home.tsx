import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useStore } from '../store/StoreContext';
import { 
  Heart, Zap, User, Star, Brain, Grid, Settings2, Plus, X, FolderPlus, Pin, 
  Briefcase, Dumbbell, Utensils, Plane, Book, Music, Palette, Leaf, Smartphone, 
  DollarSign, Sun, Moon, Coffee, Smile, Camera, Code, Gamepad, Headphones, 
  Home as HomeIcon, Key, Lock, Map, Rocket, ShoppingCart, Terminal, Truck, 
  Video, Wallet, Watch, Wrench, Laptop, Car, Baby, Dog, Cat, Flower, Loader2
} from 'lucide-react';
import { Category } from '../types';

// Map of available icons for AI to choose from
const ICON_MAP: Record<string, React.ReactNode> = {
    'Heart': <Heart size={20} />,
    'Zap': <Zap size={20} />,
    'User': <User size={20} />,
    'Star': <Star size={20} />,
    'Brain': <Brain size={20} />,
    'Grid': <Grid size={20} />,
    'Briefcase': <Briefcase size={20} />,
    'Dumbbell': <Dumbbell size={20} />,
    'Utensils': <Utensils size={20} />,
    'Plane': <Plane size={20} />,
    'Book': <Book size={20} />,
    'Music': <Music size={20} />,
    'Palette': <Palette size={20} />,
    'Leaf': <Leaf size={20} />,
    'Smartphone': <Smartphone size={20} />,
    'DollarSign': <DollarSign size={20} />,
    'Sun': <Sun size={20} />,
    'Moon': <Moon size={20} />,
    'Coffee': <Coffee size={20} />,
    'Smile': <Smile size={20} />,
    'Camera': <Camera size={20} />,
    'Code': <Code size={20} />,
    'Gamepad': <Gamepad size={20} />,
    'Headphones': <Headphones size={20} />,
    'Home': <HomeIcon size={20} />,
    'Key': <Key size={20} />,
    'Lock': <Lock size={20} />,
    'Map': <Map size={20} />,
    'Rocket': <Rocket size={20} />,
    'ShoppingCart': <ShoppingCart size={20} />,
    'Terminal': <Terminal size={20} />,
    'Truck': <Truck size={20} />,
    'Video': <Video size={20} />,
    'Wallet': <Wallet size={20} />,
    'Watch': <Watch size={20} />,
    'Wrench': <Wrench size={20} />,
    'Laptop': <Laptop size={20} />,
    'Car': <Car size={20} />,
    'Baby': <Baby size={20} />,
    'Dog': <Dog size={20} />,
    'Cat': <Cat size={20} />,
    'Flower': <Flower size={20} />
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { subCategories, categories, deleteCategory, addCategory, togglePinCategory } = useStore();
  const [isManageMode, setIsManageMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingAdd, setIsLoadingAdd] = useState(false);

  const getCount = (cat: string) => subCategories.filter(sc => sc.categoryId === cat).length;

  const handleAdd = async () => {
    if (newCategoryName.trim()) {
        setIsLoadingAdd(true);
        await addCategory(newCategoryName.trim());
        setNewCategoryName('');
        setIsAdding(false);
        setIsLoadingAdd(false);
    }
  };

  const getIcon = (cat: Category) => {
      const iconKey = cat.icon || cat.id; // Fallback to ID for legacy data
      if (ICON_MAP[iconKey]) return ICON_MAP[iconKey];
      if (ICON_MAP[cat.label]) return ICON_MAP[cat.label]; // Try label match
      return <Grid size={20} />;
  };

  // Sorting: Pinned -> Others -> 'Other' (Last)
  const sortedCategories = [...categories].sort((a, b) => {
      if (a.id === 'Other') return 1;
      if (b.id === 'Other') return -1;
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
  });

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
                className="bg-white text-brand-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all hover:bg-brand-50"
            >
                + Add New Quote
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
             <h3 className="text-lg font-bold text-skin-text">Categories</h3>
             <button 
                onClick={() => setIsManageMode(!isManageMode)}
                className={`p-2 rounded-lg transition-all active:scale-90 ${isManageMode ? 'bg-brand-600 text-white' : 'text-skin-muted hover:bg-skin-hover'}`}
                title="Manage Categories"
             >
                <Settings2 size={18} />
             </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {sortedCategories.map((cat) => {
               if (cat.id === 'Other') return null; // Render 'Other' last manually
               
               return (
                <div key={cat.id} className="relative group">
                    <button
                        onClick={() => navigate(`/category/${cat.id}`)}
                        className={`w-full h-full bg-skin-card p-4 rounded-2xl shadow-sm border border-skin-border flex flex-col items-start gap-3 hover:shadow-md hover:border-brand-500/50 transition-all active:scale-[0.98] ${isManageMode ? 'ring-1 ring-brand-200' : ''} ${cat.isPinned ? 'border-brand-500/30 bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
                    >
                        <div className="flex justify-between w-full items-start">
                            <div className={`p-2.5 rounded-xl ${cat.theme}`}>
                                {getIcon(cat)}
                            </div>
                            {cat.isPinned && (
                                <Pin size={14} className="text-brand-500 fill-brand-500 rotate-45" />
                            )}
                        </div>
                        <div className="text-left w-full">
                            <div className="font-semibold text-skin-text text-sm truncate">{cat.label}</div>
                            <div className="text-[10px] font-medium text-skin-muted uppercase tracking-wide mt-0.5">{getCount(cat.id)} collections</div>
                        </div>
                    </button>
                    
                    {/* Pin Button - Visible on Manage Mode or Hover (Desktop) */}
                    {(isManageMode || (!isManageMode && !cat.isDefault)) && (
                        <div className="absolute top-2 right-2 flex gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePinCategory(cat.id);
                                }}
                                className={`p-1.5 rounded-full shadow-sm transition-all active:scale-90 ${
                                    cat.isPinned 
                                    ? 'bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-300' 
                                    : 'bg-skin-card text-skin-muted hover:text-brand-500 border border-skin-border'
                                }`}
                                title={cat.isPinned ? "Unpin" : "Pin to top"}
                            >
                                <Pin size={12} className={cat.isPinned ? "fill-current" : ""} />
                            </button>

                             {isManageMode && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteCategory(cat.id);
                                    }}
                                    className="bg-red-500 text-white p-1.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform"
                                >
                                    <X size={12} strokeWidth={3} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
               );
            })}
            
            {/* Add Category Button - Always Visible */}
            {!isAdding ? (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-skin-card border-2 border-dashed border-skin-border rounded-2xl flex flex-col items-center justify-center gap-2 p-4 min-h-[100px] text-skin-muted hover:border-brand-500 hover:text-brand-600 transition-all active:scale-[0.98]"
                >
                    <Plus size={24} />
                    <span className="text-xs font-bold">Add Category</span>
                </button>
            ) : (
                <div className="bg-skin-card border border-brand-500 rounded-2xl p-3 flex flex-col justify-between min-h-[100px] animate-fade-in shadow-lg">
                    <div className="flex items-center gap-2 mb-2 text-brand-600">
                            <FolderPlus size={18} />
                            <span className="text-xs font-bold">New Category</span>
                    </div>
                    {isLoadingAdd ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-brand-500 gap-1">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-[10px]">Finding Icon...</span>
                        </div>
                    ) : (
                        <>
                            <input 
                                autoFocus
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Name..."
                                className="w-full text-sm bg-skin-hover p-1.5 rounded-md outline-none mb-2"
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setIsAdding(false)} className="flex-1 bg-skin-hover text-skin-muted py-1.5 rounded text-xs font-bold active:scale-95 transition-transform">Cancel</button>
                                <button onClick={handleAdd} disabled={!newCategoryName} className="flex-1 bg-brand-600 text-white py-1.5 rounded text-xs font-bold disabled:opacity-50 active:scale-95 transition-transform">Add</button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Render Other Last */}
            {categories.filter(c => c.id === 'Other').map(cat => (
                <div key={cat.id} className="relative group">
                    <button
                        onClick={() => navigate(`/category/${cat.id}`)}
                        className={`w-full h-full bg-skin-card p-4 rounded-2xl shadow-sm border border-skin-border flex flex-col items-start gap-3 hover:shadow-md hover:border-brand-500/50 transition-all active:scale-[0.98] ${isManageMode ? 'ring-1 ring-brand-200 opacity-60' : ''}`}
                    >
                        <div className={`p-2.5 rounded-xl ${cat.theme}`}>
                            {getIcon(cat)}
                        </div>
                        <div className="text-left w-full">
                            <div className="font-semibold text-skin-text text-sm truncate">{cat.label}</div>
                            <div className="text-[10px] font-medium text-skin-muted uppercase tracking-wide mt-0.5">{getCount(cat.id)} collections</div>
                        </div>
                    </button>
                </div>
            ))}
          </div>
          
          {isManageMode && (
              <p className="text-[10px] text-skin-muted text-center mt-4 bg-yellow-500/10 text-yellow-600 p-2 rounded-lg border border-yellow-500/20">
                  Deleting a category will move its quotes to "Other".
              </p>
          )}
        </section>

        {/* Recent Collections */}
        {subCategories.length > 0 && !isManageMode && (
          <section>
            <h3 className="text-lg font-bold text-skin-text mb-4 px-1">Recent Collections</h3>
            <div className="space-y-3">
              {subCategories.slice(0, 3).map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => navigate(`/subcategory/${sc.id}`)}
                  className="w-full bg-skin-card p-4 rounded-2xl shadow-sm border border-skin-border flex items-center justify-between hover:border-brand-500/50 transition-all active:scale-[0.98]"
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