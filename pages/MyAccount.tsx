import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../store/StoreContext';
import { Gift, Calendar, TrendingUp, Copy, CheckCircle2, Trash2, Instagram, Link as LinkIcon, ExternalLink, Filter } from 'lucide-react';
import { LinkHistoryItem } from '../types';

type DateFilter = 'all' | 'today' | 'week';

export const Dashboard: React.FC = () => {
  const { userAccount, claimDailyReward, linkHistory, deleteLinkFromHistory } = useStore();
  const [justClaimed, setJustClaimed] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tiktok' | 'instagram' | 'other'>('tiktok');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

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

  // Filter history based on tabs and date
  const filteredHistory = linkHistory.filter(item => {
    // 1. Platform Filter
    if (item.platform !== activeTab) return false;

    // 2. Date Filter
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

  // Helper for platform icons
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

  return (
    <Layout title="Dashboard" showBack>
      <div className="space-y-6 pb-6">
        
        {/* Daily Rewards Section */}
        <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-3xl p-6 shadow-lg shadow-brand-900/20 relative overflow-hidden">
            {/* Background Decor */}
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
                    <div className="bg-white/10 p-2 rounded-xl">
                        <Gift size={24} className="text-brand-100" />
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl mb-4">
                     <div className="flex items-center gap-2 text-sm font-medium">
                        <TrendingUp size={16} className="text-brand-200" />
                        <span>Streak: <span className="text-white font-bold">{userAccount.streak} days</span></span>
                     </div>
                </div>

                <button 
                    onClick={handleClaim}
                    disabled={!canClaim()}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        canClaim() 
                        ? 'bg-white text-brand-700 shadow-lg active:scale-95' 
                        : 'bg-brand-900/40 text-brand-200/50 cursor-default'
                    }`}
                >
                    {justClaimed ? (
                        <>Claimed! <CheckCircle2 size={18} /></>
                    ) : canClaim() ? (
                        <>Claim +10 Credits</>
                    ) : (
                        <>Come back tomorrow</>
                    )}
                </button>
                <p className="text-[10px] text-center mt-3 text-brand-200/60">Redeem credits for premium features coming soon.</p>
            </div>
        </section>

        {/* Link History Section */}
        <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-bold text-skin-text flex items-center gap-2">
                    <Calendar size={20} className="text-brand-500" />
                    Link History
                </h3>
                <span className="text-[10px] text-skin-muted bg-skin-card border border-skin-border px-2 py-1 rounded-full">30 Days Max</span>
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <div className="text-skin-muted px-1"><Filter size={14} /></div>
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'Last 7 Days' },
                ].map(filter => (
                  <button
                      key={filter.id}
                      onClick={() => setDateFilter(filter.id as DateFilter)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                          dateFilter === filter.id
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-skin-card text-skin-muted border-skin-border hover:border-brand-300 hover:text-skin-text'
                      }`}
                  >
                      {filter.label}
                  </button>
                ))}
            </div>

            {/* Platform Tabs */}
            <div className="flex p-1 bg-skin-card border border-skin-border rounded-xl">
                {(['tiktok', 'instagram', 'other'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all flex items-center justify-center gap-2 ${
                            activeTab === tab 
                            ? 'bg-skin-hover text-brand-600 shadow-sm' 
                            : 'text-skin-muted hover:text-skin-text'
                        }`}
                    >
                       <PlatformIcon type={tab} size={14} />
                       {tab}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-2 min-h-[200px]">
                {filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-skin-muted opacity-60">
                        <LinkIcon size={32} className="mb-2" />
                        <p className="text-xs">No {activeTab} links found for this period.</p>
                    </div>
                ) : (
                    filteredHistory.map(item => (
                        <div key={item.id} className="bg-skin-card p-3 rounded-xl border border-skin-border shadow-sm flex items-center gap-3 group">
                             <div className="w-10 h-10 rounded-full bg-skin-hover flex items-center justify-center shrink-0">
                                 <PlatformIcon type={item.platform} size={20} />
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                 <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-skin-text font-medium truncate block hover:text-brand-600 hover:underline mb-0.5"
                                 >
                                     {item.url}
                                 </a>
                                 <p className="text-[10px] text-skin-muted">
                                     {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </p>
                             </div>

                             <div className="flex items-center gap-1">
                                 <button 
                                     onClick={() => handleCopy(item.url, item.id)}
                                     className={`p-2 rounded-lg transition-all ${
                                         copiedLinkId === item.id 
                                         ? 'text-green-600 bg-green-500/10' 
                                         : 'text-skin-muted hover:bg-skin-hover hover:text-brand-600'
                                     }`}
                                 >
                                     {copiedLinkId === item.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                 </button>
                                 <button 
                                     onClick={() => deleteLinkFromHistory(item.id)}
                                     className="p-2 rounded-lg text-skin-muted hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                 >
                                     <Trash2 size={16} />
                                 </button>
                             </div>
                        </div>
                    ))
                )}
            </div>
        </section>

      </div>
    </Layout>
  );
};