import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Brain, Search, Layers, Shield } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const handleComplete = () => {
    localStorage.setItem('quotevault_onboarding_complete', 'true');
    navigate('/', { replace: true });
  };

  const screens = [
    {
      icon: <Brain size={48} />,
      title: "Welcome to QuoteVault",
      desc: "Your personal vault for wisdom, wit, and words that matter.",
      action: "Get Started"
    },
    {
      icon: <Layers size={48} />,
      title: "Extract & Organize",
      desc: "Automatically extract text from TikTok and Instagram screenshots. We categorize them for you.",
      action: "Next"
    },
    {
      icon: <Search size={48} />,
      title: "Retrieve & Share",
      desc: "Find the perfect line in seconds. Search by vibe, keyword, or category.",
      action: "Next"
    },
    {
      icon: <Shield size={48} />,
      title: "Start Saving",
      desc: "Build your personal content vault. Private, secure, and always ready.",
      action: "Start Saving Quotes"
    }
  ];

  const current = screens[step];

  return (
    <div className="fixed inset-0 bg-brand-600 text-white flex flex-col p-6 z-50">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 animate-fade-in">
        <div className="w-28 h-28 bg-white/10 rounded-[2rem] flex items-center justify-center text-brand-100 shadow-2xl shadow-brand-900/30 backdrop-blur-sm transform transition-all duration-500 hover:scale-105">
          {current.icon}
        </div>
        
        <div className="space-y-4 max-w-xs mx-auto">
          <h1 className="text-3xl font-bold tracking-tight leading-tight">{current.title}</h1>
          <p className="text-brand-100 text-lg leading-relaxed opacity-90">
            {current.desc}
          </p>
        </div>
      </div>

      <div className="flex-none space-y-8 pb-8">
        {/* Indicators */}
        <div className="flex justify-center gap-2">
          {screens.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ease-out ${i === step ? 'w-8 bg-white' : 'w-2 bg-brand-800/50'}`}
            />
          ))}
        </div>

        <button 
          onClick={() => step < screens.length - 1 ? setStep(s => s + 1) : handleComplete()}
          className="w-full bg-white text-brand-800 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {current.action}
          {step < screens.length - 1 ? <ArrowRight size={20} /> : <Check size={20} />}
        </button>
      </div>
    </div>
  );
};