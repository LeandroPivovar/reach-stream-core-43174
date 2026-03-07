import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Smartphone, Mail, QrCode, CreditCard, ShieldCheck, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface BuyCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function BuyCreditsModal({ isOpen, onClose, onSuccess }: BuyCreditsModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: Config, 2: Checkout (if Card), 3: Success/QR
    const [creditType, setCreditType] = useState<'email' | 'sms'>('email');
    const [amount, setAmount] = useState<number>(1000);
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

    const pricePerUnit = creditType === 'email' ? 0.30 : 0.40;
    const totalValue = (amount * pricePerUnit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
        }
    }, [isOpen]);

    useEffect(() => {
        if (creditType === 'email') setAmount(1000);
        else setAmount(500);
    }, [creditType]);

    const handleBuy = async () => {
        if (amount < 100) {
            toast.error('A quantidade mínima é de 100 créditos.');
            return;
        }

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
            const res = await api.buyCredits({
                type: creditType,
                amount,
                billingType,
                ...(billingType === 'CREDIT_CARD' ? {
                    creditCard: {
                        holderName: cardData.name,
                        number: cardData.number.replace(/\s/g, ''),
                        expiryMonth: cardData.expiry.split('/')[0] || '',
                        expiryYear: cardData.expiry.split('/')[1] ? `20${cardData.expiry.split('/')[1]}` : '',
                        ccv: cardData.cvc
                    },
                    creditCardHolderInfo: {
                        name: cardData.name,
                        email: user?.email,
                        cpfCnpj: billingInfo.document,
                        postalCode: billingInfo.postalCode,
                        addressNumber: 'S/N',
                        mobilePhone: billingInfo.phone || user?.phone
                    }
                } : {})
            });

            if (res.success) {
                if (billingType === 'PIX' && res.qrCode) {
                    setQrCode(res.qrCode);
                    setStep(3);
                    toast.success('QR Code gerado com sucesso!');
                } else if (billingType === 'CREDIT_CARD') {
                    setPaymentSuccess(true);
                    setStep(3);
                    toast.success('Pagamento processado com sucesso!');
                    onSuccess();
                } else {
                    toast.success('Cobrança gerada com sucesso! Verifique seu email.');
                    onSuccess();
                    onClose();
                }
            } else {
                toast.error('Erro ao processar pagamento.');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Erro ao processar compra de créditos.');
        } finally {
            setLoading(false);
        }
    };

    const copyPixCode = () => {
        if (qrCode?.payload) {
            navigator.clipboard.writeText(qrCode.payload);
            toast.success('Código PIX Copia e Cola copiado!');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={billingType === 'CREDIT_CARD' && step === 2 ? "sm:max-w-[600px]" : "sm:max-w-[500px]"}>
                <DialogHeader>
                    <DialogTitle>Comprar Créditos Avulsos</DialogTitle>
                    <DialogDescription>
                        {step === 3 ? 'Pagamento' : 'Adicione saldo para disparos extras caso o limite do seu plano acabe. Os créditos não expiram.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-3">
                            <Label>Tipo de Crédito</Label>
                            <RadioGroup value={creditType} onValueChange={(val: 'email' | 'sms') => setCreditType(val)} className="flex space-x-4">
                                <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                    <RadioGroupItem value="email" id="c_email" />
                                    <Label htmlFor="c_email" className="flex items-center space-x-2 cursor-pointer w-full">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <span>E-mail</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                    <RadioGroupItem value="sms" id="c_sms" />
                                    <Label htmlFor="c_sms" className="flex items-center space-x-2 cursor-pointer w-full">
                                        <Smartphone className="w-4 h-4 text-primary" />
                                        <span>SMS</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-3">
                            <Label>Quantidade</Label>
                            <div className="flex space-x-2">
                                {[100, 500, 1000, 5000].map(val => (
                                    <Button
                                        key={val}
                                        variant={amount === val ? 'default' : 'outline'}
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => setAmount(val)}
                                    >
                                        {val}
                                    </Button>
                                ))}
                            </div>
                            <div className="pt-2">
                                <Label className="text-xs text-muted-foreground">Outro valor (Mín. 100)</Label>
                                <Input
                                    type="number"
                                    min="100"
                                    step="100"
                                    value={amount}
                                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <Card className="p-4 bg-muted/50">
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-muted-foreground">Preço por {creditType.toUpperCase()}</span>
                                <span className="font-medium">R$ {pricePerUnit.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-border pt-2 mt-2">
                                <span className="font-semibold text-base">Total</span>
                                <span className="font-bold text-lg text-primary">{totalValue}</span>
                            </div>
                        </Card>

                        <div className="space-y-3">
                            <Label>Forma de Pagamento</Label>
                            <RadioGroup value={billingType} onValueChange={(val: any) => setBillingType(val)} className="flex space-x-4">
                                <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                    <RadioGroupItem value="PIX" id="p_pix" />
                                    <Label htmlFor="p_pix" className="flex items-center space-x-2 cursor-pointer w-full">
                                        <QrCode className="w-4 h-4 text-primary" />
                                        <span>PIX</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                    <RadioGroupItem value="CREDIT_CARD" id="p_card" />
                                    <Label htmlFor="p_card" className="flex items-center space-x-2 cursor-pointer w-full">
                                        <CreditCard className="w-4 h-4 text-primary" />
                                        <span>Cartão</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Button className="w-full" onClick={() => billingType === 'CREDIT_CARD' ? setStep(2) : handleBuy()} disabled={loading || amount < 100}>
                            {loading ? 'Processando...' : billingType === 'PIX' ? `Pagar ${totalValue} via PIX` : `Continuar para o Cartão`}
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" /> Dados do Cartão
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="card_num" className="text-xs">Número do Cartão</Label>
                                        <Input id="card_num" placeholder="0000 0000 0000 0000" value={cardData.number} onChange={e => setCardData({ ...cardData, number: e.target.value })} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="card_name" className="text-xs">Nome no Cartão</Label>
                                        <Input id="card_name" placeholder="TITULAR DO CARTÃO" value={cardData.name} onChange={e => setCardData({ ...cardData, name: e.target.value.toUpperCase() })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="card_exp" className="text-xs">Validade (MM/AA)</Label>
                                            <Input id="card_exp" placeholder="MM/AA" value={cardData.expiry} onChange={e => {
                                                let val = e.target.value.replace(/\D/g, '');
                                                if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                setCardData({ ...cardData, expiry: val });
                                            }} maxLength={5} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="card_cvc" className="text-xs">CVV</Label>
                                            <Input id="card_cvc" placeholder="123" value={cardData.cvc} onChange={e => setCardData({ ...cardData, cvc: e.target.value })} maxLength={4} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg border border-dashed border-border flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pagamento 100% Seguro</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold">Informações de Cobrança</h4>
                                <div className="space-y-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="bil_doc" className="text-xs">CPF / CNPJ</Label>
                                        <Input id="bil_doc" placeholder="000.000.000-00" value={billingInfo.document} onChange={e => setBillingInfo({ ...billingInfo, document: e.target.value })} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="bil_cep" className="text-xs">CEP</Label>
                                        <Input id="bil_cep" placeholder="00000-000" value={billingInfo.postalCode} onChange={e => setBillingInfo({ ...billingInfo, postalCode: e.target.value })} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="bil_addr" className="text-xs">Endereço Completo</Label>
                                        <Input id="bil_addr" placeholder="Rua, Número, Bairro..." value={billingInfo.address} onChange={e => setBillingInfo({ ...billingInfo, address: e.target.value })} />
                                    </div>
                                </div>
                                <Card className="p-3 bg-primary/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold">Total Compra:</span>
                                        <span className="text-sm font-bold text-primary">{totalValue}</span>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={loading}>
                                Voltar
                            </Button>
                            <Button className="flex-[2]" onClick={handleBuy} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        Pagar Agora <ChevronRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && qrCode && (
                    <div className="flex flex-col items-center justify-center space-y-6 py-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                            <img
                                src={`data:image/jpeg;base64,${qrCode.encodedImage}`}
                                alt="QR Code PIX"
                                className="w-48 h-48"
                            />
                        </div>

                        <div className="text-center space-y-2">
                            <p className="font-medium">Escaneie o QR Code com o app do seu banco</p>
                            <p className="text-sm text-muted-foreground max-w-[300px] break-words">
                                Ou copie o código PIX abaixo para realizar o pagamento.
                            </p>
                        </div>

                        <div className="w-full flex space-x-2">
                            <Input value={qrCode.payload} readOnly className="font-mono text-xs" />
                            <Button onClick={copyPixCode} variant="secondary">Copiar</Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center mt-4">
                            Após o pagamento, os créditos serão adicionados automaticamente à sua conta em instantes.
                        </p>

                        <Button variant="outline" className="w-full mt-4" onClick={() => {
                            onSuccess();
                            onClose();
                        }}>
                            Concluído
                        </Button>
                    </div>
                )}

                {step === 3 && paymentSuccess && (
                    <div className="flex flex-col items-center justify-center space-y-6 py-8">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold">Pagamento Aprovado!</h3>
                            <p className="text-muted-foreground">
                                Os créditos foram adicionados ao seu saldo com sucesso.
                            </p>
                        </div>
                        <Button className="w-full" onClick={() => {
                            onSuccess();
                            onClose();
                        }}>
                            Fechar
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
