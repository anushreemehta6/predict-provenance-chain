import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import PredictionRegistryContract, { PredictionData, PredictionEvent } from '@/contracts/PredictionRegistry';

export const usePredictionContract = () => {
  const { provider, signer } = useWallet();
  
  const contract = useMemo(() => {
    if (!provider) return null;
    return new PredictionRegistryContract(provider, signer || undefined);
  }, [provider, signer]);

  return contract;
};

export const usePrediction = (predictionHash?: string) => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contract = usePredictionContract();

  useEffect(() => {
    if (!contract || !predictionHash) return;

    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contract.getPrediction(predictionHash);
        setPrediction(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch prediction');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [contract, predictionHash]);

  return { prediction, loading, error };
};

export const usePredictionHistory = (modelVersion?: string) => {
  const [events, setEvents] = useState<PredictionEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contract = usePredictionContract();

  const fetchEvents = async () => {
    if (!contract) return;

    setLoading(true);
    setError(null);
    try {
      const eventData = await contract.getPredictionEvents(0, 'latest', modelVersion);
      setEvents(eventData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prediction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [contract, modelVersion]);

  return { events, loading, error, refetch: fetchEvents };
};

export const useReporterRole = () => {
  const [isReporter, setIsReporter] = useState(false);
  const [loading, setLoading] = useState(false);
  const { account } = useWallet();
  const contract = usePredictionContract();

  useEffect(() => {
    if (!contract || !account) return;

    const checkReporterRole = async () => {
      setLoading(true);
      try {
        const hasRole = await contract.hasReporterRole(account);
        setIsReporter(hasRole);
      } catch (error) {
        console.error('Error checking reporter role:', error);
        setIsReporter(false);
      } finally {
        setLoading(false);
      }
    };

    checkReporterRole();
  }, [contract, account]);

  return { isReporter, loading };
};