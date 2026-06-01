import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, QrCode, Smartphone, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBotDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasFlow, setHasFlow] = useState(false);

  useEffect(() => {
    const fetchFlow = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/bot-flows', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const flow = await res.json();
          // if flow has nodes, we consider it configured
          if (flow && flow.nodes && flow.nodes.length > 0) {
            setHasFlow(true);
          }
        }
      } catch (err) {
        console.error('Error fetching flow:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlow();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!hasFlow) {
    return (
      <AdminLayout>
        <div className="flex flex-col h-[calc(100vh-10rem)] items-center justify-center space-y-6">
          <div className="p-6 bg-primary/10 rounded-full">
            <Smartphone className="w-12 h-12 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Construtor de Bot</h2>
            <p className="text-muted-foreground max-w-md">
              Você ainda não possui um fluxo configurado. Crie mensagens automáticas, imagens e condicionais para seu WhatsApp.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate('/admin/bot-builder/edit')} className="gap-2">
            <Plus className="w-5 h-5" />
            Criar meu fluxo
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testar Bot</h1>
          <p className="text-muted-foreground">Conecte seu WhatsApp para testar o fluxo configurado.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/bot-builder/edit')} className="gap-2">
          <Settings className="w-4 h-4" />
          Editar Fluxo
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* QR Code Section */}
        <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
          <div className="space-y-4 w-full max-w-sm">
            <h3 className="text-xl font-semibold">Conecte-se para iniciar o bot agora mesmo</h3>
            <p className="text-sm text-muted-foreground">
              Abra o WhatsApp no seu celular, vá em Aparelhos conectados e escaneie o código abaixo.
            </p>
            
            <div className="bg-white p-4 rounded-xl inline-block mx-auto border-2 border-slate-200">
              <QrCode className="w-48 h-48 text-slate-800" strokeWidth={1} />
            </div>

            <Button 
              className="w-full mt-4" 
              variant="secondary"
              onClick={() => toast.success('Novo QR Code gerado! (Simulação)')}
            >
              Gerar novo QR Code
            </Button>
          </div>
        </Card>

        {/* Visual Tester Section */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Simulador do Bot
            </CardTitle>
            <CardDescription>Esta é apenas uma prévia visual do chat.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 bg-slate-100 p-4 min-h-[400px] flex flex-col justify-end gap-3">
            <div className="flex justify-start">
              <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-[80%] shadow-sm text-sm">
                Olá! Como posso ajudar você hoje?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none p-3 max-w-[80%] shadow-sm text-sm">
                Gostaria de saber mais sobre o sistema.
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-[80%] shadow-sm text-sm">
                Claro! O Núcleo CRM é perfeito para gerenciar seus contatos.
              </div>
            </div>
            
            {/* Input area mock */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
              <div className="flex-1 bg-white h-10 rounded-full border px-4 flex items-center text-sm text-muted-foreground">
                Digite uma mensagem...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
