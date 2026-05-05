import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Smartphone, Mail, QrCode, CreditCard, ShieldCheck, Loader2, ChevronRight, CheckCircle2, MessageSquare } from 'lucide-react';
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
    const [creditType, setCreditType] = useState<'email' | 'sms' | 'whatsapp'>('email');
    const [amount, setAmount] = useState<number>(1000);
    const [billingType, setBillingType] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState<any>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [whatsappPackages, setWhatsappPackages] = useState<any[]>([]);
    const [emailPackages, setEmailPackages] = useState<any[]>([]);
    const [smsPackages, setSmsPackages] = useState<any[]>([]);

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

    useEffect(() => {
        setWhatsappPackages([]);
        setEmailPackages([]);
        setSmsPackages([]);
    }, [isOpen]);


    const [prices, setPrices] = useState({
        UNIT_PRICE_WHATSAPP: 0.15,
        UNIT_PRICE_SMS: 0.10,
        UNIT_PRICE_EMAIL: 0.01 // per unit, but shown as 1000 in UI often
    });

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const settings = await api.getPublicSettings();
                const newPrices = { ...prices };
                const emailPkgs: any[] = [];
                const smsPkgs: any[] = [];
                const waPkgs: any[] = [];
                
                const settingsMap = settings.reduce((acc: any, s) => ({ ...acc, [s.key]: s.value }), {});

                if (settingsMap['UNIT_PRICE_WHATSAPP'] !== undefined) newPrices.UNIT_PRICE_WHATSAPP = parseFloat(settingsMap['UNIT_PRICE_WHATSAPP']);
                if (settingsMap['UNIT_PRICE_SMS'] !== undefined) newPrices.UNIT_PRICE_SMS = parseFloat(settingsMap['UNIT_PRICE_SMS']);
                if (settingsMap['UNIT_PRICE_EMAIL'] !== undefined) newPrices.UNIT_PRICE_EMAIL = parseFloat(settingsMap['UNIT_PRICE_EMAIL']);

                // Parse Packages for all types
                for (let i = 1; i <= 4; i++) {
                    // WhatsApp
                    const waAmount = parseInt(settingsMap[`WHATSAPP_PKG${i}_AMOUNT`] || '0');
                    const waPrice = parseFloat(settingsMap[`WHATSAPP_PKG${i}_PRICE`] || '0');
                    if (waAmount > 0 && !isNaN(waPrice)) waPkgs.push({ id: i, amount: waAmount, price: waPrice });

                    // Email
                    const emailAmount = parseInt(settingsMap[`EMAIL_PKG${i}_AMOUNT`] || '0');
                    const emailPrice = parseFloat(settingsMap[`EMAIL_PKG${i}_PRICE`] || '0');
                    if (emailAmount > 0 && !isNaN(emailPrice)) emailPkgs.push({ id: i, amount: emailAmount, price: emailPrice });

                    // SMS
                    const smsAmount = parseInt(settingsMap[`SMS_PKG${i}_AMOUNT`] || '0');
                    const smsPrice = parseFloat(settingsMap[`SMS_PKG${i}_PRICE`] || '0');
                    if (smsAmount > 0 && !isNaN(smsPrice)) smsPkgs.push({ id: i, amount: smsAmount, price: smsPrice });
                }

                setPrices(newPrices);
                setWhatsappPackages(waPkgs);
                setEmailPackages(emailPkgs);
                setSmsPackages(smsPkgs);

                // Pre-select first package if available for current type
                if (creditType === 'whatsapp' && waPkgs.length > 0) setAmount(waPkgs[0].amount);
                else if (creditType === 'email' && emailPkgs.length > 0) setAmount(emailPkgs[0].amount);
                else if (creditType === 'sms' && smsPkgs.length > 0) setAmount(smsPkgs[0].amount);
            } catch (error) {
                console.error('Erro ao buscar preços:', error);
            }
        };
        fetchPrices();
    }, [isOpen]); // Refetch when modal opens to get latest admin changes

    const pricePerUnit = creditType === 'whatsapp' ? prices.UNIT_PRICE_WHATSAPP : 
                        (creditType === 'email' ? prices.UNIT_PRICE_EMAIL / 1000 : prices.UNIT_PRICE_SMS);
    
    // Total value logic: check if selected amount matches a package, otherwise use unit price
    const getCurrentPackages = () => {
        return creditType === 'whatsapp' ? whatsappPackages : (creditType === 'email' ? emailPackages : smsPackages);
    };

    const getSelectedPackage = () => {
        const pkgs = getCurrentPackages();
        return pkgs.find(p => p.amount === amount);
    };

    const calculateTotalValue = () => {
        const pkg = getSelectedPackage();
        if (pkg) return pkg.price;
        return amount * pricePerUnit;
    };

    const finalTotalValueRaw = calculateTotalValue();
    const finalTotalValueFormatted = finalTotalValueRaw.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
        const currentPkgs = creditType === 'whatsapp' ? whatsappPackages : (creditType === 'email' ? emailPackages : smsPackages);
        
        if (currentPkgs.length > 0) {
            setAmount(currentPkgs[0].amount);
        } else {
            if (creditType === 'email') setAmount(1000);
            else if (creditType === 'sms') setAmount(500);
            else if (creditType === 'whatsapp') setAmount(500);
        }
    }, [creditType, whatsappPackages.length, emailPackages.length, smsPackages.length]);

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
                } else if (billingType === 'CREDIT_CARD') {
                    setPaymentSuccess(true);
                    toast.success('Pagamento processado com sucesso!');
                    onSuccess();
                }
            } else {
                toast.error('Erro ao processar pagamento.');
                setStep(2); // Go back if error
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Erro ao processar compra de créditos.');
            setStep(2); // Go back if error
        } finally {
            setLoading(false);
        }
    };

    const goToStep3 = () => {
        setStep(3);
        if (billingType === 'PIX') {
            handleBuy();
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
            <DialogContent className={`${billingType === 'CREDIT_CARD' && step === 3 ? "sm:max-w-[700px]" : "sm:max-w-[500px]"} w-[98vw] md:w-[95vw] h-[95vh] md:h-auto max-h-[95vh] p-0 overflow-hidden flex flex-col`}>
                <div className="p-6 border-b bg-muted/5">
                    <DialogTitle>Comprar Créditos Avulsos</DialogTitle>
                    <DialogDescription className="mt-1">
                        {step === 3 ? 'Pagamento' : 'Adicione saldo para disparos extras caso o limite do seu plano acabe. Os créditos não expiram.'}
                    </DialogDescription>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/10">

                {/* Setup Progress */}
                {step <= 3 && !paymentSuccess && (
                    <div className="flex items-center gap-2 mb-6">
                        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-3">
                            <Label>Tipo de Crédito</Label>
                            <RadioGroup value={creditType} onValueChange={(val: any) => setCreditType(val)} className="flex flex-wrap gap-3">
                                <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 min-w-[120px] cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                    <RadioGroupItem value="email" id="c_email" />
                                    <Label htmlFor="c_email" className="flex items-center space-x-2 cursor-pointer w-full">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <span>E-mail</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 min-w-[120px] cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                    <RadioGroupItem value="sms" id="c_sms" />
                                    <Label htmlFor="c_sms" className="flex items-center space-x-2 cursor-pointer w-full">
                                        <Smartphone className="w-4 h-4 text-primary" />
                                        <span>SMS</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 min-w-[120px] cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                    <RadioGroupItem value="whatsapp" id="c_whatsapp" />
                                    <Label htmlFor="c_whatsapp" className="flex items-center space-x-2 cursor-pointer w-full">
                                        <MessageSquare className="w-4 h-4 text-primary" />
                                        <span>WhatsApp</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-3">
                            <Label>{creditType === 'whatsapp' ? 'Escolha seu Pacote' : 'Quantidade'}</Label>
                            
                            {(() => {
                                const currentPkgs = creditType === 'whatsapp' ? whatsappPackages : (creditType === 'email' ? emailPackages : smsPackages);
                                
                                if (currentPkgs.length > 0) {
                                    return (
                                        <div className="grid grid-cols-1 gap-2">
                                            {currentPkgs.map(pkg => (
                                                <Button
                                                    key={pkg.id}
                                                    variant={selectedPackage?.id === pkg.id ? 'default' : 'outline'}
                                                    className={`h-auto py-3 px-4 flex flex-col items-start gap-1 transition-all ${selectedPackage?.id === pkg.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                                    onClick={() => handlePackageSelect(pkg)}
                                                >
                                                    <div className="flex justify-between w-full items-center">
                                                        <span className="font-bold text-sm">{pkg.name}</span>
                                                        <span className="font-mono text-xs font-bold text-primary">R$ {pkg.price.toFixed(2).replace('.', ',')}</span>
                                                    </div>
                                                    <div className="flex justify-between w-full items-center">
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{pkg.quantity} {creditType === 'email' ? 'envios' : 'créditos'}</span>
                                                        <span className="text-[10px] opacity-60">R$ {(pkg.price / pkg.quantity).toFixed(4).replace('.', ',')} / un</span>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    );
                                }
                                
                                return (
                                    <>
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
                                    </>
                                );
                            })()}

                        <Card className="p-4 bg-muted/50">
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-muted-foreground">Preço por {creditType === 'email' ? '1.000 E-MAILS' : creditType.toUpperCase()}</span>
                                <span className="font-medium">
                                    {(() => {
                                        const pkg = getSelectedPackage();
                                        if (pkg) return 'Pacote Selecionado';
                                        
                                        const displayPrice = creditType === 'email' ? prices.UNIT_PRICE_EMAIL : pricePerUnit;
                                        return `R$ ${displayPrice.toFixed(2).replace('.', ',')}`;
                                    })()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-t border-border pt-2 mt-2">
                                <span className="font-semibold text-base">Total</span>
                                <span className="font-bold text-lg text-primary">
                                    {finalTotalValueFormatted}
                                </span>
                            </div>
                        </Card>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 py-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold">Escolha como deseja pagar</Label>
                            <RadioGroup value={billingType} onValueChange={(v: any) => setBillingType(v)} className="grid grid-cols-1 gap-3">
                                <Label
                                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${billingType === 'PIX' ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:bg-muted/50'}`}
                                >
                                    <RadioGroupItem value="PIX" className="sr-only" />
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${billingType === 'PIX' ? 'bg-primary/20' : 'bg-muted'}`}>
                                        <QrCode className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-bold block text-sm">PIX</span>
                                        <span className="text-[10px] text-emerald-600 font-medium">Aprovação imediata</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </Label>
                                
                                <Label
                                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${billingType === 'CREDIT_CARD' ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:bg-muted/50'}`}
                                >
                                    <RadioGroupItem value="CREDIT_CARD" className="sr-only" />
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${billingType === 'CREDIT_CARD' ? 'bg-primary/20' : 'bg-muted'}`}>
                                        <CreditCard className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-bold block text-sm">Cartão de Crédito</span>
                                        <span className="text-[10px] text-primary font-bold uppercase">À Vista</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </Label>
                            </RadioGroup>
                        </div>

                        <Card className="p-4 bg-primary/5 flex justify-between items-center">
                            <span className="text-sm font-semibold">Total a pagar:</span>
                            <span className="text-lg font-bold text-primary">{finalTotalValueFormatted}</span>
                        </Card>
                    </div>
                )}

                {step === 3 && !paymentSuccess && billingType === 'CREDIT_CARD' && (
                    <div className="space-y-6 py-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <CreditCard className="w-4 h-4 text-primary" />
                                <h4 className="text-xs font-bold uppercase tracking-wider">Dados do Cartão</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-xs">Número do Cartão</Label>
                                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                        </div>
                                        <Input
                                            placeholder="0000 0000 0000 0000"
                                            value={cardData.number}
                                            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                                            className="h-11 md:h-10 text-base md:text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Validade</Label>
                                            <Input
                                                placeholder="MM/AA"
                                                value={cardData.expiry}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                    setCardData({ ...cardData, expiry: val });
                                                }}
                                                maxLength={5}
                                                className="h-11 md:h-10 text-base md:text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">CVC</Label>
                                            <Input
                                                type="password"
                                                placeholder="123"
                                                maxLength={4}
                                                value={cardData.cvc}
                                                onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                                                className="h-11 md:h-10 text-base md:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Nome Impresso</Label>
                                        <Input
                                            placeholder="NOME COMO NO CARTÃO"
                                            value={cardData.name}
                                            onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                                            className="h-11 md:h-10 text-base md:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">CPF/CNPJ do Titular</Label>
                                        <Input
                                            placeholder="000.000.000-00"
                                            value={billingInfo.document}
                                            onChange={(e) => setBillingInfo({ ...billingInfo, document: e.target.value })}
                                            className="h-11 md:h-10 text-base md:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">CEP do Titular</Label>
                                        <Input
                                            placeholder="00000-000"
                                            value={billingInfo.postalCode}
                                            onChange={(e) => setBillingInfo({ ...billingInfo, postalCode: e.target.value })}
                                            className="h-11 md:h-10 text-base md:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Endereço Completo</Label>
                                        <Input
                                            placeholder="Rua, Número, Bairro..."
                                            value={billingInfo.address}
                                            onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                                            className="h-11 md:h-10 text-base md:text-sm"
                                        />
                                    </div>
                                    <Card className="p-3 bg-primary/5 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-primary uppercase">Pagamento à Vista</span>
                                        <span className="text-sm font-bold text-primary">{finalTotalValueFormatted}</span>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && qrCode && !paymentSuccess && (
                    <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b w-full justify-center">
                            <QrCode className="w-4 h-4 text-primary" />
                            <h4 className="text-xs font-bold uppercase tracking-wider">Pagamento PIX</h4>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm mb-4">
                            <div className="bg-muted min-h-[200px] w-[200px] rounded-xl flex items-center justify-center p-2 mx-auto">
                                {qrCode?.encodedImage ? (
                                    <img 
                                        src={`data:image/jpeg;base64,${qrCode.encodedImage}`} 
                                        alt="QR Code PIX" 
                                        className="w-full h-full object-contain" 
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="text-[10px] font-medium text-muted-foreground">Gerando QR Code...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center space-y-2 mb-6">
                            <p className="text-sm font-medium">Escaneie o QR Code com o app do seu banco</p>
                            <p className="text-[11px] text-muted-foreground max-w-[280px] mx-auto">
                                Ou copie o código abaixo para pagar via "PIX Copia e Cola".
                            </p>
                        </div>

                        <div className="w-full flex flex-col gap-3">
                            <div className="relative">
                                <Input value={qrCode.payload} readOnly className="pr-20 h-11 text-[11px] font-mono bg-muted/30" />
                                <Button 
                                    size="sm" 
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9"
                                    onClick={copyPixCode}
                                >
                                    Copiar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && paymentSuccess && (
                    <div className="flex flex-col items-center justify-center space-y-6 py-8 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold">Pagamento Aprovado!</h3>
                            <p className="text-muted-foreground">
                                Os créditos foram adicionados ao seu saldo com sucesso.
                            </p>
                        </div>
                    </div>
                )}
                </div>

                {/* Fixed Footer Area */}
                <div className="p-4 md:p-6 bg-background border-t border-border flex gap-3">
                    {step === 1 && (
                        <Button className="w-full h-12 md:h-11" onClick={() => setStep(2)} disabled={loading || amount < 100}>
                            Próximo <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}

                    {step === 2 && (
                        <>
                            <Button variant="outline" className="w-full h-12 md:h-11" onClick={() => setStep(1)}>
                                Voltar
                            </Button>
                            <Button onClick={goToStep3} className="w-full h-12 md:h-11">
                                Prosseguir
                            </Button>
                        </>
                    )}

                    {step === 3 && !paymentSuccess && billingType === 'CREDIT_CARD' && (
                        <>
                            <Button variant="outline" className="w-full h-12 md:h-11" onClick={() => setStep(2)} disabled={loading}>
                                Voltar
                            </Button>
                            <Button onClick={handleBuy} className="w-full h-12 md:h-11" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    `Finalizar Pagamento`
                                )}
                            </Button>
                        </>
                    )}

                    {step === 3 && qrCode && !paymentSuccess && (
                        <Button variant="outline" className="w-full h-12 md:h-11" onClick={() => {
                            onSuccess();
                            onClose();
                        }}>
                            Já paguei, concluir
                        </Button>
                    )}

                    {paymentSuccess && (
                        <Button className="w-full h-12 md:h-11" onClick={() => {
                            onSuccess();
                            onClose();
                        }}>
                            Fechar
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
