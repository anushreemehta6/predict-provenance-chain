import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Shield, Zap } from 'lucide-react';

const WalletConnect = () => {
  const { connectWallet } = useWallet();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md glass-card shadow-2xl animate-scale-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center animate-glow-pulse">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl gradient-text">Connect Your Wallet</CardTitle>
          <CardDescription className="text-muted-foreground">
            Access AI predictions with blockchain verification
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <Shield className="w-5 h-5 text-success" />
              <span>Secure blockchain verification</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Zap className="w-5 h-5 text-accent" />
              <span>Real-time prediction analytics</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Wallet className="w-5 h-5 text-secondary" />
              <span>Full provenance tracking</span>
            </div>
          </div>

          <Button 
            variant="hero" 
            size="xl" 
            onClick={connectWallet}
            className="w-full"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect MetaMask
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Don't have MetaMask?{' '}
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Install MetaMask
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletConnect;