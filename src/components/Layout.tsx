import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import Navigation from '@/components/Navigation';
import WalletConnect from '@/components/WalletConnect';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <WalletConnect />
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default Layout;