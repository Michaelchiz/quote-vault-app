import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import { ThemeProvider } from './store/ThemeContext';
import { Home } from './pages/Home';
import { CategoryDetails } from './pages/CategoryDetails';
import { SubCategoryDetails } from './pages/SubCategoryDetails';
import { AddContent } from './pages/AddContent';
import { Search } from './pages/Search';
import { About } from './pages/About';
import { Onboarding } from './pages/Onboarding';
import { ContactPage, FeedbackPage, RatePage, LanguagePage, TermsPage, PrivacyPage } from './pages/SettingsPages';

// Protected Route for Onboarding
const RequireOnboarding = ({ children }: { children?: React.ReactNode }) => {
  const isComplete = localStorage.getItem('quotevault_onboarding_complete') === 'true';
  const location = useLocation();

  if (!isComplete) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <StoreProvider>
        <HashRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<RequireOnboarding><Home /></RequireOnboarding>} />
            <Route path="/about" element={<RequireOnboarding><About /></RequireOnboarding>} />
            <Route path="/category/:id" element={<RequireOnboarding><CategoryDetails /></RequireOnboarding>} />
            <Route path="/subcategory/:id" element={<RequireOnboarding><SubCategoryDetails /></RequireOnboarding>} />
            <Route path="/add" element={<RequireOnboarding><AddContent /></RequireOnboarding>} />
            <Route path="/search" element={<RequireOnboarding><Search /></RequireOnboarding>} />
            
            {/* Settings Pages */}
            <Route path="/settings/contact" element={<RequireOnboarding><ContactPage /></RequireOnboarding>} />
            <Route path="/settings/feedback" element={<RequireOnboarding><FeedbackPage /></RequireOnboarding>} />
            <Route path="/settings/rate" element={<RequireOnboarding><RatePage /></RequireOnboarding>} />
            <Route path="/settings/language" element={<RequireOnboarding><LanguagePage /></RequireOnboarding>} />
            <Route path="/settings/terms" element={<RequireOnboarding><TermsPage /></RequireOnboarding>} />
            <Route path="/settings/privacy" element={<RequireOnboarding><PrivacyPage /></RequireOnboarding>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </StoreProvider>
    </ThemeProvider>
  );
};

export default App;