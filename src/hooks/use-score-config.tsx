import { useState, useEffect } from 'react';

export interface ScoreWeights {
  emailOpens: number;
  linkClicks: number;
  purchases: number;
  ltvDivisor: number;
}

export interface ScoreConfig {
  weights: ScoreWeights;
  lastUpdated: string;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  emailOpens: 2,
  linkClicks: 3,
  purchases: 10,
  ltvDivisor: 10,
};

const STORAGE_KEY = 'nucleocrm_score_config';

export function useScoreConfig() {
  const [config, setConfig] = useState<ScoreConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse score config:', e);
      }
    }
    return {
      weights: DEFAULT_WEIGHTS,
      lastUpdated: new Date().toISOString(),
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateWeights = (weights: Partial<ScoreWeights>) => {
    setConfig(prev => ({
      weights: { ...prev.weights, ...weights },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const resetToDefaults = () => {
    setConfig({
      weights: DEFAULT_WEIGHTS,
      lastUpdated: new Date().toISOString(),
    });
  };

  return {
    config,
    updateWeights,
    resetToDefaults,
  };
}
