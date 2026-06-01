import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchBotFlowById, type BotFlowDetail } from '@/lib/bot-flow-api';
import { getBotFlowChannel } from '@/lib/bot-flow-channels';
import {
  ArrowLeft,
  Loader2,
  QrCode,
  Settings,
  Smartphone,
  Key,
  Instagram,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBotFlowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [flow, setFlow] = useState<BotFlowDetail | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await fetchBotFlowById(Number(id));
        setFlow(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!flow) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Fluxo não encontrado.</p>
        <Button className="mt-4" onClick={() => navigate('/admin/bot-builder')}>
          Voltar
        </Button>
      </AdminLayout>
    );
  }

  const channelMeta = getBotFlowChannel(flow.channel);

  return (
    <AdminLayout>
      <Button variant="ghost" className="mb-4 gap-2 -ml-2" onClick={() => navigate('/admin/bot-builder')}>
        <ArrowLeft className="w-4 h-4" />
        Meus fluxos
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{flow.name}</h1>
            <Badge variant={flow.isActive ? 'default' : 'secondary'}>
              {flow.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <p className="text-muted-foreground">{channelMeta?.label ?? flow.channel}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/admin/bot-builder/${flow.id}/edit`)} className="gap-2">
          <Settings className="w-4 h-4" />
          Editar fluxo
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <ConnectPanel channel={flow.channel} flowName={flow.name} />
        <SimulatorPanel />
      </div>
    </AdminLayout>
  );
}

function ConnectPanel({ channel, flowName }: { channel: string; flowName: string }) {
  switch (channel) {
    case 'whatsapp_qr':
      return (
        <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
          <div className="space-y-4 w-full max-w-sm">
            <h3 className="text-xl font-semibold">WhatsApp — QR dinâmico</h3>
            <p className="text-sm text-muted-foreground">
              Abra o WhatsApp no celular, vá em Aparelhos conectados e escaneie o código para o fluxo &quot;{flowName}&quot;.
            </p>
            <div className="bg-white p-4 rounded-xl inline-block mx-auto border-2 border-slate-200">
              <QrCode className="w-48 h-48 text-slate-800" strokeWidth={1} />
            </div>
            <Button className="w-full" variant="secondary" onClick={() => toast.success('Novo QR Code gerado! (Simulação)')}>
              Gerar novo QR Code
            </Button>
          </div>
        </Card>
      );
    case 'whatsapp_api':
      return (
        <Card className="p-8 min-h-[400px]">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="w-5 h-5" />
              WhatsApp — API oficial
            </CardTitle>
            <CardDescription>
              Conecte sua conta Meta Business (Phone Number ID, Access Token e Webhook).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <Button className="w-full" onClick={() => toast.info('Integração Meta em breve')}>
              Conectar conta Meta Business
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Requer app aprovado na Meta e número verificado.
            </p>
          </CardContent>
        </Card>
      );
    case 'instagram_direct':
      return (
        <Card className="p-8 min-h-[400px]">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Instagram className="w-5 h-5" />
              Direct Instagram
            </CardTitle>
            <CardDescription>
              Autorize o Núcleo CRM a responder mensagens do Direct da sua conta profissional.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Button className="w-full" onClick={() => toast.info('Integração Instagram em breve')}>
              Conectar Instagram
            </Button>
          </CardContent>
        </Card>
      );
    case 'telegram':
      return (
        <Card className="p-8 min-h-[400px]">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="w-5 h-5" />
              Telegram
            </CardTitle>
            <CardDescription>
              Cole o token do seu bot criado no @BotFather para ativar este fluxo.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <Button className="w-full" onClick={() => toast.info('Integração Telegram em breve')}>
              Conectar bot Telegram
            </Button>
          </CardContent>
        </Card>
      );
    default:
      return (
        <Card className="p-8">
          <p className="text-muted-foreground">Canal não configurado.</p>
        </Card>
      );
  }
}

function SimulatorPanel() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="bg-slate-50 border-b dark:bg-slate-900/50">
        <CardTitle className="text-base flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          Simulador do Bot
        </CardTitle>
        <CardDescription>Prévia visual do chat para testar o fluxo.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 bg-slate-100 dark:bg-slate-900/30 p-4 min-h-[400px] flex flex-col justify-end gap-3">
        <div className="flex justify-start">
          <div className="bg-white dark:bg-slate-800 rounded-lg rounded-tl-none p-3 max-w-[80%] shadow-sm text-sm">
            Olá! Como posso ajudar você hoje?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none p-3 max-w-[80%] shadow-sm text-sm">
            Gostaria de saber mais sobre o sistema.
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="bg-white dark:bg-slate-800 h-10 rounded-full border px-4 flex items-center text-sm text-muted-foreground">
            Digite uma mensagem...
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
