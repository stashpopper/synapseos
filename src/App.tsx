import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/sections/Navbar';
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import PerformanceEngine from './components/sections/PerformanceEngine';
import Playground from './components/sections/Playground';
import Marquee from './components/sections/Marquee';
import Pricing from './components/sections/Pricing';
import FAQ from './components/sections/FAQ';
import Footer from './components/sections/Footer';
import ForgePage from './components/forge/ForgePage';

type Page = 'home' | 'forge';

function getPageFromPath(): Page {
  const path = window.location.pathname;
  if (path.startsWith('/forge') || path === '/forge') return 'forge';
  return 'home';
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'forge') {
      window.history.pushState({ page: 'forge' }, '', '/forge');
    } else {
      window.history.pushState({ page: 'home' }, '', '/');
    }
  }, []);

  if (currentPage === 'forge') {
    return (
      <div className="min-h-screen bg-background text-slate-300 antialiased">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => navigateTo('home')}
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-background">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Synapse<span className="text-primary">Forge</span>
                </span>
              </button>
              <button
                onClick={() => navigateTo('home')}
                className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>←</span>
                <span className="hidden sm:inline">Back to Home</span>
              </button>
            </div>
          </div>
        </div>
        <ForgePage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-300 antialiased">
      <Navbar onSearchOpen={() => {}} onForgeNavigate={() => navigateTo('forge')} />
      <main>
        <Hero onStartBuilding={() => navigateTo('forge')} />
        <Features />
        <PerformanceEngine />
        <Playground />
        <Marquee />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;
