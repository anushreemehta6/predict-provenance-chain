import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePrediction, usePredictionContract } from '@/hooks/usePredictionContract';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  Brain,
  Shield,
  Clock,
  Hash,
  User,
  ExternalLink,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import PredictionRegistryContract from '@/contracts/PredictionRegistry';

const PredictionDetail = () => {
  const { hash } = useParams<{ hash: string }>();
  const { prediction, loading, error } = usePrediction(hash);
  const contract = usePredictionContract();
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'verified' | 'mismatch' | null>(null);

  const handleVerifyOnChain = async () => {
    if (!contract || !hash) return;

    setVerifying(true);
    try {
      const onChainData = await contract.getPrediction(hash);
      
      if (!onChainData) {
        setVerificationResult('mismatch');
        toast({
          title: 'Verification Failed',
          description: 'Prediction not found on blockchain',
          variant: 'destructive',
        });
        return;
      }

      // Compare key fields
      if (onChainData.predictionHash.toLowerCase() === hash.toLowerCase()) {
        setVerificationResult('verified');
        toast({
          title: 'Verification Successful',
          description: 'Prediction data matches blockchain records',
        });
      } else {
        setVerificationResult('mismatch');
        toast({
          title: 'Verification Failed',
          description: 'Data mismatch with blockchain records',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Verification Error',
        description: error.message || 'Failed to verify prediction',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <XCircle className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold">Prediction Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          The prediction with hash {hash} could not be found or loaded.
        </p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Prediction Details</h1>
            <p className="text-muted-foreground">{formatHash(prediction.predictionHash)}</p>
          </div>
        </div>
        <Button
          variant="glow"
          onClick={handleVerifyOnChain}
          disabled={verifying}
          className="flex items-center space-x-2"
        >
          {verifying ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Shield className="w-4 h-4" />
          )}
          <span>Verify On-Chain</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Metadata */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Prediction Metadata</span>
            </CardTitle>
            <CardDescription>
              Full details of the AI prediction and its blockchain record
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prediction Hash</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="bg-muted p-2 rounded text-sm font-mono flex-1">
                    {prediction.predictionHash}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(prediction.predictionHash)}
                  >
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Input Hash</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="bg-muted p-2 rounded text-sm font-mono flex-1">
                    {prediction.inputHash}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(prediction.inputHash)}
                  >
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Model Version</label>
                  <div className="mt-1">
                    <Badge variant="secondary">{prediction.modelVersion}</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reporter</label>
                  <div className="mt-1">
                    <a
                      href={PredictionRegistryContract.getExplorerUrl(prediction.reporter, 'address')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm font-mono"
                    >
                      {PredictionRegistryContract.formatAddress(prediction.reporter)}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatTimestamp(prediction.timestamp)}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Block Number</label>
                <div className="text-sm font-mono">{prediction.blockNumber.toLocaleString()}</div>
              </div>

              {prediction.ipfsCid && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IPFS Source</label>
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://ipfs.io/ipfs/${prediction.ipfsCid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on IPFS
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Blockchain Verification</span>
            </CardTitle>
            <CardDescription>
              Verify prediction integrity against blockchain records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {verificationResult && (
              <div className={`p-4 rounded-lg border ${
                verificationResult === 'verified' 
                  ? 'bg-success/10 border-success/20' 
                  : 'bg-destructive/10 border-destructive/20'
              }`}>
                <div className="flex items-center space-x-2">
                  {verificationResult === 'verified' ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                  <span className="font-medium">
                    {verificationResult === 'verified' 
                      ? 'Verification Successful' 
                      : 'Verification Failed'
                    }
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {verificationResult === 'verified'
                    ? 'All prediction data matches blockchain records'
                    : 'Prediction data does not match blockchain records'
                  }
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Prediction Hash Match</span>
                </div>
                {verificationResult === 'verified' ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : verificationResult === 'mismatch' ? (
                  <XCircle className="w-4 h-4 text-destructive" />
                ) : (
                  <div className="w-4 h-4 bg-muted rounded-full" />
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Reporter Address</span>
                </div>
                <div className="w-4 h-4 bg-muted rounded-full" />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Timestamp Verification</span>
                </div>
                <div className="w-4 h-4 bg-muted rounded-full" />
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="hero"
                onClick={handleVerifyOnChain}
                disabled={verifying}
                className="w-full"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Run Verification Check
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredictionDetail;