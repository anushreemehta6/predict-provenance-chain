import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { useReporterRole } from '@/hooks/usePredictionContract';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Database, 
  Settings, 
  History, 
  Wallet, 
  AlertTriangle,
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const { isConnected, account, chainId, isCorrectNetwork, disconnectWallet, switchToSepolia } = useWallet();
  const { isReporter } = useReporterRole();
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/history', label: 'History', icon: History },
    ...(isReporter ? [{ path: '/admin', label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-card-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Database className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">PredictiveAI</span>
          </Link>

          {/* Navigation Links */}
          {isConnected && (
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link to={item.path} className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Wallet Status */}
          <div className="flex items-center space-x-3">
            {isConnected && (
              <>
                {/* Network Warning */}
                {!isCorrectNetwork && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={switchToSepolia}
                    className="flex items-center space-x-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Switch to Sepolia</span>
                  </Button>
                )}

                {/* Account Info */}
                <div className="flex items-center space-x-3 glass-card px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </span>
                  </div>
                  
                  {isReporter && (
                    <Badge variant="secondary" className="text-xs">
                      Reporter
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={disconnectWallet}
                    className="p-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;