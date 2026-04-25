import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Pencil,
    Trash2,
    ShieldCheck,
    Mail,
    MessageSquare,
    MessageCircle,
    Users,
    Zap,
    Save,
    RefreshCw,
    X,
    CheckCircle2,
    Package
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Plan } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPlans() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
    const [formData, setFormData] = useState<Partial<Plan>>({
        name: '',
        price: 0,
        priceYearly: 0,
        interval: 'monthly',
        features: [],
        limits: {
            contacts: 1000,
            emails: 5000,
            whatsapp: false,
            whatsappLimit: 0,
            sms: 0,
            internalUsers: 1,
            advancedCampaigns: 0
        },
        active: true
    });

    const { data: plans, isLoading } = useQuery({
        queryKey: ['admin-plans'],
        queryFn: () => api.getAdminPlans()
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<Plan>) => api.createAdminPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            toast({ title: 'Sucesso', description: 'Plano criado com sucesso!' });
            setIsModalOpen(false);
        },
        onError: () => toast({ title: 'Erro', description: 'Falha ao criar plano.', variant: 'destructive' })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<Plan> }) => api.updateAdminPlan(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            toast({ title: 'Sucesso', description: 'Plano atualizado com sucesso!' });
            setIsModalOpen(false);
        },
        onError: () => toast({ title: 'Erro', description: 'Falha ao atualizar plano.', variant: 'destructive' })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.deleteAdminPlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            toast({ title: 'Sucesso', description: 'Plano desativado com sucesso!' });
        },
        onError: () => toast({ title: 'Erro', description: 'Falha ao desativar plano.', variant: 'destructive' })
    });

    const handleOpenModal = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({ ...plan });
        } else {
            setEditingPlan(null);
            setFormData({
                name: '',
                price: 0,
                priceYearly: 0,
                interval: 'monthly',
                features: [],
                limits: {
                    contacts: 1000,
                    emails: 5000,
                    whatsapp: false,
                    whatsappLimit: 0,
                    sms: 0,
                    internalUsers: 1,
                    advancedCampaigns: 0
                },
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || formData.price === undefined) {
            toast({ title: 'Erro', description: 'Preencha os campos obrigatórios.', variant: 'destructive' });
            return;
        }

        if (editingPlan?.id) {
            updateMutation.mutate({ id: editingPlan.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleLimitChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            limits: {
                ...prev.limits!,
                [field]: value
            }
        }));
    };

    const toggleFeature = (feature: string) => {
        setFormData(prev => {
            const features = prev.features || [];
            if (features.includes(feature)) {
                return { ...prev, features: features.filter(f => f !== feature) };
            } else {
                return { ...prev, features: [...features, feature] };
            }
        });
    };

    const defaultFeatures = [
        'Gestão de Leads',
        'Relatórios Básicos',
        'Automações Simples',
        'Suporte por E-mail',
        'API de Integração',
        'Campos Personalizados',
        'Segmentação Avançada'
    ];

    // Packages Settings
    const { data: systemSettings } = useQuery({
        queryKey: ['system-settings'],
        queryFn: () => api.getSystemSettings()
    });

    const [packageSettings, setPackageSettings] = useState({
        UNIT_PRICE_WHATSAPP: '0.15',
        UNIT_PRICE_SMS: '0.10',
        UNIT_PRICE_EMAIL: '0.01'
    });

    React.useEffect(() => {
        if (systemSettings) {
            const settings = {};
            systemSettings.forEach(s => {
                if (['UNIT_PRICE_WHATSAPP', 'UNIT_PRICE_SMS', 'UNIT_PRICE_EMAIL'].includes(s.key)) {
                    settings[s.key] = s.value;
                }
            });
            setPackageSettings(prev => ({ ...prev, ...settings }));
        }
    }, [systemSettings]);

    const updateSettingsMutation = useMutation({
        mutationFn: (data: { key: string, value: string }[]) => api.updateSystemSettingsBulk(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-settings'] });
            toast({ title: 'Sucesso', description: 'Preços atualizados com sucesso!' });
        },
        onError: () => toast({ title: 'Erro', description: 'Falha ao atualizar preços.', variant: 'destructive' })
    });

    const handleSavePrices = () => {
        const payload = Object.entries(packageSettings).map(([key, value]) => ({ key, value }));
        updateSettingsMutation.mutate(payload);
    };

    return (
        <AdminLayout
            title="Planos & Pacotes"
            subtitle="Controle os planos, limites e valores dos pacotes adicionais."
        >
            <Tabs defaultValue="plans" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
                    <TabsTrigger value="plans" className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Planos de Assinatura
                    </TabsTrigger>
                    <TabsTrigger value="packages" className="flex items-center gap-2">
                        <Package className="w-4 h-4" /> Pacotes Adicionais
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="plans">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold">Gerenciar Planos</h2>
                        <Button onClick={() => handleOpenModal()} className="gap-2">
                            <Plus className="w-4 h-4" /> Novo Plano
                        </Button>
                    </div>
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans?.map((plan) => (
                            <Card key={plan.id} className={`p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col ${!plan.active && 'opacity-60'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{plan.name}</h3>
                                        <p className="text-2xl font-bold text-primary mt-1">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                                            <span className="text-xs text-slate-500 font-normal">/mês</span>
                                        </p>
                                        <p className="text-sm font-medium text-slate-500">
                                            Anual: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.priceYearly)}
                                        </p>
                                    </div>
                                    <Badge variant={plan.active ? "default" : "secondary"}>
                                        {plan.active ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </div>

                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <span>{plan.limits.contacts.toLocaleString()} contatos</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Mail className="w-4 h-4 text-amber-500" />
                                        <span>{plan.limits.emails.toLocaleString()} e-mails/mês</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <MessageSquare className={`w-4 h-4 ${plan.limits.whatsapp ? 'text-green-500' : 'text-slate-300'}`} />
                                        <span>WhatsApp: {plan.limits.whatsapp ? 'Incluso' : 'Não incluso'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <ShieldCheck className="w-4 h-4 text-purple-500" />
                                        <span>{plan.limits.sms.toLocaleString()} SMS inclusos</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Users className="w-4 h-4 text-teal-500" />
                                        <span>{plan.limits.internalUsers?.toLocaleString() || '1'} Clientes p/ Cadastro</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Zap className="w-4 h-4 text-rose-500" />
                                        <span>{plan.limits.advancedCampaigns === -1 ? 'Campanhas Ilimitadas' : `${plan.limits.advancedCampaigns} Campanhas Avançadas`}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => handleOpenModal(plan)}>
                                        <Pencil className="w-4 h-4" /> Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10"
                                        onClick={() => {
                                            if (confirm('Tem certeza que deseja desativar este plano?')) {
                                                deleteMutation.mutate(plan.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
                </TabsContent>

                <TabsContent value="packages">
                    <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-bold mb-2">Configurar Valores de Pacotes</h2>
                            <p className="text-sm text-slate-500 mb-8">
                                Defina o custo unitário para cada tipo de disparo quando o usuário compra créditos adicionais fora do plano base.
                            </p>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4 text-green-500" />
                                            Preço WhatsApp
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="pl-9"
                                                value={packageSettings.UNIT_PRICE_WHATSAPP}
                                                onChange={e => setPackageSettings(prev => ({ ...prev, UNIT_PRICE_WHATSAPP: e.target.value }))}
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400">Custo por mensagem enviada</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-blue-500" />
                                            Preço SMS
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="pl-9"
                                                value={packageSettings.UNIT_PRICE_SMS}
                                                onChange={e => setPackageSettings(prev => ({ ...prev, UNIT_PRICE_SMS: e.target.value }))}
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400">Custo por crédito de SMS</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-amber-500" />
                                            Preço E-mail
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="pl-9"
                                                value={packageSettings.UNIT_PRICE_EMAIL}
                                                onChange={e => setPackageSettings(prev => ({ ...prev, UNIT_PRICE_EMAIL: e.target.value }))}
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400">Custo por 1.000 e-mails</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                    <Button onClick={handleSavePrices} disabled={updateSettingsMutation.isPending} className="gap-2 px-8">
                                        {updateSettingsMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Salvar Valores
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 bg-slate-50 dark:bg-slate-900 border-dashed border-2">
                            <h3 className="font-bold mb-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <Zap className="w-4 h-4" /> Como funciona?
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Estes valores são usados na tela de "Comprar Créditos" do usuário. Quando ele escolhe uma quantidade, 
                                o sistema multiplica pela base definida aqui para gerar a cobrança no Asaas.
                            </p>
                        </Card>
                        <Card className="p-6 bg-primary/5 border-primary/20 border-2">
                            <h3 className="font-bold mb-2 flex items-center gap-2 text-primary">
                                <ShieldCheck className="w-4 h-4" /> Margem de Lucro
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Lembre-se de considerar os custos das provedoras (Twilio, Zenvia) ao definir os preços para garantir 
                                a rentabilidade da plataforma.
                            </p>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Plano</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Plano Pro"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Valor Mensal (R$)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priceYearly">Valor Anual (R$)</Label>
                                    <Input
                                        id="priceYearly"
                                        type="number"
                                        step="0.01"
                                        value={formData.priceYearly}
                                        onChange={e => setFormData({ ...formData, priceYearly: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Intervalo</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.interval === 'monthly'}
                                            onChange={() => setFormData({ ...formData, interval: 'monthly' })}
                                        />
                                        <span className="text-sm">Mensal</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.interval === 'yearly'}
                                            onChange={() => setFormData({ ...formData, interval: 'yearly' })}
                                        />
                                        <span className="text-sm">Anual</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Label className="mb-3 block text-primary font-bold">Limites</Label>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="limit-contacts">Contatos</Label>
                                        <Input
                                            id="limit-contacts"
                                            type="number"
                                            value={formData.limits?.contacts}
                                            onChange={e => handleLimitChange('contacts', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="limit-emails">E-mails/mês</Label>
                                        <Input
                                            id="limit-emails"
                                            type="number"
                                            value={formData.limits?.emails}
                                            onChange={e => handleLimitChange('emails', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="limit-sms">SMS inclusos</Label>
                                        <Input
                                            id="limit-sms"
                                            type="number"
                                            value={formData.limits?.sms}
                                            onChange={e => handleLimitChange('sms', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="limit-users">Nº Usuários Internos (Clientes)</Label>
                                        <Input
                                            id="limit-users"
                                            type="number"
                                            value={formData.limits?.internalUsers}
                                            onChange={e => handleLimitChange('internalUsers', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="limit-adv">Campanhas Avançadas (-1 = ilimitado)</Label>
                                        <Input
                                            id="limit-adv"
                                            type="number"
                                            value={formData.limits?.advancedCampaigns}
                                            onChange={e => handleLimitChange('advancedCampaigns', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox
                                            id="limit-whatsapp"
                                            checked={formData.limits?.whatsapp}
                                            onCheckedChange={checked => handleLimitChange('whatsapp', checked)}
                                        />
                                        <Label htmlFor="limit-whatsapp" className="cursor-pointer font-semibold">Incluir WhatsApp</Label>
                                    </div>
                                    {formData.limits?.whatsapp && (
                                        <div className="space-y-2 pl-6 border-l-2 border-primary/20 animate-in slide-in-from-left-1">
                                            <Label htmlFor="limit-whatsapp-qty">Créditos de WhatsApp inclusos</Label>
                                            <Input
                                                id="limit-whatsapp-qty"
                                                type="number"
                                                placeholder="Ex: 500"
                                                value={formData.limits?.whatsappLimit}
                                                onChange={e => handleLimitChange('whatsappLimit', parseInt(e.target.value))}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Funcionalidades Exibidas</Label>
                            <div className="grid grid-cols-1 gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                {defaultFeatures.map(feature => (
                                    <div key={feature} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`feat-${feature}`}
                                            checked={formData.features?.includes(feature)}
                                            onCheckedChange={() => toggleFeature(feature)}
                                        />
                                        <Label htmlFor={`feat-${feature}`} className="cursor-pointer text-sm">{feature}</Label>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="plan-active"
                                        checked={formData.active}
                                        onCheckedChange={checked => setFormData({ ...formData, active: !!checked })}
                                    />
                                    <Label htmlFor="plan-active" className="cursor-pointer">Plano Ativo (visível para usuários)</Label>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                                <p className="text-xs text-slate-500 italic">
                                    Dica: Planos com valor R$ 0,00 podem ser usados como planos de teste ou gratuitos ("Free Tier").
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} className="gap-2">
                            <Save className="w-4 h-4" /> Salvar Plano
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
