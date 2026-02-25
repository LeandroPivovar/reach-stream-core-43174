import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ShieldCheck, ChevronRight, CreditCard, Box, User as UserIcon } from 'lucide-react';
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
        address: '',
        phone: user?.phone || '',
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCvc: '',
    });

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
            if (!formData.name || !formData.document || !formData.address || !formData.phone) {
                return toast({ title: 'Aviso', description: 'Preencha os campos obrigatórios.', variant: 'destructive' });
            }
        }
        setStep(p => p + 1);
    };

    const handleConfirmCheckout = async () => {
        if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvc) {
            return toast({ title: 'Aviso', description: 'Preencha os dados do cartão.', variant: 'destructive' });
        }

        setIsSubmitting(true);
        try {
            await api.checkoutPlan({
                planId: parseInt(planId as string),
                name: formData.name,
                document: formData.document,
                address: formData.address,
                phone: formData.phone
            });
            setStep(4);
        } catch (error) {
            toast({ title: 'Aviso', description: 'Erro ao processar assinatura', variant: 'destructive' });
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
                                    <div className="grid gap-2">
                                        <Label htmlFor="base_address">Endereço Completo *</Label>
                                        <Input id="base_address" placeholder="Rua, Número, Complemento, CEP..." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                    </div>
                                </div>
                                <Button className="w-full mt-8" onClick={handleNextStep}>
                                    Continuar para Revisão <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card className="p-6">
                                <h3 className="text-xl font-bold mb-6">Confirmação do Plano</h3>
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                                    <h4 className="text-2xl font-bold text-primary mb-2">{plan.name}</h4>
                                    <div className="flex items-end space-x-2 mb-4">
                                        <span className="text-4xl font-extrabold">R$ {plan.price.toString().replace('.', ',')}</span>
                                        <span className="text-muted-foreground pb-1">/{plan.interval === 'monthly' ? 'mês' : 'ano'}</span>
                                    </div>
                                    <hr className="my-4 border-primary/10" />
                                    <ul className="space-y-3">
                                        {Array.isArray(plan.features) && plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center space-x-3">
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                                <span className="text-sm font-medium">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex space-x-3">
                                    <Button variant="outline" className="w-1/3" onClick={() => setStep(1)}>Voltar</Button>
                                    <Button className="w-2/3" onClick={handleNextStep}>
                                        Ir para Pagamento <ChevronRight className="w-4 h-4 ml-2" />
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
                                            <Label htmlFor="card_expiry">Validade</Label>
                                            <Input id="card_expiry" placeholder="MM/AA" maxLength={5} value={formData.cardExpiry} onChange={e => setFormData({ ...formData, cardExpiry: e.target.value })} />
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

                        {step === 4 && (
                            <Card className="p-10 text-center flex flex-col items-center justify-center space-y-6">
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Pagamento Aprovado!</h2>
                                    <p className="text-muted-foreground text-lg">Parabéns! Sua assinatura do plano <b>{plan.name}</b> está ativa.</p>
                                </div>
                                <Button className="mt-8 px-8 py-6 text-lg" onClick={() => navigate('/')}>
                                    Acessar o Dashboard
                                </Button>
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
            </div>
        </Layout>
    );
}
