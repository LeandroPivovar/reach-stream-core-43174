import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Smartphone, Mail, QrCode } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface BuyCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function BuyCreditsModal({ isOpen, onClose, onSuccess }: BuyCreditsModalProps) {
    const [creditType, setCreditType] = useState<'email' | 'sms'>('email');
    const [amount, setAmount] = useState<number>(1000);
    const [billingType, setBillingType] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState<any>(null);

    const pricePerUnit = creditType === 'email' ? 0.30 : 0.40;
    const totalValue = (amount * pricePerUnit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Reset state when type changes
    useEffect(() => {
        if (creditType === 'email') setAmount(1000);
        else setAmount(500);
        setQrCode(null);
    }, [creditType]);

    const handleBuy = async () => {
        if (amount < 100) {
            toast.error('A quantidade mínima é de 100 créditos.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.buyCredits({ type: creditType, amount, billingType });
            if (res.success) {
                if (billingType === 'PIX' && res.qrCode) {
                    setQrCode(res.qrCode);
                    toast.success('Escaneie o QR Code ou copie o código PIX para pagar.');
                } else {
                    toast.success('Cobrança gerada com sucesso! Verifique seu email.');
                    onSuccess();
                    onClose(); // In a real scenario for credit card, we would process it immediately. Here we assume PIX or external payment logic handled mostly via webhook later.
                }
            } else {
                toast.error('Erro ao gerar cobrança.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro ao processar compra de créditos.');
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Comprar Créditos Avulsos</DialogTitle>
                    <DialogDescription>
                        Adicione saldo para disparos extras caso o limite do seu plano acabe. Os créditos não expiram.
                    </DialogDescription>
                </DialogHeader>

                {!qrCode ? (
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
                            <RadioGroup value={billingType} onValueChange={(val: 'PIX') => setBillingType(val)} className="flex space-x-4">
                                <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                    <RadioGroupItem value="PIX" id="p_pix" />
                                    <Label htmlFor="p_pix" className="flex items-center space-x-2 cursor-pointer w-full">
                                        <QrCode className="w-4 h-4 text-primary" />
                                        <span>PIX</span>
                                    </Label>
                                </div>
                                {/* Credit Card option omitted for simplicity in this flow, assuming PIX is preferred for single packets */}
                            </RadioGroup>
                        </div>

                        <Button className="w-full" onClick={handleBuy} disabled={loading || amount < 100}>
                            {loading ? 'Processando...' : `Pagar ${totalValue} via PIX`}
                        </Button>
                    </div>
                ) : (
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
                            Após o pagamento, os créditos serão adicionados automaticamente à sua conta em instantes, não é necessário fazer nada.
                        </p>

                        <Button variant="outline" className="w-full mt-4" onClick={() => {
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
