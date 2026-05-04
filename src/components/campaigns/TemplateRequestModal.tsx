import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { QrCode, CreditCard, ShieldCheck, Loader2, ChevronRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface TemplateRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function TemplateRequestModal({ isOpen, onClose, onSuccess }: TemplateRequestModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: Text, 2: Payment config, 3: Success/QR
    const [content, setContent] = useState('');
    const [billingType, setBillingType] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState<any>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });

    const [billingInfo, setBillingInfo] = useState({
        document: user?.document || '',
        phone: user?.phone || '',
        postalCode: user?.postalCode || '',
        address: user?.address || ''
    });

    const totalValue = (49.90).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Sync billing info if user data arrives
    useEffect(() => {
        if (user) {
            setBillingInfo(prev => ({
                ...prev,
                document: prev.document || user.document || '',
                phone: prev.phone || user.phone || '',
                postalCode: prev.postalCode || user.postalCode || '',
                address: prev.address || user.address || ''
            }));
        }
    }, [user]);

    // Reset state
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setQrCode(null);
            setPaymentSuccess(false);
            setLoading(false);
            setContent('');
        }
    }, [isOpen]);

    const handleNext = () => {
        if (step === 1) {
            if (content.length < 10) {
                toast.error('Descreva melhor o que você precisa no template.');
                return;
            }
            setStep(2);
        }
    };

    const handleBuy = async () => {
        if (billingType === 'CREDIT_CARD') {
            if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvc) {
                toast.error('Preencha todos os dados do cartão.');
                return;
            }
            if (!billingInfo.document || !billingInfo.postalCode || !billingInfo.address) {
                toast.error('Preencha as informações de cobrança.');
                return;
            }
        }

        try {
            setLoading(true);

            let expiryMonth = '';
            let expiryYear = '';
            if (cardData.expiry) {
                const parts = cardData.expiry.split('/');
                if (parts.length === 2) {
                    expiryMonth = parts[0].trim();
                    let yearStr = parts[1].trim();
                    if (yearStr.length === 2) yearStr = `20${yearStr}`;
                    expiryYear = yearStr;
                }
            }

            const response = await api.buyTemplateRequest({
                content,
                billingType,
                ...(billingType === 'CREDIT_CARD' && {
                    creditCard: {
                        holderName: cardData.name,
                        number: cardData.number.replace(/\s/g, ''),
                        expiryMonth,
                        expiryYear,
                        ccv: cardData.cvc
                    },
                    creditCardHolderInfo: {
                        name: cardData.name,
                        email: user?.email,
                        cpfCnpj: billingInfo.document.replace(/\D/g, ''),
                        postalCode: billingInfo.postalCode.replace(/\D/g, ''),
                        addressNumber: 'S/N',
                        phone: billingInfo.phone.replace(/\D/g, '')
                    }
                })
            });

            if (billingType === 'PIX' && response.qrCode) {
                setQrCode(response.qrCode);
                setStep(3);
            } else if (billingType === 'CREDIT_CARD') {
                setPaymentSuccess(true);
                setStep(3);
                toast.success('Solicitação realizada com sucesso! Você pode acompanhar pelo painel admin (ou em breve na listagem).');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 3000);
            }
        } catch (error: any) {
            toast.error(error.message || 'Falha ao processar solicitação de template.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[98vw] max-w-[600px] max-h-[98vh] p-0 overflow-hidden bg-background flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-br from-whatsapp/10 via-background to-background p-6 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-whatsapp/20 flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-whatsapp" />
                        </div>
                        <div className="text-right">
                            <span className="text-sm text-muted-foreground mr-1">Valor Fixo</span>
                            <span className="text-2xl font-bold font-mono tracking-tight text-primary">R$ 49,90</span>
                        </div>
                    </div>
                    <DialogTitle className="text-xl font-bold text-foreground">Solicitar Novo Template</DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1 text-[15px]">
                        Especifique o texto do template de WhatsApp que você precisa. Nossa equipe vai processá-lo e o disponibilizará para uso.
                    </DialogDescription>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Setup Progress */}
                    {step < 3 && (
                        <div className="flex items-center gap-2 mb-6">
                            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                        </div>
                    )}

                    {/* Step 1: Text Content */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <Label>Conteúdo do Template</Label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Ex: Olá {{nome_cliente}}, seu pedido #{{numero_pedido}} foi confirmado! Acompanhe em: {{link_rastreio}}"
                                    className="min-h-[150px] resize-none"
                                />
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 space-y-2">
                                    <h4 className="font-medium text-sm text-blue-800 dark:text-blue-300">💡 Como usar variáveis</h4>
                                    <p className="text-xs text-blue-600/80 dark:text-blue-400 text-balance leading-relaxed">
                                        Para que possamos criar seu template da forma correta, indique no texto onde deseja colocar as <b>variáveis flexíveis</b>. Utilize duas chaves em volta do nome: <code>{`{{variavel}}`}</code>. Exemplo: <code>{`Olá {{nome_da_pessoa}}`}</code>. Elas poderão ser substituídas dinamicamente em suas campanhas.
                                    </p>
                                </div>
                            </div>

                            <Button onClick={handleNext} className="w-full h-12 text-md font-medium group transition-all" size="lg">
                                Prosseguir
                                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Checkout */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <Label>Método de Pagamento</Label>
                                <RadioGroup value={billingType} onValueChange={(v: any) => setBillingType(v)} className="grid grid-cols-2 gap-4">
                                    <Label
                                        className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${billingType === 'PIX' ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:bg-muted/50'}`}
                                    >
                                        <RadioGroupItem value="PIX" className="sr-only" />
                                        <QrCode className="h-6 w-6 mb-2 text-slate-700 dark:text-slate-300" />
                                        <span className="font-medium">PIX</span>
                                        <span className="text-[10px] text-emerald-600 font-medium mt-1">Imediato</span>
                                    </Label>
                                    <Label
                                        className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${billingType === 'CREDIT_CARD' ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:bg-muted/50'}`}
                                    >
                                        <RadioGroupItem value="CREDIT_CARD" className="sr-only" />
                                        <CreditCard className="h-6 w-6 mb-2 text-slate-700 dark:text-slate-300" />
                                        <span className="font-medium">Cartão</span>
                                        <span className="text-[10px] text-primary font-bold mt-1 uppercase">À Vista</span>
                                    </Label>
                                </RadioGroup>
                            </div>

                            {billingType === 'CREDIT_CARD' && (
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label>Número do Cartão</Label>
                                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <Input
                                            placeholder="0000 0000 0000 0000"
                                            value={cardData.number}
                                            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Validade</Label>
                                            <Input
                                                placeholder="MM/AA"
                                                value={cardData.expiry}
                                                onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>CVC</Label>
                                            <Input
                                                type="password"
                                                placeholder="123"
                                                maxLength={4}
                                                value={cardData.cvc}
                                                onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nome Impresso</Label>
                                        <Input
                                            placeholder="NOME COMO NO CARTÃO"
                                            value={cardData.name}
                                            onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>CPF/CNPJ do Titular</Label>
                                            <Input
                                                placeholder="000.000.000-00"
                                                value={billingInfo.document}
                                                onChange={(e) => setBillingInfo({ ...billingInfo, document: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>CEP do Titular</Label>
                                            <Input
                                                placeholder="00000-000"
                                                value={billingInfo.postalCode}
                                                onChange={(e) => setBillingInfo({ ...billingInfo, postalCode: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                                <Card className="p-3 bg-primary/5 mb-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-xs font-semibold block">Total Compra:</span>
                                            <span className="text-[10px] text-primary font-bold uppercase">Pagamento à Vista</span>
                                        </div>
                                        <span className="text-sm font-bold text-primary">{totalValue}</span>
                                    </div>
                                </Card>

                                <div className="flex gap-3">
                                    <Button variant="outline" className="h-12 w-full" onClick={() => setStep(1)} disabled={loading}>
                                        Voltar
                                    </Button>
                                    <Button onClick={handleBuy} className="w-full h-12 text-md font-medium" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            `Pagar Agora`
                                        )}
                                    </Button>
                                </div>
                        </div>
                    )}

                    {/* Step 3: Success or PIX QR */}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-300">
                            {billingType === 'PIX' ? (
                                <>
                                    <div className="bg-muted min-h-[300px] w-[300px] rounded-xl flex items-center justify-center p-4">
                                        {qrCode?.encodedImage ? (
                                            <img src={`data:image/png;base64,${qrCode.encodedImage}`} alt="QR Code PIX" className="w-full h-full object-contain" />
                                        ) : (
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        )}
                                    </div>
                                    <p className="mt-6 text-sm text-muted-foreground">
                                        Escaneie o QR Code com o aplicativo do seu banco para pagar.
                                    </p>
                                    {qrCode?.payload && (
                                        <div className="mt-4 w-full flex gap-2">
                                            <Input readOnly value={qrCode.payload} className="font-mono text-xs" />
                                            <Button variant="secondary" onClick={() => {
                                                navigator.clipboard.writeText(qrCode.payload);
                                                toast.success('Código PIX copiado!');
                                            }}>
                                                Copiar
                                            </Button>
                                        </div>
                                    )}
                                    <Button className="w-full mt-6 h-12" onClick={() => { onClose(); onSuccess(); }}>
                                        Fechar e Aguardar Pagamento
                                    </Button>
                                </>
                            ) : paymentSuccess ? (
                                <>
                                    <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">Pagamento Confirmado!</h3>
                                    <p className="text-muted-foreground mt-2 max-w-[280px]">
                                        Sua solicitação de template foi recebida com sucesso.
                                    </p>
                                    <Button className="w-full mt-8 h-12" onClick={() => { onClose(); onSuccess(); }}>
                                        Finalizar
                                    </Button>
                                </>
                            ) : null}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
