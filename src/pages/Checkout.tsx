import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ShieldCheck, ChevronRight, CreditCard, Box, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Plan } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export default function Checkout() {
    const { planId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
        email: user?.email || '',
        document: '',
        postalCode: '',
        address: '',
        phone: user?.phone || '',
        billingType: 'CREDIT_CARD', // 'BOLETO', 'CREDIT_CARD', 'PIX'
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCvc: '',
    });

    const [asaasResult, setAsaasResult] = useState<{ invoiceUrl: string } | null>(null);
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
    const [statusPollingInterval, setStatusPollingInterval] = useState<NodeJS.Timeout | null>(null);

    // Limpar polling ao desmontar
    useEffect(() => {
        return () => {
            if (statusPollingInterval) clearInterval(statusPollingInterval);
        };
    }, [statusPollingInterval]);

    const startPolling = () => {
        const interval = setInterval(async () => {
            try {
                const sub = await api.getCurrentSubscription();
                if (sub && sub.status === 'active') {
                    setIsPaymentConfirmed(true);
                    setStep(5); // Sucesso final
                    if (interval) clearInterval(interval);
                }
            } catch (err) {
                console.error('Error polling subscription status:', err);
            }
        }, 3000); // Polling a cada 3 segundos
        setStatusPollingInterval(interval);
    };

    useEffect(() => {
        const fetchPlan = async () => {
            if (!planId) return navigate('/assinaturas');
            try {
                const plans = await api.getPlans();
                const selected = plans.find(p => p.id === parseInt(planId));
                if (selected) {
                    setPlan(selected);
                } else {
                    navigate('/assinaturas');
                }
            } catch (err) {
                toast({ title: 'Erro', description: 'Plano não encontrado', variant: 'destructive' });
                navigate('/assinaturas');
            } finally {
                setLoadingPlan(false);
            }
        };
        fetchPlan();
    }, [planId, navigate, toast]);

    const handleNextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.document || !formData.address || !formData.phone || !formData.postalCode) {
                return toast({ title: 'Aviso', description: 'Preencha os campos obrigatórios (incluindo CEP).', variant: 'destructive' });
            }
        }
        setStep(p => p + 1);
    };

    const handleConfirmCheckout = async () => {
        if (formData.billingType === 'CREDIT_CARD') {
            if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvc) {
                return toast({ title: 'Aviso', description: 'Preencha os dados do cartão.', variant: 'destructive' });
            }
        }

        setIsSubmitting(true);
        try {
            const result = await api.checkoutPlan({
                planId: parseInt(planId as string),
                name: formData.name,
                document: formData.document,
                address: formData.address,
                phone: formData.phone,
                billingType: formData.billingType as any,
                ...(formData.billingType === 'CREDIT_CARD' ? {
                    creditCard: {
                        holderName: formData.cardName,
                        number: formData.cardNumber.replace(/\s/g, ''),
                        expiryMonth: formData.cardExpiry.split('/')[0] || '',
                        expiryYear: formData.cardExpiry.split('/')[1] ? `20${formData.cardExpiry.split('/')[1]}` : '',
                        ccv: formData.cardCvc
                    },
                    creditCardHolderInfo: {
                        name: formData.name,
                        email: formData.email,
                        cpfCnpj: formData.document,
                        postalCode: formData.postalCode,
                        addressNumber: 'S/N', // Como não temos campo separado, enviamos S/N
                        mobilePhone: formData.phone
                    }
                } : {})
            });

            if (result.asaas?.invoiceUrl) {
                setAsaasResult(result.asaas);
                setStep(4); // Aguardando pagamento
                startPolling();
            } else {
                setStep(5); // Sucesso direto (se não houve Asaas URL, talvez já ativou)
            }
        } catch (error: any) {
            toast({ title: 'Erro', description: error.message || 'Erro ao processar assinatura', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingPlan) {
        return (
            <Layout title="Checkout" subtitle="Identificando Pagamento...">
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    if (!plan) return null;

    const stepClass = (n: number) =>
        step >= n ? 'text-primary' : 'text-muted-foreground';
    const circleClass = (n: number) =>
        `w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= n ? 'border-primary bg-primary/10' : 'border-muted'}`;
    const lineClass = (n: number) =>
        `w-16 h-1 -mt-6 mx-2 ${step >= n ? 'bg-primary' : 'bg-border'}`;

    return (
        <Layout title="Finalizar Assinatura" subtitle="Complete os passos para assinar seu novo plano">
            <div className="max-w-4xl mx-auto mt-6">

                {/* Stepper Header */}
                <div className="flex items-center justify-center mb-10">
                    <div className={`flex flex-col items-center ${stepClass(1)}`}>
                        <div className={circleClass(1)}>
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium mt-2">Dados</span>
                    </div>
                    <div className={lineClass(2)}></div>
                    <div className={`flex flex-col items-center ${stepClass(2)}`}>
                        <div className={circleClass(2)}>
                            <Box className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium mt-2">Revisão</span>
                    </div>
                    <div className={lineClass(3)}></div>
                    <div className={`flex flex-col items-center ${stepClass(3)}`}>
                        <div className={circleClass(3)}>
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium mt-2">Pagamento</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Area (Forms) */}
                    <div className="md:col-span-2 space-y-6">
                        {step === 1 && (
                            <Card className="p-6">
                                <h3 className="text-xl font-bold mb-6">Informações Básicas</h3>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="base_name">Nome Completo *</Label>
                                        <Input id="base_name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="base_email">E-mail</Label>
                                        <Input id="base_email" value={formData.email} disabled className="bg-muted opacity-50" />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="base_doc">CPF / CNPJ *</Label>
                                            <Input id="base_doc" placeholder="Apenas números" value={formData.document} onChange={e => setFormData({ ...formData, document: e.target.value.replace(/\D/g, '') })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="base_phone">Telefone (WhatsApp) *</Label>
                                            <Input id="base_phone" placeholder="Apenas números" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="base_postal">CEP *</Label>
                                            <Input id="base_postal" placeholder="00000-000" value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value.replace(/\D/g, '').substring(0, 8) })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="base_address">Endereço Completo *</Label>
                                            <Input id="base_address" placeholder="Rua, Número, Complemento..." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-8" onClick={handleNextStep}>
                                    Continuar para Revisão <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card className="p-6">
                                <h3 className="text-xl font-bold mb-6">Confirmação de Plano e Pagamento</h3>
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                                    <h4 className="text-2xl font-bold text-primary mb-2">{plan.name}</h4>
                                    <div className="flex items-end space-x-2 mb-4">
                                        <span className="text-4xl font-extrabold">R$ {plan.price.toString().replace('.', ',')}</span>
                                        <span className="text-muted-foreground pb-1">/{plan.interval === 'monthly' ? 'mês' : 'ano'}</span>
                                    </div>
                                    <hr className="my-4 border-primary/10" />
                                    <div className="space-y-4">
                                        <Label className="text-sm font-semibold">Escolha a Forma de Pagamento:</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <Button
                                                variant={formData.billingType === 'CREDIT_CARD' ? 'default' : 'outline'}
                                                className="flex flex-col h-auto py-4 gap-2"
                                                onClick={() => setFormData({ ...formData, billingType: 'CREDIT_CARD' })}
                                            >
                                                <CreditCard className="w-5 h-5" />
                                                <span className="text-[10px]">Cartão</span>
                                            </Button>
                                            <Button
                                                variant={formData.billingType === 'PIX' ? 'default' : 'outline'}
                                                className="flex flex-col h-auto py-4 gap-2"
                                                onClick={() => setFormData({ ...formData, billingType: 'PIX' })}
                                            >
                                                <div className="font-bold text-lg">PIX</div>
                                                <span className="text-[10px]">Instantâneo</span>
                                            </Button>
                                            <Button
                                                variant={formData.billingType === 'BOLETO' ? 'default' : 'outline'}
                                                className="flex flex-col h-auto py-4 gap-2"
                                                onClick={() => setFormData({ ...formData, billingType: 'BOLETO' })}
                                            >
                                                <div className="font-bold text-lg">Boleto</div>
                                                <span className="text-[10px]">Venc. 1 dia</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <Button variant="outline" className="w-1/3" onClick={() => setStep(1)}>Voltar</Button>
                                    <Button className="w-2/3" onClick={formData.billingType === 'CREDIT_CARD' ? handleNextStep : handleConfirmCheckout}>
                                        {formData.billingType === 'CREDIT_CARD' ? 'Dados do Cartão' : 'Gerar Cobrança'} <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card className="p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                    <ShieldCheck className="w-32 h-32" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Dados do Pagamento</h3>
                                <p className="text-sm text-muted-foreground mb-6 flex items-center">
                                    <ShieldCheck className="w-4 h-4 mr-2 text-green-500" /> Transação 100% segura e encriptada.
                                </p>
                                <div className="grid gap-6 relative z-10">
                                    <div className="grid gap-2">
                                        <Label htmlFor="card_number">Número do Cartão de Crédito</Label>
                                        <Input id="card_number" placeholder="0000 0000 0000 0000" maxLength={19} value={formData.cardNumber} onChange={e => setFormData({ ...formData, cardNumber: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="card_name">Nome Impresso no Cartão</Label>
                                        <Input id="card_name" placeholder="NOME DO TITULAR" value={formData.cardName} onChange={e => setFormData({ ...formData, cardName: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="card_expiry">Validade (MM/AA)</Label>
                                            <Input
                                                id="card_expiry"
                                                placeholder="MM/AA"
                                                maxLength={5}
                                                value={formData.cardExpiry}
                                                onChange={e => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (val.length > 2) {
                                                        val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                    }
                                                    setFormData({ ...formData, cardExpiry: val });
                                                }}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="card_cvc">CVV</Label>
                                            <Input id="card_cvc" placeholder="123" maxLength={4} value={formData.cardCvc} onChange={e => setFormData({ ...formData, cardCvc: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3 mt-8">
                                    <Button variant="outline" className="w-1/3" onClick={() => setStep(2)}>Voltar</Button>
                                    <Button className="w-2/3" onClick={handleConfirmCheckout} disabled={isSubmitting}>
                                        {isSubmitting ? 'Processando Pagamento...' : `Finalizar e Pagar R$ ${plan.price}`}
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right Area (Order Summary) */}
                    {step < 4 && (
                        <div className="md:col-span-1">
                            <Card className="p-6 sticky top-6">
                                <h4 className="font-semibold text-lg mb-4">Resumo da Compra</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Plano</span>
                                        <span className="font-medium text-right">{plan.name} ({plan.interval === 'monthly' ? 'Mensal' : 'Anual'})</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>R$ {plan.price.toString().replace('.', ',')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Descontos</span>
                                        <span className="text-green-500">R$ 0,00</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total Hoje</span>
                                        <span>R$ {plan.price.toString().replace('.', ',')}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Step 4 - Waiting for Payment */}
                {step === 4 && (
                    <div className="flex justify-center">
                        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-6 max-w-lg w-full">
                            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                                <Loader2 className="w-14 h-14 text-blue-500 animate-spin" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-3">Aguardando Pagamento</h2>
                                <p className="text-muted-foreground text-lg mb-4">
                                    Identificamos seu pedido. Você receberá uma notificação assim que o pagamento for concluído.
                                </p>
                                <p className="text-blue-600 font-medium">
                                    Esta página será atualizada automaticamente...
                                </p>
                            </div>

                            {asaasResult && (
                                <div className="w-full space-y-4">
                                    <Button className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700" onClick={() => window.open(asaasResult.invoiceUrl, '_blank')}>
                                        Abrir Fatura / Pagar Agora
                                    </Button>
                                    <p className="text-sm text-muted-foreground">
                                        Mantenha esta janela aberta ou acompanhe por e-mail.
                                    </p>
                                </div>
                            )}

                            <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
                                Voltar para o Dashboard
                            </Button>
                        </Card>
                    </div>
                )}

                {/* Step 5 - Success Screen (full width, centered) */}
                {step === 5 && (
                    <div className="flex justify-center">
                        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-6 max-w-lg w-full">
                            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-14 h-14 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-3">Pagamento Aprovado!</h2>
                                <p className="text-muted-foreground text-lg">
                                    Parabéns! Sua assinatura do plano {plan?.name} está ativa.
                                </p>
                            </div>

                            <Button className="w-full py-6 text-lg" onClick={() => navigate('/')}>
                                Ir para o Dashboard
                            </Button>
                        </Card>
                    </div>
                )}
            </div>
        </Layout >
    );
}
