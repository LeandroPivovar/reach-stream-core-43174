import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import {
    Package,
    User,
    CreditCard,
    Calendar,
    Tag as TagIcon,
    TrendingUp,
    Link as LinkIcon,
    ShoppingCart,
    Mail,
    Hash
} from 'lucide-react';
import { Sale } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SaleDetailsDialogProps {
    sale: Sale | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SaleDetailsDialog({ sale, open, onOpenChange }: SaleDetailsDialogProps) {
    if (!sale) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        Detalhes da Venda #{sale.id}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Informações do Cliente */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-semibold text-sm border-b pb-2">
                            <User className="w-4 h-4" />
                            Informações do Cliente
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Nome:</span>
                                <span className="font-medium">{sale.customerName || 'Não informado'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {sale.customerEmail || 'Não informado'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Informações da Venda */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-semibold text-sm border-b pb-2">
                            <Package className="w-4 h-4" />
                            Detalhes do Pedido
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Data:</span>
                                <span className="font-medium">
                                    {format(new Date(sale.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                                    {sale.status === 'completed' ? 'Pago' : 'Pendente'}
                                </Badge>
                            </div>
                            {sale.externalId && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">ID Externo:</span>
                                    <span className="text-xs font-mono bg-muted px-1 rounded">{sale.externalId}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Itens e Pagamento */}
                    <div className="space-y-4 md:col-span-2">
                        <div className="flex items-center gap-2 font-semibold text-sm border-b pb-2">
                            <CreditCard className="w-4 h-4" />
                            Produto e Pagamento
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{sale.product?.name || 'Produto Removido'}</p>
                                        <p className="text-xs text-muted-foreground">Quantidade: {sale.quantity}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">R$ {Number(sale.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-xs text-muted-foreground">unit. R$ {Number(sale.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cupom e Campanha */}
                    {(sale.couponCode || sale.campaign) && (
                        <div className="space-y-4 md:col-span-2">
                            <div className="flex items-center gap-2 font-semibold text-sm border-b pb-2">
                                <TagIcon className="w-4 h-4" />
                                Promoção e Marketing
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {sale.couponCode && (
                                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 flex items-center gap-3">
                                        <Hash className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-[10px] uppercase text-primary/70 font-bold">Cupom Utilizado</p>
                                            <p className="font-mono font-bold text-primary">{sale.couponCode}</p>
                                        </div>
                                    </div>
                                )}
                                {sale.campaign && (
                                    <div className="bg-blue-500/5 p-3 rounded-lg border border-blue-500/10 flex items-center gap-3">
                                        <TrendingUp className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-[10px] uppercase text-blue-500/70 font-bold">Campanha de Origem</p>
                                            <p className="font-medium text-blue-500">{sale.campaign.name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
