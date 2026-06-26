'use client';

import { useState, useEffect } from 'react';

interface AIStatus {
  available: boolean;
  provider: string;
  providerName: string;
  loading: boolean;
  error: string | null;
}

export function useAIStatus(): AIStatus {
  const [status, setStatus] = useState<AIStatus>({
    available: false,
    provider: 'mock',
    providerName: 'Mock (No AI)',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/ai/status');
        const data = await res.json();
        
        if (data.success) {
          setStatus({
            available: data.available,
            provider: data.provider,
            providerName: data.providerName,
            loading: false,
            error: null,
          });
        } else {
          setStatus(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to check AI status',
          }));
        }
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to check AI status',
        }));
      }
    };

    checkStatus();
  }, []);

  return status;
}
