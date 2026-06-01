import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BOT_FLOW_CHANNELS, type BotFlowChannel } from '@/lib/bot-flow-channels';
import { createBotFlow } from '@/lib/bot-flow-api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminBotCreateFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [channel, setChannel] = useState<BotFlowChannel | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!channel || !name.trim()) {
      toast.error('Selecione o canal e informe o nome do fluxo');
      return;
    }
    setSaving(true);
    try {
      const flow = await createBotFlow({ name: name.trim(), channel });
      if (!flow) {
        toast.error('Erro ao criar fluxo');
        return;
      }
      toast.success('Fluxo criado! Agora monte as mensagens.');
      navigate(`/admin/bot-builder/${flow.id}/edit`);
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <Button variant="ghost" className="mb-4 gap-2 -ml-2" onClick={() => navigate('/admin/bot-builder')}>
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Novo fluxo</h1>
        <p className="text-muted-foreground mb-8">
          {step === 1
            ? 'Passo 1 de 2 — Escolha por qual canal este bot vai atuar'
            : 'Passo 2 de 2 — Dê um nome para identificar este fluxo'}
        </p>

        {step === 1 && (
          <div className="grid gap-3">
            {BOT_FLOW_CHANNELS.map((opt) => {
              const Icon = opt.icon;
              const selected = channel === opt.id;
              return (
                <Card
                  key={opt.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    selected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40',
                  )}
                  onClick={() => setChannel(opt.id)}
                >
                  <CardHeader className="flex flex-row items-center gap-4 py-4">
                    <div className={cn('p-3 rounded-lg border shrink-0', opt.colorClass)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{opt.label}</CardTitle>
                      <CardDescription>{opt.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
            <Button
              className="mt-4"
              disabled={!channel}
              onClick={() => {
                const label = BOT_FLOW_CHANNELS.find((c) => c.id === channel)?.label ?? '';
                if (!name) setName(`Fluxo ${label.split('—')[0].trim()}`);
                setStep(2);
              }}
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && channel && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flow-name">Nome do fluxo</Label>
                <Input
                  id="flow-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Atendimento inadimplentes"
                  maxLength={150}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Canal: <strong>{BOT_FLOW_CHANNELS.find((c) => c.id === channel)?.label}</strong>
              </p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button onClick={handleCreate} disabled={saving || !name.trim()} className="flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar e editar fluxo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
