import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchBotFlows, deleteBotFlow, type BotFlowListItem } from '@/lib/bot-flow-api';
import { getBotFlowChannel } from '@/lib/bot-flow-channels';
import { GitBranch, Loader2, Plus, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminBotDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [flows, setFlows] = useState<BotFlowListItem[]>([]);

  const loadFlows = useCallback(async () => {
    try {
      const list = await fetchBotFlows();
      setFlows(list);
    } catch (err) {
      console.error('Error fetching flows:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const handleDelete = async (e: React.MouseEvent, flow: BotFlowListItem) => {
    e.stopPropagation();
    if (!window.confirm(`Excluir o fluxo "${flow.name}"?`)) return;
    const ok = await deleteBotFlow(flow.id);
    if (ok) {
      toast.success('Fluxo excluído');
      setFlows((prev) => prev.filter((f) => f.id !== flow.id));
    } else {
      toast.error('Não foi possível excluir o fluxo');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Construtor de Bot</h1>
          <p className="text-muted-foreground">
            Gerencie fluxos por canal: WhatsApp, Instagram Direct ou Telegram.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/bot-builder/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo fluxo
        </Button>
      </div>

      {flows.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <GitBranch className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Nenhum fluxo criado</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Escolha o canal (WhatsApp QR, API oficial, Instagram ou Telegram) e monte seu fluxo de mensagens.
            </p>
            <Button size="lg" onClick={() => navigate('/admin/bot-builder/new')} className="gap-2">
              <Plus className="w-5 h-5" />
              Criar primeiro fluxo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flows.map((flow) => {
            const channelMeta = getBotFlowChannel(flow.channel);
            const Icon = channelMeta?.icon ?? GitBranch;
            return (
              <Card
                key={flow.id}
                className="cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => navigate(`/admin/bot-builder/${flow.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        'p-2 rounded-lg border',
                        channelMeta?.colorClass ?? 'bg-muted',
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={(e) => handleDelete(e, flow)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base line-clamp-1">{flow.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {channelMeta?.label ?? flow.channel}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant={flow.isActive ? 'default' : 'secondary'}>
                      {flow.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {flow.nodeCount} {flow.nodeCount === 1 ? 'nó' : 'nós'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end mt-3 text-primary text-sm font-medium">
                    Conectar / testar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
