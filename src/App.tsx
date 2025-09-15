import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './contexts/WalletProvider';
import { ContractProvider } from './contexts/ContractProvider';
import { ThemeProvider } from './contexts/ThemeProvider';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Proposals } from './pages/Proposals';
import { Results } from './pages/Results';
import { AdminDashboard } from './components/AdminDashboard';

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <ContractProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              <Header />
              
              <main className="pt-4">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/proposals" element={<Proposals />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </main>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
            </div>
          </Router>
        </ContractProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;
