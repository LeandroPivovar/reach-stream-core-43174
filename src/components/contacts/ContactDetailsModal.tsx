import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users, Mail, Phone, MapPin, Calendar,
    ShoppingCart, TrendingUp, Clock, Activity,
    Flame, Zap, Snowflake, DollarSign, MousePointerClick,
    CreditCard, Target, Link2, Package
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
            bg: 'bg-red-50 dark:bg-red-950/30',
            text: 'text-red-600 dark:text-red-400',
            border: 'border-red-400',
            badgeBg: 'bg-red-500',
            label: 'Lead Quente',
            icon: Flame,
            iconBg: 'bg-red-100 dark:bg-red-900/40'
        };
        if (score >= 40) return {
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            text: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-400',
            badgeBg: 'bg-amber-500',
            label: 'Lead Morno',
            icon: Zap,
            iconBg: 'bg-amber-100 dark:bg-amber-900/40'
        };
        return {
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            text: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-400',
            badgeBg: 'bg-blue-500',
            label: 'Lead Frio',
            icon: Snowflake,
            iconBg: 'bg-blue-100 dark:bg-blue-900/40'
        };
    };

    if (!contact) return null;

    const score = calculateScore(contact.id);
    const scoreColors = getScoreColor(score);
    const ScoreIcon = scoreColors.icon;
    const purchaseData = contactPurchases[contact.id] || { purchases: [], ltv: 0 };

    // Calculate metrics
    const averagePurchase = purchaseData.purchases.length > 0
        ? purchaseData.ltv / purchaseData.purchases.length
        : 0;

    const sortedPurchases = [...purchaseData.purchases].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstPurchase = sortedPurchases.length > 0 ? new Date(sortedPurchases[0].date) : null;
    const lastPurchase = sortedPurchases.length > 0 ? new Date(sortedPurchases[sortedPurchases.length - 1].date) : null;

    const daysSinceFirst = firstPurchase
        ? Math.floor((new Date().getTime() - firstPurchase.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const daysSinceLast = lastPurchase
        ? Math.floor((new Date().getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const lastPurchaseValue = sortedPurchases.length > 0
        ? sortedPurchases[sortedPurchases.length - 1].value
        : 0;

    const trend = lastPurchaseValue >= averagePurchase ? 'up' : 'down';
    const trendPercentage = averagePurchase > 0
        ? Math.abs(((lastPurchaseValue - averagePurchase) / averagePurchase) * 100).toFixed(1)
        : "0.0";

    // Build history events from purchases
    const historyEvents: HistoryEvent[] = purchaseData.purchases.map((p, idx) => ({
        id: idx + 1,
        type: 'purchase' as const,
        date: p.date,
        description: 'Compra realizada',
        metadata: { value: p.value, product: p.product }
    }));

    // Score breakdown
    const purchasePoints = purchaseData.purchases.length * (scoreConfig.weights.purchases || 10);
    const ltvPoints = Math.round(purchaseData.ltv / (scoreConfig.weights.ltvDivisor || 10));

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'purchase': return { icon: ShoppingCart, bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-600 dark:text-green-400', label: 'Compra' };
            case 'email_open': return { icon: Mail, bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400', label: 'E-mail Aberto' };
            case 'link_click': return { icon: Link2, bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-600 dark:text-orange-400', label: 'Link Clicado' };
            case 'campaign_participation': return { icon: Target, bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600 dark:text-purple-400', label: 'Campanha' };
            default: return { icon: Activity, bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Evento' };
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-none w-screen h-screen p-0 rounded-none left-0 top-0 translate-x-0 translate-y-0 overflow-y-auto bg-gray-50 dark:bg-background">
                <div className="max-w-[1100px] mx-auto px-6 py-6">
                    {/* Header */}
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-lg font-bold">Perfil Completo do Lead</DialogTitle>
                        <p className="text-sm text-muted-foreground">{contact.name}</p>
                    </DialogHeader>

                    {/* ===== ROW 1: 3 cards side by side ===== */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                        {/* Card 1: Informações de Contato */}
                        <Card className="shadow-sm border-border/50 bg-white dark:bg-card">
                            <CardContent className="p-5">
                                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    Informações de Contato
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium text-right truncate ml-2 max-w-[180px]">{contact.email || 'Não informado'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Telefone:</span>
                                        <span className="font-medium">{contact.phone || 'Não informado'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Localização:</span>
                                        <span className="font-medium">
                                            {contact.city && contact.state ? `${contact.city},${contact.state}` : contact.state || 'Não informado'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Score do Lead */}
                        <Card className={`shadow-sm border-2 ${scoreColors.border} ${scoreColors.bg}`}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                        Score do Lead
                                    </h3>
                                    <div className={`w-12 h-12 rounded-full ${scoreColors.badgeBg} flex items-center justify-center`}>
                                        <span className="text-white text-sm font-bold">{score}/100</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-lg ${scoreColors.iconBg} flex items-center justify-center`}>
                                        <ScoreIcon className={`w-5 h-5 ${scoreColors.text}`} />
                                    </div>
                                    <div>
                                        <p className={`text-base font-bold ${scoreColors.text}`}>{scoreColors.label}</p>
                                        <p className="text-xs text-muted-foreground">Classificação automática</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-sm bg-blue-400 inline-block"></span>
                                            E-mails abertos × {scoreConfig.weights.emailOpens}pts
                                        </span>
                                        <span className="font-semibold">0 pts</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-sm bg-orange-400 inline-block"></span>
                                            Cliques em links × {scoreConfig.weights.linkClicks}pts
                                        </span>
                                        <span className="font-semibold">0 pts</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-sm bg-red-400 inline-block"></span>
                                            Compras × {scoreConfig.weights.purchases}pts
                                        </span>
                                        <span className="font-semibold">{purchasePoints} pts</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-sm bg-green-400 inline-block"></span>
                                            LTV ÷ {scoreConfig.weights.ltvDivisor}
                                        </span>
                                        <span className="font-semibold">{ltvPoints} pts</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 3: LTV Total */}
                        <Card className="shadow-sm border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                            <CardContent className="p-5 flex flex-col justify-between h-full">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                        LTV Total
                                    </h3>
                                    <Badge className="bg-blue-500 hover:bg-blue-600 border-none text-white text-sm px-3 py-1">
                                        R$ {purchaseData.ltv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Valor total gerado pelo cliente
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ===== ROW 2: Payment + Campaign (left), Score chart area (center+right are empty in the screenshot) ===== */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        <div className="space-y-4">
                            {/* Forma de Pagamento */}
                            <Card className="shadow-sm border-border/50 bg-white dark:bg-card">
                                <CardContent className="p-5">
                                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                                        Forma de Pagamento
                                    </h3>
                                    <Badge variant="outline" className="text-xs">
                                        Cartão de crédito
                                    </Badge>
                                </CardContent>
                            </Card>

                            {/* Campanha de Origem */}
                            <Card className="shadow-sm border-border/50 bg-white dark:bg-card">
                                <CardContent className="p-5">
                                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-muted-foreground" />
                                        Campanha de Origem
                                    </h3>
                                    <p className="text-sm font-semibold">Primeira interação</p>
                                    <p className="text-xs text-muted-foreground">Primeira interação com a marca</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* ===== Histórico de LTV Section ===== */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            Histórico de LTV
                        </h3>

                        {/* 4 stat cards in a row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            {/* LTV Total */}
                            <Card className="shadow-sm border-border/50 bg-white dark:bg-card">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">LTV Total</p>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                                                R$ {purchaseData.ltv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ticket Médio */}
                            <Card className="shadow-sm border-border/50 bg-white dark:bg-card">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Ticket Médio</p>
                                            <p className="text-2xl font-bold">
                                                R$ {averagePurchase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                            <div className={`flex items-center gap-1 text-[11px] font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                                                {trend === 'down' && <TrendingUp className="w-3 h-3 rotate-180" />}
                                                {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                                                <span>{trend === 'up' ? '+' : '-'}{trendPercentage}% vs média</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Total de Compras */}
                            <Card className="shadow-sm border-border/50 bg-white dark:bg-card">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Total de Compras</p>
                                            <p className="text-2xl font-bold">{purchaseData.purchases.length}</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {purchaseData.purchases.length > 0 ? `Primeira há ${daysSinceFirst} dias` : 'Nenhuma compra'}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Última Compra */}
                            <Card className="shadow-sm border-border/50 bg-white dark:bg-card">
                                <CardContent className="p-5">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Última Compra</p>
                                        <p className="text-xl font-bold">
                                            R$ {lastPurchaseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {purchaseData.purchases.length > 0 ? `Há ${daysSinceLast} dias` : 'Nenhuma data'}
                                        </p>
                                        <div className="pt-1">
                                            {purchaseData.purchases.length > 0 && daysSinceLast > 30 ? (
                                                <Badge variant="destructive" className="text-[10px] h-5 py-0">
                                                    Risco de churn
                                                </Badge>
                                            ) : purchaseData.purchases.length > 0 ? (
                                                <Badge className="text-[10px] h-5 py-0 bg-green-500 hover:bg-green-600 border-none">
                                                    Cliente ativo
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] h-5 py-0 text-muted-foreground">
                                                    Sem atividade
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* LTV Evolution Chart */}
                        <LtvHistory purchases={purchaseData.purchases} totalLtv={purchaseData.ltv} hideCards={true} />
                    </div>

                    {/* ===== Histórico de Compras ===== */}
                    <Card className="shadow-sm border-border/50 bg-white dark:bg-card mb-6">
                        <CardContent className="p-5">
                            <h3 className="text-base font-semibold mb-4">Histórico de Compras</h3>
                            <div className="space-y-3">
                                {[...purchaseData.purchases]
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((purchase) => (
                                        <div
                                            key={purchase.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                                    <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{purchase.product}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(purchase.date).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-green-600 dark:text-green-400">
                                                R$ {purchase.value.toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                {purchaseData.purchases.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p className="text-sm italic">Nenhuma compra registrada</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ===== Histórico Completo (Timeline) ===== */}
                    <Card className="shadow-sm border-border/50 bg-white dark:bg-card mb-6">
                        <CardContent className="p-5">
                            <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                Histórico Completo
                            </h3>
                            <p className="text-xs text-muted-foreground mb-6">
                                Linha do tempo com todas as interações do lead
                            </p>

                            <div className="space-y-0 relative">
                                {/* Vertical line */}
                                <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-border/40"></div>

                                {historyEvents
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((event, index) => {
                                        const eventStyle = getEventIcon(event.type);
                                        const EventIcon = eventStyle.icon;

                                        return (
                                            <div key={event.id} className="flex items-start gap-4 pb-6 relative">
                                                {/* Icon circle */}
                                                <div className={`w-10 h-10 rounded-full ${eventStyle.bg} flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white dark:ring-background`}>
                                                    <EventIcon className={`w-4 h-4 ${eventStyle.text}`} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 font-semibold">
                                                            {eventStyle.label}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(event.date).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium">{event.description}</p>
                                                    {event.metadata?.product && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Produto: <span className="font-medium">{event.metadata.product}</span>
                                                        </p>
                                                    )}
                                                    {event.metadata?.value && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Valor: <span className="font-medium text-green-600 dark:text-green-400">R$ {event.metadata.value.toFixed(2)}</span>
                                                        </p>
                                                    )}
                                                    {event.metadata?.subject && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Assunto: <span className="font-medium">{event.metadata.subject}</span>
                                                        </p>
                                                    )}
                                                    {event.metadata?.link && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Link: <span className="font-medium">{event.metadata.link}</span>
                                                        </p>
                                                    )}
                                                    {event.metadata?.campaign && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Campanha: <span className="font-medium">{event.metadata.campaign}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                {historyEvents.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p className="text-sm italic">Nenhuma interação registrada</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
