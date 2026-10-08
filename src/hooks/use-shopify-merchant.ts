import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { isShopifyEmbedded } from '@/lib/shopify';

export function useShopifyMerchant() {
  const embedded = isShopifyEmbedded();
  const query = useQuery({
    queryKey: ['paymentGateway'],
    queryFn: () => api.getPaymentGateway(),
    staleTime: 60_000,
  });

  return {
    isShopifyMerchant:
      embedded || query.data?.gateway === 'shopify' || query.data?.hasShopifyConnection === true,
    isLoadingShopifyMerchant: !embedded && query.isLoading,
  };
}
