import React from 'react';
import { Layout } from '../components/Layout';
import { Brain } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <Layout title="About" showBack>
      <div className="space-y-8 text-skin-text pb-8">
        {/* Header Branding */}
        <div className="bg-brand-600 text-white p-8 rounded-3xl shadow-lg shadow-brand-900/40 flex flex-col items-center text-center mt-2">
            <div className="bg-white/10 p-4 rounded-2xl mb-4 backdrop-blur-sm">
                <Brain size={40} className="text-brand-50" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">QuoteVault</h2>
            <p className="opacity-70 text-sm font-medium tracking-wide uppercase mt-1">Version 1.0.0</p>
        </div>

        {/* Content */}
        <div className="space-y-6 px-2">
            <div className="flex items-center gap-3 text-brand-600 mb-2">
                <Brain size={24} />
                <h3 className="text-xl font-bold">About QuoteVault</h3>
            </div>
            
            <p className="leading-relaxed text-skin-text">
                QuoteVault was built out of a real personal frustration.
            </p>
            <p className="leading-relaxed text-skin-muted">
                Like many people, I save a lot of content from social media — especially image-based TikToks with quotes, advice, flirting lines, and motivation. The problem is, after saving dozens or hundreds of images, everything gets lost. When the moment comes to actually use the advice or a line, you’re stuck scrolling, searching, and wasting time.
            </p>
            
            <p className="leading-relaxed font-semibold text-skin-text text-lg">
                I wanted a faster, smarter way.
            </p>
            
            <p className="leading-relaxed text-skin-muted">
                QuoteVault turns saved social media content into something usable. Instead of dumping images into your gallery, the app extracts the text, organizes it into clear categories, and makes it instantly searchable. When you need the right words — for confidence, motivation, or a real conversation — they’re already there.
            </p>
            
            <p className="leading-relaxed text-skin-muted">
                This app isn’t about collecting content.
            </p>
            
            <div className="bg-brand-500/10 border-l-4 border-brand-500 p-6 rounded-r-xl my-6">
                <p className="text-brand-600 font-serif text-lg italic leading-relaxed">
                    "It’s about remembering, organizing, and using it at the right time."
                </p>
            </div>
            
            <p className="leading-relaxed text-skin-muted font-medium">
                QuoteVault is built for real life, real moments, and real pressure.
            </p>
        </div>
      </div>
    </Layout>
  );
};