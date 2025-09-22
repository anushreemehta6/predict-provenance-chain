import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePredictionHistory } from '@/hooks/usePredictionContract';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  Brain, 
  Shield, 
  ExternalLink,
  RefreshCw,
  Eye,
  Clock,
  Hash
} from 'lucide-react';
import PredictionRegistryContract from '@/contracts/PredictionRegistry';

// Mock data for demonstration - enhanced with required fields
const mockPredictions = [
  {
    id: '1',
    predictionHash: '0x1234567890123456789012345678901234567890123456789012345678901234',
    inputHash: '0x5678901234567890123456789012345678901234567890123456789012345678',
    modelVersion: 'v2.3.1',
    ipfsCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    reporter: '0x742d35Cc6765C0532575c3bD29506cB5110c6b4b',
    timestamp: Math.floor(Date.now() / 1000) - 300, // 5 min ago
    blockNumber: 12345678,
    transactionHash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    // Additional display fields
    value: 0.85,
    confidence: 92,
  },
  {
    id: '2',
    predictionHash: '0x2345678901234567890123456789012345678901234567890123456789012345',
    inputHash: '0x6789012345678901234567890123456789012345678901234567890123456789',
    modelVersion: 'v2.3.0',
    ipfsCid: '',
    reporter: '0x742d35Cc6765C0532575c3bD29506cB5110c6b4b',
    timestamp: Math.floor(Date.now() / 1000) - 900, // 15 min ago
    blockNumber: 12345677,
    transactionHash: '0xbcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef0',
    // Additional display fields
    value: 0.72,
    confidence: 87,
  },
];

// Mock chart data
const chartData = [
  { time: '12:00', value: 0.65, confidence: 78 },
  { time: '12:05', value: 0.71, confidence: 82 },
  { time: '12:10', value: 0.68, confidence: 80 },
  { time: '12:15', value: 0.72, confidence: 87 },
  { time: '12:20', value: 0.85, confidence: 92 },
];

const Dashboard = () => {
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
  const { events, loading, error, refetch } = usePredictionHistory(selectedModel);

  // Use real events if available, otherwise show mock data
  const predictions = events.length > 0 ? events.slice(0, 5) : mockPredictions;

  const formatTimestamp = (timestamp: number) => {
    // Handle both milliseconds and seconds timestamps
    const date = timestamp > 1e12 ? new Date(timestamp) : new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  const getDisplayValue = (prediction: any) => {
    // For mock data, use the value field; for real events, calculate or use a default
    return prediction.value || 0.75; // Default display value
  };

  const getDisplayConfidence = (prediction: any) => {
    // For mock data, use the confidence field; for real events, calculate or use a default
    return prediction.confidence || 85; // Default confidence
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 70) return 'text-accent';
    return 'text-destructive';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">AI Predictions Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time blockchain-verified AI predictions and analytics
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={refetch}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Prediction</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {predictions[0] ? (getDisplayValue(predictions[0]) * 100).toFixed(1) + '%' : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {predictions[0] ? formatTimestamp(predictions[0].timestamp) : 'No predictions'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {predictions.length > 0 
                ? (predictions.reduce((acc, p) => acc + getDisplayConfidence(p), 0) / predictions.length).toFixed(1) + '%'
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Last {predictions.length} predictions
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified On-Chain</CardTitle>
            <Shield className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">
              Blockchain verified predictions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Prediction Trend</span>
          </CardTitle>
          <CardDescription>
            Historical prediction values over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 1]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--card-border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Latest Predictions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Latest Predictions</span>
            </span>
            <Link to="/history">
              <Button variant="ghost" size="sm">
                View All
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No predictions available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <div 
                  key={prediction.predictionHash} 
                  className="flex items-center justify-between p-4 rounded-lg border border-card-border/50 hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">
                          Prediction: {(getDisplayValue(prediction) * 100).toFixed(1) + '%'}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {prediction.modelVersion}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(prediction.timestamp)}</span>
                        </span>
                        {prediction.ipfsCid && (
                          <span className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" />
                            <a 
                              href={`https://ipfs.io/ipfs/${prediction.ipfsCid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              IPFS
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getConfidenceColor(getDisplayConfidence(prediction))}`}>
                        {getDisplayConfidence(prediction)}% confidence
                      </div>
                      <Progress 
                        value={getDisplayConfidence(prediction)} 
                        className="w-20 h-2 mt-1"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                      >
                        <Link to={`/prediction/${prediction.predictionHash}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                      >
                        <a 
                          href={PredictionRegistryContract.getExplorerUrl(prediction.transactionHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;