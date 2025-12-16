import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

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

export function useScoreConfig() {
  const [config, setConfig] = useState<ScoreConfig>({
    weights: DEFAULT_WEIGHTS,
    lastUpdated: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configuração do backend
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const backendConfig = await api.getScoreConfig();
        setConfig({
          weights: {
            emailOpens: Number(backendConfig.emailOpens),
            linkClicks: Number(backendConfig.linkClicks),
            purchases: Number(backendConfig.purchases),
            ltvDivisor: Number(backendConfig.ltvDivisor),
          },
          lastUpdated: backendConfig.updatedAt,
        });
      } catch (error) {
        console.error('Erro ao carregar configuração de score:', error);
        // Usar valores padrão em caso de erro
        setConfig({
          weights: DEFAULT_WEIGHTS,
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateWeights = async (weights: Partial<ScoreWeights>) => {
    try {
      // Atualizar no backend
      const updatedConfig = await api.updateScoreConfig({
        emailOpens: weights.emailOpens,
        linkClicks: weights.linkClicks,
        purchases: weights.purchases,
        ltvDivisor: weights.ltvDivisor,
      });

      // Atualizar estado local
      setConfig({
        weights: {
          emailOpens: Number(updatedConfig.emailOpens),
          linkClicks: Number(updatedConfig.linkClicks),
          purchases: Number(updatedConfig.purchases),
          ltvDivisor: Number(updatedConfig.ltvDivisor),
        },
        lastUpdated: updatedConfig.updatedAt,
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração de score:', error);
      throw error;
    }
  };

  const resetToDefaults = async () => {
    try {
      // Resetar no backend
      const resetConfig = await api.resetScoreConfig();

      // Atualizar estado local
      setConfig({
        weights: {
          emailOpens: Number(resetConfig.emailOpens),
          linkClicks: Number(resetConfig.linkClicks),
          purchases: Number(resetConfig.purchases),
          ltvDivisor: Number(resetConfig.ltvDivisor),
        },
        lastUpdated: resetConfig.updatedAt,
      });
    } catch (error) {
      console.error('Erro ao resetar configuração de score:', error);
      throw error;
    }
  };

  return {
    config,
    updateWeights,
    resetToDefaults,
    isLoading,
  };
}
