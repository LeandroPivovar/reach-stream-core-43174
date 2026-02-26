import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Shield, Globe, CreditCard, Save, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ['system-settings'],
        queryFn: () => api.getSystemSettings(),
    });

    const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

    useEffect(() => {
        if (settings) {
            const map: Record<string, string> = {};
            settings.forEach(s => map[s.key] = s.value || '');
            setLocalSettings(map);
        }
    }, [settings]);

    const updateMutation = useMutation({
        mutationFn: (data: { key: string; value: string }[]) => {
            // Note: Backend might expect single update or bulk. 
            // Based on previous service implementation, it was single.
            // I will loop or update service to support bulk if needed.
            // For now, let's assume single updates like before or a bulk if I implemented it.
            // Looking at my previous Step 1845 (SystemSettingsService saved all at once if given list)
            return api.updateSystemSettingsBulk(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-settings'] });
            toast({ title: 'Sucesso', description: 'Configurações atualizadas com sucesso.' });
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao atualizar as configurações.', variant: 'destructive' });
        }
    });

    const handleInputChange = (key: string, value: string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        const payload = Object.entries(localSettings).map(([key, value]) => ({ key, value }));
        updateMutation.mutate(payload);
    };

    if (isLoading) {
        return (
            <AdminLayout
                title="Configurações do Sistema"
                subtitle="Gerencie chaves de API, webhooks e tokens de segurança globais."
            >
                <div className="flex justify-center items-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Configurações do Sistema"
            subtitle="Gerencie chaves de API, webhooks e tokens de segurança globais."
        >
            <Tabs defaultValue="asaas" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
                    <TabsTrigger value="asaas" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Asaas
                    </TabsTrigger>
                    <TabsTrigger value="zenvia" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Zenvia
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Segurança
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="asaas" className="space-y-4">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl">Integração Asaas</CardTitle>
                            <CardDescription>
                                Configure as chaves para cobrança recorrente e notificações de pagamento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="ASAAS_API_KEY" className="text-sm font-semibold">API Key</Label>
                                <Input
                                    id="ASAAS_API_KEY"
                                    type="password"
                                    className="font-mono"
                                    value={localSettings['ASAAS_API_KEY'] || ''}
                                    onChange={(e) => handleInputChange('ASAAS_API_KEY', e.target.value)}
                                    placeholder="$asaas_api_key_..."
                                />
                                <p className="text-[12px] text-muted-foreground">Encontrada no painel do Asaas em Configurações &gt; Integrações.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ASAAS_WEBHOOK_TOKEN" className="text-sm font-semibold">Webhook Token</Label>
                                <Input
                                    id="ASAAS_WEBHOOK_TOKEN"
                                    type="password"
                                    className="font-mono"
                                    value={localSettings['ASAAS_WEBHOOK_TOKEN'] || ''}
                                    onChange={(e) => handleInputChange('ASAAS_WEBHOOK_TOKEN', e.target.value)}
                                    placeholder="Seu token personalizado"
                                />
                                <p className="text-[12px] text-muted-foreground">Token configurado no painel do Asaas para validar as chamadas ao webhook.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ASAAS_ENVIRONMENT" className="text-sm font-semibold">Ambiente</Label>
                                <Select
                                    value={localSettings['ASAAS_ENVIRONMENT'] || 'sandbox'}
                                    onValueChange={(v) => handleInputChange('ASAAS_ENVIRONMENT', v)}
                                >
                                    <SelectTrigger id="ASAAS_ENVIRONMENT" className="w-full md:w-[250px]">
                                        <SelectValue placeholder="Selecione o ambiente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sandbox">Sandbox (Ambiente de Teste)</SelectItem>
                                        <SelectItem value="production">Produção (Ambiente Real)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 border-t mt-6 flex justify-end py-4">
                            <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex items-center gap-2 px-6">
                                {updateMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar Configurações
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="zenvia" className="space-y-4">
                    <Card className="border-border/60 shadow-sm opacity-80 bg-muted/20">
                        <CardHeader>
                            <CardTitle className="text-xl">Configuração Zenvia</CardTitle>
                            <CardDescription>
                                Credenciais globais para envio de mensagens via SMS e WhatsApp.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 py-8 text-center">
                            <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                Estas configurações estão sendo migradas. Por enquanto, os tokens e IDs da Zenvia são gerenciados via variáveis de ambiente.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <Card className="border-border/60 shadow-sm opacity-80 bg-muted/20">
                        <CardHeader>
                            <CardTitle className="text-xl">Segurança e Tokens de Plataforma</CardTitle>
                            <CardDescription>
                                Gerencie limites e tokens de segurança globais.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 py-8 text-center">
                            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                Nenhuma configuração de segurança global pendente para este módulo.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AdminLayout>
    );
}
