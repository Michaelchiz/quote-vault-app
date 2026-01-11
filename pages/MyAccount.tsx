import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useStore, FREE_QUOTE_LIMIT } from '../store/StoreContext';
import { Gift, Calendar, TrendingUp, Copy, CheckCircle2, Trash2, Instagram, Link as LinkIcon, ExternalLink, Filter, Crown, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';
import { LinkHistoryItem } from '../types';

type DateFilter = 'all' | 'today' | 'week';

export const Dashboard: React.FC = () => {
  const { userAccount, claimDailyReward, linkHistory, deleteLinkFromHistory, totalQuotes, upgradeToPro } = useStore();
  const [justClaimed, setJustClaimed] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tiktok' | 'instagram' | 'other'>('tiktok');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const canClaim = () => {
    if (!userAccount.lastDailyClaim) return true;
    const lastDate = new Date(userAccount.lastDailyClaim).toDateString();
    const todayDate = new Date().toDateString();
    return lastDate !== todayDate;
  };

  const handleClaim = () => {
    if (claimDailyReward()) {
      setJustClaimed(true);
      setTimeout(() => setJustClaimed(false), 3000);
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const filteredHistory = linkHistory.filter(item => {
    if (item.platform !== activeTab) return false;
    if (dateFilter === 'today') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        return item.createdAt >= startOfToday.getTime();
    }
    if (dateFilter === 'week') {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return item.createdAt >= oneWeekAgo;
    }
    return true;
  });

  const PlatformIcon = ({ type, size = 16 }: { type: string, size?: number }) => {
     if (type === 'tiktok') {
         return (
             <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-black dark:text-white">
                 <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
             </svg>
         );
     }
     if (type === 'instagram') return <Instagram size={size} className="text-pink-600" />;
     return <LinkIcon size={size} className="text-skin-muted" />;
  };

  const usagePercent = Math.min((totalQuotes / FREE_QUOTE_LIMIT) * 100, 100);

  return (
    <Layout title="Dashboard" showBack>
      <div className="space-y-6 pb-6">
        
        {/* Pro Subscription Banner */}
        {!userAccount.isPremium ? (
             <section className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl p-5 shadow-lg shadow-amber-900/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <Crown size={20} className="text-amber-900" />
                             <h3 className="font-black text-amber-950 uppercase tracking-tighter text-lg">Vault Pro</h3>
                        </div>
                        <p className="text-amber-900 text-xs font-bold opacity-80">Unlimited storage & AI power.</p>
                    </div>
                    <button 
                        onClick={() => setIsUpgrading(true)}
                        className="bg-amber-950 text-amber-400 px-4 py-2 rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all"
                    >
                        UPGRADE
                    </button>
                </div>
             </section>
        ) : (
            <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 shadow-lg shadow-indigo-900/20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                             <h3 className="font-bold text-lg">Vault Pro Active</h3>
                             <Sparkles size={14} className="text-amber-400 fill-amber-400" />
                        </div>
                        <p className="text-xs text-indigo-100/70">You have unlimited quote storage enabled.</p>
                    </div>
                </div>
            </section>
        )}

        {/* Usage Stats Card */}
        <section className="bg-skin-card p-5 rounded-3xl border border-skin-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-skin-text uppercase tracking-widest opacity-60">Your Storage</h3>
                {userAccount.isPremium ? (
                     <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded-md border border-indigo-500/20">UNLIMITED</span>
                ) : (
                    <span className="text-[10px] font-black bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md border border-amber-500/20">FREE PLAN</span>
                )}
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <div className="text-2xl font-black text-skin-text">{totalQuotes} <span className="text-xs font-bold text-skin-muted">Quotes Saved</span></div>
                    {!userAccount.isPremium && <div className="text-xs font-bold text-skin-muted">{totalQuotes}/{FREE_QUOTE_LIMIT}</div>}
                </div>
                {!userAccount.isPremium && (
                    <div className="w-full h-2 bg-skin-hover rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 rounded-full ${usagePercent > 80 ? 'bg-amber-500' : 'bg-brand-500'}`} 
                            style={{ width: `${usagePercent}%` }}
                        ></div>
                    </div>
                )}
            </div>
        </section>

        {/* Daily Rewards Section */}
        <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-3xl p-6 shadow-lg shadow-brand-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-lg font-bold opacity-90">Daily Rewards</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-3xl font-bold">{userAccount.credits}</span>
                            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">Credits</span>
                        </div>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl"><Gift size={24} className="text-brand-100" /></div>
                </div>
                <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl mb-4">
                     <div className="flex items-center gap-2 text-sm font-medium"><TrendingUp size={16} className="text-brand-200" /><span>Streak: <span className="text-white font-bold">{userAccount.streak} days</span></span></div>
                </div>
                <button onClick={handleClaim} disabled={!canClaim()} className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${canClaim() ? 'bg-white text-brand-700 shadow-lg' : 'bg-brand-900/40 text-brand-200/50 cursor-default'}`}>
                    {justClaimed ? (<>Claimed! <CheckCircle2 size={18} /></>) : canClaim() ? (<>Claim +10 Credits</>) : (<>Come back tomorrow</>)}
                </button>
            </div>
        </section>

        {/* Link History Section */}
        <section className="space-y-4">
            <div className="flex items-center justify-between px-1"><h3 className="text-lg font-bold text-skin-text flex items-center gap-2"><Calendar size={20} className="text-brand-500" />Link History</h3></div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <div className="text-skin-muted px-1"><Filter size={14} /></div>
                {[{ id: 'all', label: 'All Time' }, { id: 'today', label: 'Today' }, { id: 'week', label: 'Last 7 Days' },].map(filter => (
                  <button key={filter.id} onClick={() => setDateFilter(filter.id as DateFilter)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 border ${dateFilter === filter.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-skin-card text-skin-muted border-skin-border hover:border-brand-300 hover:text-skin-text'}`}>{filter.label}</button>
                ))}
            </div>
            <div className="flex p-1 bg-skin-card border border-skin-border rounded-xl">
                {(['tiktok', 'instagram', 'other'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-skin-hover text-brand-600 shadow-sm' : 'text-skin-muted hover:text-skin-text'}`}><PlatformIcon type={tab} size={14} />{tab}</button>
                ))}
            </div>
            <div className="space-y-2 min-h-[100px]">
                {filteredHistory.length === 0 ? (<div className="flex flex-col items-center justify-center py-12 text-skin-muted opacity-60"><LinkIcon size={32} className="mb-2" /><p className="text-xs">No {activeTab} links found.</p></div>) : (filteredHistory.map(item => (
                    <div key={item.id} className="bg-skin-card p-3 rounded-xl border border-skin-border shadow-sm flex items-center gap-3 group transition-all active:scale-[0.99]"><div className="w-10 h-10 rounded-full bg-skin-hover flex items-center justify-center shrink-0"><PlatformIcon type={item.platform} size={20} /></div><div className="flex-1 min-w-0"><a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-skin-text font-medium truncate block hover:text-brand-600 hover:underline mb-0.5">{item.url}</a><p className="text-[10px] text-skin-muted">{new Date(item.createdAt).toLocaleDateString()}</p></div><div className="flex items-center gap-1"><button onClick={() => handleCopy(item.url, item.id)} className={`p-2 rounded-lg transition-all active:scale-90 ${copiedLinkId === item.id ? 'text-green-600 bg-green-500/10' : 'text-skin-muted hover:bg-skin-hover hover:text-brand-600'}`}>{copiedLinkId === item.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}</button><button onClick={() => deleteLinkFromHistory(item.id)} className="p-2 rounded-lg text-skin-muted hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90 opacity-0 group-hover:opacity-100 focus:opacity-100"><Trash2 size={16} /></button></div></div>
                )))}
            </div>
        </section>

        {/* Upgrade Modal */}
        {isUpgrading && (
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
                 <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsUpgrading(false)}></div>
                 <div className="relative w-full max-w-sm bg-slate-900 text-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-in-bottom border-t sm:border border-slate-700">
                     <div className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
                            <Crown size={44} className="text-amber-950" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight">Vault Pro</h3>
                            <p className="text-slate-400 text-sm">Unlock the full power of your personal organization vault.</p>
                        </div>
                        
                        <div className="space-y-3 text-left bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={18} className="text-amber-500" />
                                <span className="text-sm font-bold">Unlimited Storage</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Zap size={18} className="text-amber-500" />
                                <span className="text-sm font-bold">Priority AI Analysis</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Layers size={18} className="text-amber-500" />
                                <span className="text-sm font-bold">Manage Custom Categories</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                upgradeToPro();
                                setIsUpgrading(false);
                            }}
                            className="w-full bg-amber-500 text-slate-950 py-4 rounded-xl font-black text-lg active:scale-95 transition-all shadow-lg"
                        >
                            Subscribe for $3.99/mo
                        </button>
                        <button onClick={() => setIsUpgrading(false)} className="text-slate-500 text-sm font-bold hover:text-white transition-colors">Maybe Later</button>
                     </div>
                 </div>
            </div>
        )}

      </div>
    </Layout>
  );
};