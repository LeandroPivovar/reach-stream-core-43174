import React from 'react';
import { Filter, Calendar, Users, ShoppingBag, MapPin, Ticket, ShoppingCart, UserCheck, Clock } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const segmentationRules = [
    {
        id: 'birthday',
        name: 'Aniversariantes do Mês',
        description: 'Contatos que fazem aniversário no mês atual.',
        logic: 'EXTRACT(MONTH FROM birthDate) = Mês Atual',
        icon: Calendar,
        type: 'Automático',
        color: 'bg-pink-500/10 text-pink-500 border-pink-500/20'
    },
    {
        id: 'gender_male',
        name: 'Sexo: Masculino',
        description: 'Contatos identificados como do sexo masculino.',
        logic: "gender = 'M'",
        icon: Users,
        type: 'Automático',
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
        id: 'gender_female',
        name: 'Sexo: Feminino',
        description: 'Contatos identificados como do sexo feminino.',
        logic: "gender = 'F'",
        icon: Users,
        type: 'Automático',
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
    {
        id: 'lead_captured',
        name: 'Lead Capturado',
        description: 'Contatos que entraram no sistema como leads.',
        logic: "status = 'lead'",
        icon: UserCheck,
        type: 'Automático',
        color: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    },
    {
        id: 'inactive_customers',
        name: 'Clientes Inativos (90 dias)',
        description: 'Clientes que não realizam compras há mais de 90 dias.',
        logic: 'Última compra < 90 dias atrás',
        icon: Clock,
        type: 'Automático',
        color: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    },
    {
        id: 'no_purchase_x_days',
        name: 'Sem compras (30 dias)',
        description: 'Contatos que não compraram nos últimos 30 dias.',
        logic: 'Última compra < 30 dias atrás',
        icon: ShoppingBag,
        type: 'Automático',
        color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    },
    {
        id: 'by_purchase_count',
        name: 'Pelo menos 1 compra',
        description: 'Contatos que já realizaram ao menos uma compra.',
        logic: 'Contagem de compras > 0',
        icon: ShoppingCart,
        type: 'Automático',
        color: 'bg-green-500/10 text-green-500 border-green-500/20'
    },
    {
        id: 'high_ticket',
        name: 'Alto Ticket Médio',
        description: 'Clientes com ticket médio superior a R$ 500,00.',
        logic: 'Média de valores de compra > 500',
        icon: Filter,
        type: 'Automático',
        color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    },
    {
        id: 'by_state',
        name: 'Por Estado (UF)',
        description: 'Segmentação baseada na Unidade Federativa do contato.',
        logic: 'Agrupamento por campo state',
        icon: MapPin,
        type: 'Automático',
        color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    },
    {
        id: 'active_coupon',
        name: 'Cupom Ativo',
        description: 'Contatos com cupons de desconto ativos.',
        logic: 'Atribuição Manual / Integração Futura',
        icon: Ticket,
        type: 'Manual',
        color: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    }
];

export default function AdminSegmentations() {
    return (
        <AdminLayout
            title="Regras de Segmentação"
            subtitle="Visualize as regras automáticas utilizadas para agrupar seus contatos."
        >
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Filter className="w-5 h-5 text-primary" />
                            Regras do Sistema
                        </CardTitle>
                        <CardDescription>
                            Estas regras são processadas diretamente no banco de dados para garantir performance e consistência em campanhas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[250px]">Nome da Regra</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Lógica Aplicada</TableHead>
                                        <TableHead className="w-[120px]">Tipo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {segmentationRules.map((rule) => {
                                        const Icon = rule.icon;
                                        return (
                                            <TableRow key={rule.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${rule.color.split(' ')[0]}`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <span>{rule.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {rule.description}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">
                                                        {rule.logic}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={rule.type === 'Automático' ? 'default' : 'secondary'}>
                                                        {rule.type}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                                <Clock className="w-4 h-4" />
                                Atualização Dinâmica
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                As segmentações automáticas não requerem intervenção manual. Elas são recalculadas a cada envio de campanha ou visualização do dashboard, garantindo que novos contatos sejam incluídos instantaneamente se atenderem aos critérios.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                Critérios de Compra
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Regras baseadas em compras analisam o histórico completo de pedidos do contato. O sistema monitora tanto a frequência quanto o valor total (LTV) para gerar insights precisos de segmentação.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
