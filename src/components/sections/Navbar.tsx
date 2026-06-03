import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, Command } from 'lucide-react';
import Button from '../ui/Button';

interface NavbarProps {
  onSearchOpen?: () => void;
  onForgeNavigate?: () => void;
}

export default function Navbar({ onSearchOpen, onForgeNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchOverlayRef.current && !searchOverlayRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Performance', href: '#performance' },
    { label: 'Forge', href: '#forge', isForge: true },
    { label: 'Playground', href: '#playground' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const searchResults = searchQuery.length > 1
    ? navLinks.filter(link =>
        link.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? 'bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-5 h-5 text-background"
                  >
                    <path
                      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Synapse<span className="text-primary">OS</span>
              </span>
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) =>
                link.isForge ? (
                  <button
                    key={link.label}
                    onClick={() => onForgeNavigate?.()}
                    className="relative px-4 py-2 text-sm text-primary font-medium transition-colors duration-300 group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-primary group-hover:w-3/4 transition-all duration-300" />
                  </button>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="relative px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors duration-300 group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-primary group-hover:w-3/4 transition-all duration-300" />
                  </a>
                )
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              <button
                onClick={() => {
                  setSearchOpen(true);
                  onSearchOpen?.();
                }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-surface-elevated border border-border rounded-lg hover:border-border-hover hover:text-slate-300 transition-all duration-300"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search...</span>
                <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border rounded text-slate-600">
                  ⌘K
                </kbd>
              </button>

              {/* Forge CTA Button */}
              <button
                onClick={() => onForgeNavigate?.()}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dim text-background font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
              >
                Try Forge
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white transition-colors duration-300"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 top-16 z-40 md:hidden transition-all duration-500 ease-out ${
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-500 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`relative mx-4 mt-2 bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/50 transition-all duration-500 ease-out ${
            mobileOpen
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-4 scale-95'
          }`}
        >
          <div className="p-2">
            {navLinks.map((link, index) =>
              link.isForge ? (
                <button
                  key={link.label}
                  onClick={() => {
                    setMobileOpen(false);
                    onForgeNavigate?.();
                  }}
                  className={`flex items-center px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 ${
                    mobileOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{
                    transitionDelay: mobileOpen ? `${100 + index * 50}ms` : '0ms',
                  }}
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 ${
                    mobileOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{
                    transitionDelay: mobileOpen ? `${100 + index * 50}ms` : '0ms',
                  }}
                >
                  {link.label}
                </a>
              )
            )}
          </div>
          <div className="border-t border-border p-2">
            <Button variant="primary" fullWidth onClick={() => onForgeNavigate?.()}>
              Try Forge
            </Button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <div
        ref={searchOverlayRef}
        className={`fixed inset-0 z-[60] flex items-start justify-center pt-24 sm:pt-32 px-4 transition-all duration-300 ${
          searchOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={() => setSearchOpen(false)}
        />
        <div
          className={`relative w-full max-w-xl bg-surface-elevated border border-border rounded-2xl shadow-2xl shadow-black/60 overflow-hidden transition-all duration-300 ${
            searchOpen
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-4 scale-95'
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features, docs, or navigate..."
              className="flex-1 bg-transparent text-slate-200 placeholder-slate-600 text-sm outline-none"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="px-2 py-0.5 text-[10px] font-mono bg-background border border-border rounded text-slate-600"
            >
              ESC
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="max-h-64 overflow-y-auto p-2">
              {searchResults.map((result) =>
                result.isForge ? (
                  <button
                    key={result.label}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                      onForgeNavigate?.();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors duration-200"
                  >
                    <Command className="w-4 h-4 text-slate-600" />
                    {result.label}
                  </button>
                ) : (
                  <a
                    key={result.label}
                    href={result.href}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors duration-200"
                  >
                    <Command className="w-4 h-4 text-slate-600" />
                    {result.label}
                  </a>
                )
              )}
            </div>
          )}
          {searchQuery.length > 1 && searchResults.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-600">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </>
  );
}
