import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users, Mail, Phone, MapPin, Calendar,
    ShoppingCart, TrendingUp, Clock, Activity,
    Flame, Zap, Snowflake, DollarSign, MousePointerClick
} from 'lucide-react';
import { LtvHistory } from './LtvHistory';
import { Contact as ApiContact } from '@/lib/api';

interface Purchase {
    id: number;
    date: string;
    value: number;
    product: string;
}

interface HistoryEvent {
    id: number;
    type: 'purchase' | 'email_open' | 'link_click' | 'campaign_participation';
    date: string;
    description: string;
    metadata?: {
        value?: number;
        product?: string;
        campaign?: string;
        subject?: string;
        link?: string;
    };
}

interface ContactFrontend {
    id: number;
    name: string;
    phone: string;
    email: string;
    group: string;
    status: string;
    tags: string[];
    state: string;
    city: string;
    birthDate: string;
    gender: string;
    segmentations: string[];
    lastInteraction: string;
    sales?: any[];
}

interface ContactDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactId: number | null;
    contacts: ContactFrontend[];
    contactPurchases: Record<number, { purchases: Purchase[]; ltv: number }>;
    scoreConfig: {
        weights: {
            emailOpens: number;
            linkClicks: number;
            purchases: number;
            ltvDivisor: number;
        }
    };
}

export function ContactDetailsModal({
    isOpen,
    onClose,
    contactId,
    contacts,
    contactPurchases,
    scoreConfig
}: ContactDetailsModalProps) {
    const contact = contacts.find(c => c.id === contactId);

    const calculateScore = (id: number) => {
        const purchaseData = contactPurchases[id];
        if (!purchaseData) return 0;

        const purchases = purchaseData.purchases.length || 0;
        const ltv = purchaseData.ltv || 0;
        const { purchases: purchaseWeight, ltvDivisor } = scoreConfig.weights;
        const ltvDivisorValue = ltvDivisor || 10;

        const calculatedScore = Math.min(100, Math.round(
            (purchases * (purchaseWeight || 0)) +
            (ltv / ltvDivisorValue)
        ));

        return isNaN(calculatedScore) ? 0 : calculatedScore;
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return {
            bg: 'bg-score-hot',
            text: 'text-score-hot',
            border: 'border-score-hot',
            label: 'Lead Quente',
            icon: Flame
        };
        if (score >= 40) return {
            bg: 'bg-score-warm',
            text: 'text-score-warm',
            border: 'border-score-warm',
            label: 'Lead Morno',
            icon: Zap
        };
        return {
            bg: 'bg-score-cold',
            text: 'text-score-cold',
            border: 'border-score-cold',
            label: 'Lead Frio',
            icon: Snowflake
        };
    };

    const getLtvColor = (ltv: number) => {
        if (ltv >= 400) return { text: 'text-ltv-high', bg: 'bg-ltv-high/10' };
        if (ltv >= 200) return { text: 'text-ltv-medium', bg: 'bg-ltv-medium/10' };
        return { text: 'text-ltv-low', bg: 'bg-ltv-low/10' };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Ativo': return 'bg-green-500';
            case 'Inativo': return 'bg-gray-500';
            case 'Bloqueado': return 'bg-red-500';
            case 'Aguardando': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    if (!contact) return null;

    const score = calculateScore(contact.id);
    const scoreColors = getScoreColor(score);
    const ScoreIcon = scoreColors.icon;
    const purchaseData = contactPurchases[contact.id] || { purchases: [], ltv: 0 };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-none w-screen h-screen p-6 rounded-none left-0 top-0 translate-x-0 translate-y-0 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Perfil Completo do Lead</DialogTitle>
                    <p className="text-sm text-muted-foreground">{contact.name}</p>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* Coluna 1: Informações Básicas */}
                    <div className="space-y-6">
                        <Card className="p-4 shadow-sm border-border/50">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                <Users className="w-4 h-4" />
                                Informações de Contato
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" /> Telefone
                                    </span>
                                    <span className="font-medium">{contact.phone}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" /> Email
                                    </span>
                                    <span className="font-medium text-xs">{contact.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" /> Localização
                                    </span>
                                    <span className="font-medium">
                                        {contact.city && contact.state ? `${contact.city}, ${contact.state}` : 'Não informado'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" /> Nascimento
                                    </span>
                                    <span className="font-medium">
                                        {contact.birthDate ? new Date(contact.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 shadow-sm border-border/50">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                <Activity className="w-4 h-4" />
                                Status e tags
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Status do Lead</span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(contact.status)}`} />
                                        <span className="text-sm font-medium">{contact.status}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-xs text-muted-foreground">Etiquetas</span>
                                    <div className="flex flex-wrap gap-1">
                                        {contact.tags.length > 0 ? (
                                            contact.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                                    {tag}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Nenhuma etiqueta</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Coluna 2: Métricas e Vendas */}
                    <div className="space-y-6">
                        <Card className={`p-5 border-l-4 ${scoreColors.border} shadow-sm overflow-hidden relative`}>
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <ScoreIcon className="w-16 h-16" />
                            </div>
                            <div className="relative z-10 font-bold">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Score de Engajamento</p>
                                <div className="flex items-end gap-2">
                                    <span className={`text-4xl font-black ${scoreColors.text}`}>{score}</span>
                                    <span className="text-sm text-muted-foreground mb-1">/ 100</span>
                                </div>
                                <p className={`text-sm mt-1 font-semibold ${scoreColors.text}`}>{scoreColors.label}</p>
                            </div>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 shadow-sm border-border/50">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Total Gasto (LTV)</p>
                                <p className="text-xl font-bold text-primary">R$ {purchaseData.ltv.toFixed(2)}</p>
                                <div className={`text-[10px] mt-1 inline-flex px-1.5 rounded-full font-bold ${getLtvColor(purchaseData.ltv).bg} ${getLtvColor(purchaseData.ltv).text}`}>
                                    {purchaseData.ltv >= 400 ? 'ALTO VALOR' : purchaseData.ltv >= 200 ? 'MÉDIO VALOR' : 'BAIXO VALOR'}
                                </div>
                            </Card>
                            <Card className="p-4 shadow-sm border-border/50">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Nº Compras</p>
                                <p className="text-xl font-bold">{purchaseData.purchases.length}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Vendas confirmadas</p>
                            </Card>
                        </div>

                        <Card className="p-4 shadow-sm border-border/50">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider font-bold">
                                <ShoppingCart className="w-4 h-4" />
                                Histórico de Vendas
                            </h3>
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                {purchaseData.purchases.length > 0 ? (
                                    purchaseData.purchases.map(purchase => (
                                        <div key={purchase.id} className="flex justify-between items-center p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors border border-border/20">
                                            <div>
                                                <p className="text-xs font-bold truncate max-w-[120px]">{purchase.product}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(purchase.date).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-primary">R$ {purchase.value.toFixed(2)}</p>
                                                <Badge variant="outline" className="text-[8px] h-3 px-1">Concluída</Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p className="text-xs italic">Nenhuma compra registrada</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Coluna 3: Evolução e Timeline */}
                    <div className="space-y-6">
                        <Card className="p-4 shadow-sm border-border/50">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider font-bold">
                                <TrendingUp className="w-4 h-4" />
                                Evolução Financeira
                            </h3>
                            <LtvHistory purchases={purchaseData.purchases} totalLtv={purchaseData.ltv} />
                        </Card>

                        <Card className="p-4 shadow-sm border-border/50">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider font-bold">
                                <Clock className="w-4 h-4" />
                                Linha do Tempo
                            </h3>
                            <div className="space-y-4 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-border/30 pl-6 pb-2">
                                <div className="relative">
                                    <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />
                                    <p className="text-xs font-semibold">Capturado no Sistema</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Início do relacionamento com o lead
                                    </p>
                                </div>
                                {purchaseData.purchases.length > 0 && (
                                    <div className="relative">
                                        <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background z-10" />
                                        <p className="text-xs font-semibold">Primeira Compra Realizada</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {new Date(Math.min(...purchaseData.purchases.map(p => new Date(p.date).getTime()))).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                )}
                                <div className="relative">
                                    <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-background z-10" />
                                    <p className="text-xs font-semibold">Última Interação</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {new Date(contact.lastInteraction).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
