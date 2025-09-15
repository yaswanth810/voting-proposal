import React from 'react';
import { Vote, Sun, Moon, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeProvider';
import { WalletConnect } from './WalletConnect';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Proposals', href: '/proposals' },
    { name: 'Results', href: '/results' },
    { name: 'Admin', href: '/admin' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gradient">VoteChain</h1>
              <p className="text-xs text-white/60">Decentralized Voting</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-white/70" />
              ) : (
                <Moon className="w-5 h-5 text-white/70" />
              )}
            </button>

            {/* Wallet Connect */}
            <WalletConnect />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white/70" />
              ) : (
                <Menu className="w-5 h-5 text-white/70" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
