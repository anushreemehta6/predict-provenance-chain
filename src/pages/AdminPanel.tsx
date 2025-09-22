import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useReporterRole, usePredictionContract } from '@/hooks/usePredictionContract';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Settings, 
  Shield, 
  Hash, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import PredictionRegistryContract from '@/contracts/PredictionRegistry';

const AdminPanel = () => {
  const { account, isConnected } = useWallet();
  const { isReporter, loading: roleLoading } = useReporterRole();
  const contract = usePredictionContract();

  const [formData, setFormData] = useState({
    predictionHash: '',
    inputHash: '',
    modelVersion: '',
    ipfsCid: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSampleHash = () => {
    const sampleData = {
      input: 'sample_prediction_input',
      timestamp: Date.now(),
      model: formData.modelVersion || 'v1.0.0'
    };
    
    const hash = PredictionRegistryContract.hashString(JSON.stringify(sampleData));
    setFormData(prev => ({
      ...prev,
      predictionHash: hash
    }));
  };

  const generateInputHash = () => {
    const inputData = `model_input_${Date.now()}`;
    const hash = PredictionRegistryContract.hashString(inputData);
    setFormData(prev => ({
      ...prev,
      inputHash: hash
    }));
  };

  const handleSubmitPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !isReporter) {
      toast({
        title: 'Access Denied',
        description: 'You need reporter role to submit predictions',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.predictionHash || !formData.inputHash || !formData.modelVersion) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const tx = await contract.recordPrediction(
        formData.predictionHash,
        formData.inputHash,
        formData.modelVersion,
        formData.ipfsCid
      );

      toast({
        title: 'Transaction Submitted',
        description: 'Prediction recording transaction sent to blockchain',
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      toast({
        title: 'Prediction Recorded',
        description: `Successfully recorded prediction on block ${receipt?.blockNumber}`,
      });

      // Reset form
      setFormData({
        predictionHash: '',
        inputHash: '',
        modelVersion: '',
        ipfsCid: ''
      });

    } catch (error: any) {
      console.error('Failed to record prediction:', error);
      toast({
        title: 'Recording Failed',
        description: error.message || 'Failed to record prediction',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Wallet Required</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Please connect your wallet to access the admin panel
        </p>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  if (!isReporter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground text-center max-w-md">
          You need the REPORTER_ROLE to access this admin panel. Contact the contract administrator to request access.
        </p>
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Your address:</p>
          <code className="text-sm font-mono">{account}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold gradient-text">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Manage AI predictions and blockchain records
        </p>
      </div>

      {/* Status Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-success" />
            <span>Reporter Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-success" />
            <div>
              <p className="font-medium">Reporter Role Active</p>
              <p className="text-sm text-muted-foreground">
                You have permission to record predictions on-chain
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-muted-foreground">Account</label>
              <p className="font-mono">{PredictionRegistryContract.formatAddress(account!)}</p>
            </div>
            <div>
              <label className="text-muted-foreground">Role</label>
              <p className="text-success font-medium">REPORTER_ROLE</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Prediction Form */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Record New Prediction</span>
          </CardTitle>
          <CardDescription>
            Submit a new prediction hash to the blockchain for provenance tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPrediction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="predictionHash">
                  Prediction Hash *
                  <span className="text-xs text-muted-foreground ml-2">(bytes32)</span>
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="predictionHash"
                    placeholder="0x..."
                    value={formData.predictionHash}
                    onChange={(e) => handleInputChange('predictionHash', e.target.value)}
                    className="font-mono text-sm"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateSampleHash}
                  >
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inputHash">
                  Input Hash *
                  <span className="text-xs text-muted-foreground ml-2">(bytes32)</span>
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="inputHash"
                    placeholder="0x..."
                    value={formData.inputHash}
                    onChange={(e) => handleInputChange('inputHash', e.target.value)}
                    className="font-mono text-sm"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateInputHash}
                  >
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modelVersion">
                  Model Version *
                </Label>
                <Input
                  id="modelVersion"
                  placeholder="v2.3.1"
                  value={formData.modelVersion}
                  onChange={(e) => handleInputChange('modelVersion', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipfsCid">
                  IPFS CID (optional)
                </Label>
                <Input
                  id="ipfsCid"
                  placeholder="QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
                  value={formData.ipfsCid}
                  onChange={(e) => handleInputChange('ipfsCid', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                * Required fields
              </div>
              <Button
                type="submit"
                variant="hero"
                disabled={submitting}
                className="px-8"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Recording...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Record Prediction
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Hash className="w-4 h-4 mr-2" />
              Generate Test Hash
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a 
                href={PredictionRegistryContract.getExplorerUrl(PredictionRegistryContract.contractAddress, 'address')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Contract
              </a>
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Contract Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;