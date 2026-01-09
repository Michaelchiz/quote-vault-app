import React, { useState } from 'react';
import { Home as HomeIcon, PlusSquare, Search, ArrowLeft, Menu, X, User, Info, Star, Globe, MessageSquare, Mail, FileText, Shield, Palette, Check, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme, Theme } from '../store/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  title?: string;
  headerAction?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, showBack, title, headerAction }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const menuItems = [
    { icon: <User size={20} />, label: 'My Account', path: '/' }, // Redirects home for MVP
    { icon: <Info size={20} />, label: 'About QuoteVault', path: '/about' },
    { icon: <Star size={20} />, label: 'Rate Us', path: '/settings/rate' },
    { icon: <Globe size={20} />, label: 'Language', path: '/settings/language' },
    { icon: <MessageSquare size={20} />, label: 'Feedback', path: '/settings/feedback' },
    { icon: <Mail size={20} />, label: 'Contact Us', path: '/settings/contact' },
    { icon: <FileText size={20} />, label: 'Terms of Service', path: '/settings/terms' },
    { icon: <Shield size={20} />, label: 'Privacy Policy', path: '/settings/privacy' },
  ];

  const themes: { id: Theme; label: string; color: string }[] = [
    { id: 'light', label: 'Default (Light)', color: 'bg-slate-100 border-slate-300' },
    { id: 'dark', label: 'Dark Mode', color: 'bg-slate-900 border-slate-700' },
    { id: 'green', label: 'Forest', color: 'bg-emerald-100 border-emerald-300' },
    { id: 'blue', label: 'Ocean', color: 'bg-blue-100 border-blue-300' },
  ];

  return (
    <div className="flex flex-col h-screen bg-skin-base text-skin-text overflow-hidden font-sans transition-colors duration-300">
      
      {/* Slide-out Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="relative w-72 bg-skin-card h-full shadow-2xl flex flex-col animate-slide-in-left border-r border-skin-border">
            {/* Menu Header */}
            <div className="p-6 border-b border-skin-border flex items-center justify-between">
               <h2 className="text-xl font-bold text-skin-text tracking-tight">Menu</h2>
               <button onClick={() => setIsMenuOpen(false)} className="text-skin-muted hover:text-skin-text">
                 <X size={24} />
               </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
               {menuItems.map((item, idx) => (
                 <button
                   key={idx}
                   onClick={() => handleMenuClick(item.path)}
                   className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-skin-hover text-skin-text transition-colors text-sm font-medium group"
                 >
                   <div className="flex items-center gap-3">
                     <span className="text-brand-500">{item.icon}</span>
                     {item.label}
                   </div>
                   <ChevronRight size={16} className="text-skin-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
               ))}

               <div className="pt-4 mt-4 border-t border-skin-border">
                 <button 
                    onClick={() => setIsThemeSelectorOpen(!isThemeSelectorOpen)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-skin-hover text-skin-text transition-colors text-sm font-medium"
                 >
                    <div className="flex items-center gap-3">
                        <span className="text-brand-500"><Palette size={20} /></span>
                        Appearance
                    </div>
                    <ChevronRight size={16} className={`text-skin-muted transition-transform ${isThemeSelectorOpen ? 'rotate-90' : ''}`} />
                 </button>

                 {isThemeSelectorOpen && (
                   <div className="pl-4 pr-2 space-y-3 mt-2 animate-fade-in bg-skin-hover/50 p-3 rounded-xl mx-2">
                      <p className="text-xs text-skin-muted leading-relaxed mb-2">
                        Switch between light and dark themes for better visibility and comfort.
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {themes.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setTheme(t.id);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs font-medium transition-all ${theme === t.id ? 'border-brand-500 bg-brand-500/10 text-brand-600' : 'border-skin-border bg-skin-card hover:bg-white text-skin-muted'}`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full ${t.color}`}></div>
                              {t.label}
                            </div>
                            {theme === t.id && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                   </div>
                 )}
               </div>
            </div>

            {/* Menu Footer */}
            <div className="p-4 border-t border-skin-border text-center">
               <p className="text-xs text-skin-muted">QuoteVault v1.1.0</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex-none h-16 bg-skin-header backdrop-blur-md border-b border-skin-border px-4 flex items-center justify-between z-10 transition-colors duration-300">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-skin-muted hover:text-skin-text active:bg-skin-hover rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          ) : (
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 text-skin-muted hover:text-skin-text active:bg-skin-hover rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
          )}
          <h1 className={`text-xl font-bold tracking-tight ${!showBack ? 'text-brand-600' : 'text-skin-text'}`}>
            {title || 'QuoteVault'}
          </h1>
        </div>
        <div>{headerAction}</div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-24">
        <div className="max-w-md mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="flex-none h-16 bg-skin-card border-t border-skin-border flex items-center justify-around z-20 pb-safe transition-colors duration-300">
        <button 
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-1 p-2 w-16 rounded-lg transition-colors ${isActive('/') ? 'text-brand-600' : 'text-skin-muted hover:text-skin-text'}`}
        >
          <HomeIcon size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button 
          onClick={() => navigate('/add')}
          className={`flex flex-col items-center gap-1 p-2 w-16 rounded-lg transition-colors ${isActive('/add') ? 'text-brand-600' : 'text-skin-muted hover:text-skin-text'}`}
        >
          <PlusSquare size={24} strokeWidth={isActive('/add') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Add</span>
        </button>

        <button 
          onClick={() => navigate('/search')}
          className={`flex flex-col items-center gap-1 p-2 w-16 rounded-lg transition-colors ${isActive('/search') ? 'text-brand-600' : 'text-skin-muted hover:text-skin-text'}`}
        >
          <Search size={24} strokeWidth={isActive('/search') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Search</span>
        </button>
      </nav>
    </div>
  );
};