import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePredictionHistory } from '@/hooks/usePredictionContract';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  History as HistoryIcon,
  Search,
  Filter,
  ExternalLink,
  Eye,
  Hash,
  Clock,
  User,
  RefreshCw
} from 'lucide-react';
import PredictionRegistryContract from '@/contracts/PredictionRegistry';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  
  const { events, loading, error, refetch } = usePredictionHistory();

  // Extract unique model versions for filter
  const modelVersions = useMemo(() => {
    const versions = new Set(events.map(event => event.modelVersion));
    return Array.from(versions).sort();
  }, [events]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.predictionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.modelVersion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.reporter.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Model version filter
    if (selectedModel !== 'all') {
      filtered = filtered.filter(event => event.modelVersion === selectedModel);
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = Date.now() / 1000; // Convert to seconds
      let cutoff: number;
      
      switch (timeFilter) {
        case '1h':
          cutoff = now - 3600;
          break;
        case '24h':
          cutoff = now - 86400;
          break;
        case '7d':
          cutoff = now - 604800;
          break;
        case '30d':
          cutoff = now - 2592000;
          break;
        default:
          return filtered;
      }
      
      filtered = filtered.filter(event => event.timestamp >= cutoff);
    }

    return filtered;
  }, [events, searchTerm, selectedModel, timeFilter]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Prediction History</h1>
          <p className="text-muted-foreground mt-2">
            Browse and search all blockchain-recorded AI predictions
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

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search hash, model, or reporter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Model Version</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {modelVersions.map((version) => (
                    <SelectItem key={version} value={version}>
                      {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchTerm || selectedModel !== 'all' || timeFilter !== 'all') && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-card-border/50">
              <p className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {events.length} predictions
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedModel('all');
                  setTimeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HistoryIcon className="w-5 h-5" />
            <span>Prediction Records</span>
          </CardTitle>
          <CardDescription>
            Chronological list of all recorded predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>Failed to load prediction history</p>
              <Button variant="outline" onClick={refetch} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HistoryIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No predictions found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prediction</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.predictionHash}>
                      <TableCell>
                        <div className="space-y-1">
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {formatHash(event.predictionHash)}
                          </code>
                          {event.ipfsCid && (
                            <div className="flex items-center space-x-1">
                              <Hash className="w-3 h-3 text-muted-foreground" />
                              <a
                                href={`https://ipfs.io/ipfs/${event.ipfsCid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                IPFS
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {event.modelVersion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <a
                            href={PredictionRegistryContract.getExplorerUrl(event.reporter, 'address')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-primary hover:underline"
                          >
                            {formatHash(event.reporter)}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs">{getTimeAgo(event.timestamp)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimestamp(event.timestamp)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {event.blockNumber.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/prediction/${event.predictionHash}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={PredictionRegistryContract.getExplorerUrl(event.transactionHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;