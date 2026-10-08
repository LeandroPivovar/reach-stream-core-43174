import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { ShieldCheck, Download, Loader2, Eye } from 'lucide-react';

/**
 * Solicitações de dados de clientes recebidas da Shopify (customers/data_request).
 *
 * A Shopify repassa o pedido do cliente final ao app; quem responde ao cliente é
 * o merchant, em até 30 dias. Aqui ele vê o que o CRM guarda e baixa o relatório.
 */
export function ShopifyDataRequests() {
  const { toast } = useToast();
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['shopify-data-requests'],
    queryFn: () => api.getShopifyDataRequests(),
  });

  const fetchFull = async (id: number) => {
    setLoadingId(id);
    try {
      return await api.getShopifyDataRequest(id);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível carregar a solicitação.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoadingId(null);
    }
  };

  const handlePreview = async (id: number) => {
    const full = await fetchFull(id);
    if (full) {
      setPreviewData(full.payload);
      setPreviewId(id);
    }
  };

  const handleDownload = async (id: number, shop: string) => {
    const full = await fetchFull(id);
    if (!full) return;

    const blob = new Blob([JSON.stringify(full.payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dados-cliente-${shop}-${id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Solicitações de dados de clientes</h3>
            <p className="text-sm text-muted-foreground">
              Clientes da sua loja pediram os dados que guardamos sobre eles. Você tem até
              30 dias para responder ao cliente com essas informações.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">
                  {r.customerEmail || `Cliente #${r.shopifyCustomerId || '—'}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.shop} · {new Date(r.createdAt).toLocaleDateString('pt-BR')} ·{' '}
                  {r.contactsCount} contato(s), {r.salesCount} venda(s)
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {r.status === 'no_data' && <Badge variant="secondary">Sem dados</Badge>}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(r.id)}
                  disabled={loadingId === r.id}
                >
                  {loadingId === r.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span className="ml-2">Ver</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(r.id, r.shop)}
                  disabled={loadingId === r.id}
                >
                  <Download className="w-4 h-4" />
                  <span className="ml-2">Baixar</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={previewId !== null} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dados do cliente</DialogTitle>
            <DialogDescription>
              Conteúdo que o CRM guarda sobre este cliente. Envie ao cliente para atender à solicitação.
            </DialogDescription>
          </DialogHeader>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[60vh]">
            {previewData ? JSON.stringify(previewData, null, 2) : ''}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}
