import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Mail, Send, Star, Check, Globe, Shield, FileText, ChevronRight } from 'lucide-react';

// --- Contact Page ---
export const ContactPage: React.FC = () => {
  return (
    <Layout title="Contact Us" showBack>
      <div className="space-y-6 pt-4">
        <div className="bg-skin-card p-6 rounded-2xl border border-skin-border shadow-sm text-center">
          <div className="w-16 h-16 bg-brand-500/10 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} />
          </div>
          <h2 className="text-xl font-bold text-skin-text mb-2">Get in Touch</h2>
          <p className="text-skin-muted text-sm leading-relaxed mb-6">
            Have a question, issue, or just want to say hello? We'd love to hear from you.
          </p>
          
          <a href="mailto:support@quotevault.app" className="block w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors">
            support@quotevault.app
          </a>
          
          <p className="text-xs text-skin-muted mt-4">
            We usually respond within 24–48 hours.
          </p>
        </div>
      </div>
    </Layout>
  );
};

// --- Feedback Page ---
export const FeedbackPage: React.FC = () => {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <Layout title="Feedback" showBack>
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce-short">
            <Check size={40} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-skin-text mb-2">Thanks!</h2>
          <p className="text-skin-muted">Your feedback helps us make QuoteVault better for everyone.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Feedback" showBack>
      <div className="space-y-6 pt-4">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-skin-text">Help us improve</h2>
          <p className="text-skin-muted text-sm">
            Found a bug? Have a feature request? Let us know what's on your mind.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
          <textarea 
            className="w-full h-40 bg-skin-card border border-skin-border rounded-xl p-4 text-skin-text outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
            placeholder="Type your feedback here..."
            required
          ></textarea>
          
          <button 
            type="submit" 
            className="w-full bg-skin-text text-skin-base py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Send size={18} /> Send Feedback
          </button>
        </form>
      </div>
    </Layout>
  );
};

// --- Rate Us Page ---
export const RatePage: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Layout title="Rate Us" showBack>
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
           <div className="text-4xl mb-4">⭐️⭐️⭐️⭐️⭐️</div>
           <h2 className="text-2xl font-bold text-skin-text mb-2">You're Awesome!</h2>
           <p className="text-skin-muted">Thanks for taking the time to rate us.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Rate Us" showBack>
      <div className="space-y-8 pt-8 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-skin-text">Enjoying QuoteVault?</h2>
          <p className="text-skin-muted">
            If we helped you find the right words, a quick rating would mean the world to us.
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`p-2 transition-transform active:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-skin-border'}`}
            >
              <Star size={40} fill={rating >= star ? "currentColor" : "none"} />
            </button>
          ))}
        </div>

        <button 
          disabled={rating === 0}
          onClick={() => setSubmitted(true)}
          className="w-full bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all"
        >
          Submit Rating
        </button>
      </div>
    </Layout>
  );
};

// --- Language Page ---
export const LanguagePage: React.FC = () => {
  return (
    <Layout title="Language" showBack>
      <div className="space-y-4 pt-4">
        <p className="text-sm text-skin-muted px-1">
          Select your preferred language. We're working on adding more soon!
        </p>

        <div className="bg-skin-card rounded-2xl border border-skin-border overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-skin-hover transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇺🇸</span>
              <span className="font-medium text-skin-text">English</span>
            </div>
            <Check size={20} className="text-brand-600" />
          </button>
          <div className="h-px bg-skin-border mx-4"></div>
          <button className="w-full flex items-center justify-between p-4 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇪🇸</span>
              <span className="font-medium text-skin-text">Español</span>
            </div>
            <span className="text-xs font-bold bg-skin-hover border border-skin-border px-2 py-1 rounded text-skin-muted">SOON</span>
          </button>
          <div className="h-px bg-skin-border mx-4"></div>
          <button className="w-full flex items-center justify-between p-4 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇫🇷</span>
              <span className="font-medium text-skin-text">Français</span>
            </div>
            <span className="text-xs font-bold bg-skin-hover border border-skin-border px-2 py-1 rounded text-skin-muted">SOON</span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

// --- Terms Page ---
export const TermsPage: React.FC = () => {
  return (
    <Layout title="Terms of Service" showBack>
      <div className="space-y-6 pt-2 pb-8 text-skin-text">
        <div className="bg-skin-card p-6 rounded-2xl border border-skin-border">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <FileText size={20} className="text-brand-600" />
            Simple Summary
          </h2>
          <ul className="space-y-3 text-sm text-skin-muted list-disc list-inside">
            <li>QuoteVault is a tool for personal organization.</li>
            <li>You are responsible for the content you save.</li>
            <li>We do not claim ownership of any third-party content you process.</li>
          </ul>
        </div>

        <div className="space-y-4 px-2">
          <section>
            <h3 className="font-bold text-base mb-2">1. Usage</h3>
            <p className="text-sm text-skin-muted leading-relaxed">
              This app is intended for personal use to organize publicly available quotes. Please respect copyright laws and the creators of the original content.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2">2. Content Ownership</h3>
            <p className="text-sm text-skin-muted leading-relaxed">
              You retain all rights to your data. QuoteVault acts as a processor to extract text for your convenience. We do not store your content on public servers.
            </p>
          </section>
          
          <section>
            <h3 className="font-bold text-base mb-2">3. Liability</h3>
            <p className="text-sm text-skin-muted leading-relaxed">
              The app is provided "as is". We are not liable for any data loss or misuse of the extracted text.
            </p>
          </section>
        </div>
        
        <p className="text-xs text-center text-skin-muted pt-4">
          Last updated: January 2024
        </p>
      </div>
    </Layout>
  );
};

// --- Privacy Page ---
export const PrivacyPage: React.FC = () => {
  return (
    <Layout title="Privacy Policy" showBack>
      <div className="space-y-6 pt-2 pb-8 text-skin-text">
        <div className="bg-skin-card p-6 rounded-2xl border border-skin-border">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Shield size={20} className="text-brand-600" />
            Your Privacy Matters
          </h2>
          <p className="text-sm text-skin-muted leading-relaxed">
            We believe your personal vault should stay personal. Here is how we handle your data.
          </p>
        </div>

        <div className="space-y-4 px-2">
          <section>
            <h3 className="font-bold text-base mb-2">Data Storage</h3>
            <p className="text-sm text-skin-muted leading-relaxed">
              Your quotes and collections are stored locally on your device. We do not have access to your personal vault.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-2">Image Processing</h3>
            <p className="text-sm text-skin-muted leading-relaxed">
              Images are processed securely to extract text. They are not permanently stored on our servers after processing is complete.
            </p>
          </section>
          
          <section>
            <h3 className="font-bold text-base mb-2">No Ad Tracking</h3>
            <p className="text-sm text-skin-muted leading-relaxed">
              We do not sell your data to advertisers or third parties.
            </p>
          </section>
        </div>
         <p className="text-xs text-center text-skin-muted pt-4">
          Last updated: January 2024
        </p>
      </div>
    </Layout>
  );
};