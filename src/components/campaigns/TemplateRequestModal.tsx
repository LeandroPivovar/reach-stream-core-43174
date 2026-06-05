import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    QrCode,
    CreditCard,
    ShieldCheck,
    Loader2,
    ChevronRight,
    CheckCircle2,
    MessageSquare,
    Image as ImageIcon,
    List,
    MousePointerClick,
    Plus,
    Trash2,
    ExternalLink,
    Phone,
    CornerDownRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface TemplateButton {
    text: string;
    type: 'url' | 'phone' | 'quick_reply';
    value: string;
}

interface TemplateListItem {
    item: string;
    description: string;
}

interface TemplateRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const TEMPLATE_TYPES = [
    {
        id: 'text',
        label: 'Texto',
        icon: MessageSquare,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        activeBorder: 'border-blue-500',
        activeBg: 'bg-blue-50/80',
        description: 'Mensagem de texto simples com variáveis dinâmicas.',
    },
    {
        id: 'media',
        label: 'Com Imagem/Vídeo',
        icon: ImageIcon,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        activeBorder: 'border-purple-500',
        activeBg: 'bg-purple-50/80',
        description: 'Template com imagem ou vídeo acompanhados de texto.',
    },
    {
        id: 'buttons',
        label: 'Com Botões',
        icon: MousePointerClick,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        activeBorder: 'border-green-500',
        activeBg: 'bg-green-50/80',
        description: 'Botões de ação rápida (URL, telefone ou resposta rápida).',
    },
    {
        id: 'list',
        label: 'Com Lista',
        icon: List,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        activeBorder: 'border-amber-500',
        activeBg: 'bg-amber-50/80',
        description: 'Menu de seleção com lista de opções interativas.',
    },
] as const;

type TemplateTypeId = 'text' | 'media' | 'buttons' | 'list';

export function TemplateRequestModal({ isOpen, onClose, onSuccess }: TemplateRequestModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: type + content, 2: payment type, 3: payment details/QR
    const [templateType, setTemplateType] = useState<TemplateTypeId>('text');
    const [content, setContent] = useState('');
    const [mediaDescription, setMediaDescription] = useState('');
    const [listButton, setListButton] = useState('');
    const [listItems, setListItems] = useState<TemplateListItem[]>([{ item: '', description: '' }]);
    const [buttons, setButtons] = useState<TemplateButton[]>([{ text: '', type: 'url', value: '' }]);

    const [billingType, setBillingType] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState<any>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvc: '' });
    const [billingInfo, setBillingInfo] = useState({
        document: user?.document || '',
        phone: user?.phone || '',
        postalCode: user?.postalCode || '',
        address: user?.address || '',
    });

    const totalValue = (49.9).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    useEffect(() => {
        if (user) {
            setBillingInfo(prev => ({
                ...prev,
                document: prev.document || user.document || '',
                phone: prev.phone || user.phone || '',
                postalCode: prev.postalCode || user.postalCode || '',
                address: prev.address || user.address || '',
            }));
        }
    }, [user]);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setQrCode(null);
            setPaymentSuccess(false);
            setLoading(false);
            setContent('');
            setTemplateType('text');
            setMediaDescription('');
            setListButton('');
            setListItems([{ item: '', description: '' }]);
            setButtons([{ text: '', type: 'url', value: '' }]);
        }
    }, [isOpen]);

    const handleNext = () => {
        if (step === 1) {
            if (content.length < 10) {
                toast.error('Descreva melhor o que você precisa no template.');
                return;
            }
            if (templateType === 'buttons' && buttons.some(b => !b.text.trim())) {
                toast.error('Preencha o texto de todos os botões.');
                return;
            }
            if (templateType === 'list') {
                if (!listButton.trim()) {
                    toast.error('Informe o texto do botão da lista.');
                    return;
                }
                if (listItems.some(i => !i.item.trim())) {
                    toast.error('Preencha o nome de todos os itens da lista.');
                    return;
                }
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
                templateType,
                ...(templateType === 'media' && { mediaDescription }),
                ...(templateType === 'buttons' && { buttons }),
                ...(templateType === 'list' && { listButton, listItems }),
                billingType,
                ...(billingType === 'CREDIT_CARD' && {
                    creditCard: {
                        holderName: cardData.name,
                        number: cardData.number.replace(/\s/g, ''),
                        expiryMonth,
                        expiryYear,
                        ccv: cardData.cvc,
                    },
                    creditCardHolderInfo: {
                        name: cardData.name,
                        email: user?.email,
                        cpfCnpj: billingInfo.document.replace(/\D/g, ''),
                        postalCode: billingInfo.postalCode.replace(/\D/g, ''),
                        addressNumber: 'S/N',
                        phone: billingInfo.phone.replace(/\D/g, ''),
                    },
                }),
            });

            if (billingType === 'PIX' && response.qrCode) {
                setQrCode(response.qrCode);
            } else if (billingType === 'CREDIT_CARD') {
                setPaymentSuccess(true);
                toast.success('Solicitação realizada com sucesso!');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 3000);
            }
        } catch (error: any) {
            toast.error(error.message || 'Falha ao processar solicitação de template.');
            setStep(2);
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

    const addButton = () => setButtons(prev => [...prev, { text: '', type: 'url', value: '' }]);
    const removeButton = (idx: number) => setButtons(prev => prev.filter((_, i) => i !== idx));
    const updateButton = (idx: number, field: keyof TemplateButton, value: string) =>
        setButtons(prev => prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));

    const addListItem = () => setListItems(prev => [...prev, { item: '', description: '' }]);
    const removeListItem = (idx: number) => setListItems(prev => prev.filter((_, i) => i !== idx));
    const updateListItem = (idx: number, field: keyof TemplateListItem, value: string) =>
        setListItems(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

    const selectedType = TEMPLATE_TYPES.find(t => t.id === templateType)!;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[98vw] max-w-[640px] max-h-[98vh] p-0 overflow-hidden bg-background flex flex-col">
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
                        Configure o template desejado. Nossa equipe irá processá-lo e disponibilizar para uso.
                    </DialogDescription>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/10">
                    {/* Progress */}
                    {!paymentSuccess && (
                        <div className="flex items-center gap-2 mb-6">
                            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
                        </div>
                    )}

                    {/* ─── STEP 1: Type + Content ─── */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                            {/* Type selector */}
                            <div className="space-y-3">
                                <Label className="font-semibold">Tipo de Template</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {TEMPLATE_TYPES.map(t => {
                                        const Icon = t.icon;
                                        const active = templateType === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setTemplateType(t.id as TemplateTypeId)}
                                                className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                                                    active
                                                        ? `${t.activeBorder} ${t.activeBg} ring-2 ring-offset-1 ring-primary/20`
                                                        : 'border-border hover:border-primary/30 hover:bg-muted/30'
                                                }`}
                                            >
                                                <div className={`w-9 h-9 rounded-lg ${t.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                    <Icon className={`w-4 h-4 ${t.color}`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold leading-tight">{t.label}</p>
                                                    <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{t.description}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Text content */}
                            <div className="space-y-2">
                                <Label>Texto do Template</Label>
                                <Textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder={`Ex: Olá {{nome_cliente}}, seu pedido #{{numero_pedido}} foi confirmado! Acompanhe em: {{link_rastreio}}`}
                                    className="min-h-[130px] resize-none"
                                />
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 space-y-1">
                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">💡 Variáveis dinâmicas</p>
                                    <p className="text-[11px] text-blue-600/80 dark:text-blue-400 leading-relaxed">
                                        Use <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">{`{{variavel}}`}</code> para partes que mudam por cliente. Ex: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">Olá {`{{nome_da_pessoa}}`}</code>
                                    </p>
                                </div>
                            </div>

                            {/* Media type: extra field */}
                            {templateType === 'media' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                                        Descrição da Mídia
                                    </Label>
                                    <Textarea
                                        value={mediaDescription}
                                        onChange={e => setMediaDescription(e.target.value)}
                                        placeholder="Ex: Imagem do produto com fundo branco. Dimensões sugeridas: 800x800px."
                                        className="min-h-[70px] resize-none"
                                    />
                                    <p className="text-[11px] text-muted-foreground">Descreva a mídia que você irá utilizar neste template para que configuremos corretamente.</p>
                                </div>
                            )}

                            {/* Buttons type: button list */}
                            {templateType === 'buttons' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-1.5">
                                            <MousePointerClick className="w-3.5 h-3.5 text-green-600" />
                                            Botões
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={addButton}
                                            disabled={buttons.length >= 3}
                                        >
                                            <Plus className="w-3 h-3 mr-1" /> Adicionar
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {buttons.map((btn, idx) => (
                                            <div key={idx} className="p-3 border rounded-xl bg-muted/20 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">Botão {idx + 1}</Badge>
                                                    {buttons.length > 1 && (
                                                        <button type="button" onClick={() => removeButton(idx)} className="text-destructive/60 hover:text-destructive">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-[1fr_auto] gap-2">
                                                    <Input
                                                        placeholder="Texto do botão (ex: Visitar site)"
                                                        value={btn.text}
                                                        onChange={e => updateButton(idx, 'text', e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                    <select
                                                        value={btn.type}
                                                        onChange={e => updateButton(idx, 'type', e.target.value as any)}
                                                        className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                    >
                                                        <option value="url">🔗 URL</option>
                                                        <option value="phone">📞 Telefone</option>
                                                        <option value="quick_reply">↩️ Resposta Rápida</option>
                                                    </select>
                                                </div>
                                                {btn.type !== 'quick_reply' && (
                                                    <Input
                                                        placeholder={btn.type === 'url' ? 'https://seusite.com.br/pagina' : '+55 (11) 99999-9999'}
                                                        value={btn.value}
                                                        onChange={e => updateButton(idx, 'value', e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">Máximo de 3 botões. Botões de URL e Telefone requerem um valor de destino.</p>
                                </div>
                            )}

                            {/* List type: list config */}
                            {templateType === 'list' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5">
                                            <List className="w-3.5 h-3.5 text-amber-600" />
                                            Texto do Botão de Abrir Lista
                                        </Label>
                                        <Input
                                            placeholder="Ex: Ver opções, Escolher serviço..."
                                            value={listButton}
                                            onChange={e => setListButton(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="flex items-center gap-1.5">
                                                <CornerDownRight className="w-3.5 h-3.5 text-amber-600" />
                                                Itens da Lista
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={addListItem}
                                                disabled={listItems.length >= 10}
                                            >
                                                <Plus className="w-3 h-3 mr-1" /> Adicionar Item
                                            </Button>
                                        </div>
                                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                            {listItems.map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-2">
                                                    <div className="flex-1 p-2.5 border rounded-xl bg-amber-50/40 space-y-1.5">
                                                        <Input
                                                            placeholder={`Item ${idx + 1} (ex: Suporte Técnico)`}
                                                            value={item.item}
                                                            onChange={e => updateListItem(idx, 'item', e.target.value)}
                                                            className="h-8 text-sm bg-white"
                                                        />
                                                        <Input
                                                            placeholder="Descrição opcional (ex: Problemas com acesso)"
                                                            value={item.description}
                                                            onChange={e => updateListItem(idx, 'description', e.target.value)}
                                                            className="h-7 text-xs bg-white"
                                                        />
                                                    </div>
                                                    {listItems.length > 1 && (
                                                        <button type="button" onClick={() => removeListItem(idx)} className="mt-2 text-destructive/60 hover:text-destructive">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">Máximo de 10 itens por lista. A descrição é opcional mas melhora a experiência do usuário.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── STEP 2: Payment Method ─── */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-2">

                            {/* Summary of template requested */}
                            <div className={`p-3 rounded-xl border-2 ${selectedType.border} ${selectedType.activeBg} flex items-start gap-3`}>
                                <div className={`w-9 h-9 rounded-lg ${selectedType.bg} flex items-center justify-center flex-shrink-0`}>
                                    {React.createElement(selectedType.icon, { className: `w-4 h-4 ${selectedType.color}` })}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{selectedType.label}</p>
                                    <p className="text-sm text-foreground line-clamp-2 mt-0.5">{content}</p>
                                    {templateType === 'buttons' && buttons.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {buttons.map((b, i) => (
                                                <Badge key={i} variant="outline" className="text-[9px] px-1 py-0">
                                                    {b.text || `Botão ${i + 1}`}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    {templateType === 'list' && listItems.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {listItems.slice(0, 3).map((it, i) => (
                                                <Badge key={i} variant="outline" className="text-[9px] px-1 py-0">{it.item}</Badge>
                                            ))}
                                            {listItems.length > 3 && (
                                                <Badge variant="outline" className="text-[9px] px-1 py-0">+{listItems.length - 3} mais</Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Escolha como deseja pagar</Label>
                                <RadioGroup value={billingType} onValueChange={(v: any) => setBillingType(v)} className="grid grid-cols-1 gap-3">
                                    <Label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${billingType === 'PIX' ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:bg-muted/50'}`}>
                                        <RadioGroupItem value="PIX" className="sr-only" />
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${billingType === 'PIX' ? 'bg-primary/20' : 'bg-muted'}`}>
                                            <QrCode className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold block">PIX</span>
                                            <span className="text-[10px] text-emerald-600 font-medium">Aprovação imediata</span>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </Label>

                                    <Label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${billingType === 'CREDIT_CARD' ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:bg-muted/50'}`}>
                                        <RadioGroupItem value="CREDIT_CARD" className="sr-only" />
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${billingType === 'CREDIT_CARD' ? 'bg-primary/20' : 'bg-muted'}`}>
                                            <CreditCard className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold block">Cartão de Crédito</span>
                                            <span className="text-[10px] text-primary font-bold uppercase">À Vista</span>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </Label>
                                </RadioGroup>
                            </div>

                            <Card className="p-3 bg-primary/5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold">Total:</span>
                                    <span className="text-sm font-bold text-primary">{totalValue}</span>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ─── STEP 3: Credit Card Details ─── */}
                    {step === 3 && !paymentSuccess && billingType === 'CREDIT_CARD' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-2">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    <h4 className="text-sm font-bold uppercase tracking-wider">Dados do Cartão</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-xs">Número do Cartão</Label>
                                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                        </div>
                                        <Input placeholder="0000 0000 0000 0000" value={cardData.number} onChange={e => setCardData({ ...cardData, number: e.target.value })} className="h-11 md:h-10 text-base md:text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Validade</Label>
                                            <Input placeholder="MM/AA" value={cardData.expiry} onChange={e => setCardData({ ...cardData, expiry: e.target.value })} className="h-11 md:h-10 text-base md:text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">CVC</Label>
                                            <Input type="password" placeholder="123" maxLength={4} value={cardData.cvc} onChange={e => setCardData({ ...cardData, cvc: e.target.value })} className="h-11 md:h-10 text-base md:text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Nome Impresso</Label>
                                        <Input placeholder="NOME COMO NO CARTÃO" value={cardData.name} onChange={e => setCardData({ ...cardData, name: e.target.value.toUpperCase() })} className="h-11 md:h-10 text-base md:text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">CPF/CNPJ do Titular</Label>
                                            <Input placeholder="000.000.000-00" value={billingInfo.document} onChange={e => setBillingInfo({ ...billingInfo, document: e.target.value })} className="h-11 md:h-10 text-base md:text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">CEP do Titular</Label>
                                            <Input placeholder="00000-000" value={billingInfo.postalCode} onChange={e => setBillingInfo({ ...billingInfo, postalCode: e.target.value })} className="h-11 md:h-10 text-base md:text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Card className="p-3 bg-primary/5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold">Total:</span>
                                    <span className="text-sm font-bold text-primary">{totalValue}</span>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ─── STEP 3: PIX QR or Success ─── */}
                    {step === 3 && (billingType === 'PIX' || paymentSuccess) && (
                        <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-300">
                            {billingType === 'PIX' ? (
                                <>
                                    <div className="flex items-center gap-2 mb-6 pb-2 border-b w-full justify-center">
                                        <QrCode className="w-4 h-4 text-primary" />
                                        <h4 className="text-sm font-bold uppercase tracking-wider">Pagamento PIX</h4>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm mb-4">
                                        <div className="bg-muted min-h-[220px] w-[220px] rounded-xl flex items-center justify-center p-2 mx-auto">
                                            {qrCode?.encodedImage ? (
                                                <img src={`data:image/png;base64,${qrCode.encodedImage}`} alt="QR Code PIX" className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                    <span className="text-[10px] font-medium text-muted-foreground">Gerando QR Code...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-6 max-w-[280px]">
                                        Escaneie o código acima ou copie a chave PIX para finalizar seu pagamento.
                                    </p>
                                    {qrCode?.payload && (
                                        <div className="w-full flex flex-col gap-3">
                                            <div className="relative group">
                                                <Input readOnly value={qrCode.payload} className="pr-20 h-11 text-[11px] font-mono bg-muted/30" />
                                                <Button
                                                    size="sm"
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9"
                                                    onClick={() => { navigator.clipboard.writeText(qrCode.payload); toast.success('Código PIX copiado!'); }}
                                                >
                                                    Copiar
                                                </Button>
                                            </div>
                                        </div>
                                    )}
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
                                </>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Fixed Footer */}
                <div className="p-4 md:p-6 bg-background border-t border-border flex gap-3">
                    {step === 1 && (
                        <Button onClick={handleNext} className="w-full h-12 md:h-11 text-md font-medium group transition-all" size="lg">
                            Prosseguir
                            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    )}
                    {step === 2 && (
                        <>
                            <Button variant="outline" className="h-12 md:h-11 w-full" onClick={() => setStep(1)}>Voltar</Button>
                            <Button onClick={goToStep3} className="w-full h-12 md:h-11 text-md font-medium">Prosseguir</Button>
                        </>
                    )}
                    {step === 3 && !paymentSuccess && billingType === 'CREDIT_CARD' && (
                        <>
                            <Button variant="outline" className="h-12 md:h-11 w-full" onClick={() => setStep(2)} disabled={loading}>Voltar</Button>
                            <Button onClick={handleBuy} className="w-full h-12 md:h-11 text-md font-medium" disabled={loading}>
                                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</>) : 'Finalizar Pagamento'}
                            </Button>
                        </>
                    )}
                    {step === 3 && billingType === 'PIX' && (
                        <Button variant="outline" className="w-full h-12 md:h-11" onClick={() => { onClose(); onSuccess(); }}>
                            Já paguei, fechar
                        </Button>
                    )}
                    {paymentSuccess && (
                        <Button className="w-full h-12 md:h-11" onClick={() => { onClose(); onSuccess(); }}>Finalizar</Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
