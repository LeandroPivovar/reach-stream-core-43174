import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CalendarCheck, 
  MessageSquare,
  Building2,
  Mail,
  Phone,
  Filter,
  RefreshCcw,
  UserCheck
} from 'lucide-react';
import { api, LeadRequest } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: Clock },
  contact_sent: { label: 'Contato Enviado', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: MessageSquare },
  no_response: { label: 'Sem Resposta', color: 'bg-slate-500/10 text-slate-600 border-slate-200', icon: XCircle },
  converted: { label: 'Convertido', color: 'bg-green-500/10 text-green-600 border-green-200', icon: UserCheck },
  meeting_scheduled: { label: 'Reunião Agendada', color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: CalendarCheck },
};

export default function AdminLeadRequests() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = React.useState('');

    const { data: leads, isLoading, refetch } = useQuery({
        queryKey: ['admin-lead-requests'],
        queryFn: () => api.getAdminLeadRequests(),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => 
            api.updateAdminLeadStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-lead-requests'] });
            toast({ title: 'Sucesso', description: 'Status do lead atualizado.' });
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao atualizar status.', variant: 'destructive' });
        }
    });

    const filteredLeads = leads?.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: leads?.length || 0,
        pending: leads?.filter(l => l.status === 'pending').length || 0,
        converted: leads?.filter(l => l.status === 'converted').length || 0,
    };

    return (
        <AdminLayout
            title="Solicitações de Contato"
            subtitle="Gerencie os leads capturados através da Landing Page."
        >
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card className="bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total de Leads</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 backdrop-blur-sm border-yellow-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-600">Aguardando Contato</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 backdrop-blur-sm border-green-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Convertidos</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Buscar por nome, e-mail ou empresa..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                    <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lead / Empresa</TableHead>
                            <TableHead>Contato</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">Carregando leads...</TableCell>
                            </TableRow>
                        ) : filteredLeads?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">Nenhum lead encontrado.</TableCell>
                            </TableRow>
                        ) : filteredLeads?.map((lead) => {
                            const statusInfo = STATUS_CONFIG[lead.status] || STATUS_CONFIG.pending;
                            const StatusIcon = statusInfo.icon;
                            
                            return (
                                <TableRow key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{lead.name}</span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Building2 className="h-3 w-3" /> {lead.company}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <a href={`mailto:${lead.email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {lead.email}
                                            </a>
                                            <a href={`tel:${lead.phone}`} className="text-xs text-slate-600 flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {lead.phone}
                                            </a>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] capitalize">
                                            {lead.source || 'Não informado'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                        {format(new Date(lead.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`gap-1.5 py-1 px-3 border ${statusInfo.color}`}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {statusInfo.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                    <DropdownMenuItem 
                                                        key={key} 
                                                        className="gap-2"
                                                        onClick={() => updateStatusMutation.mutate({ id: lead.id, status: key })}
                                                    >
                                                        <config.icon className="h-4 w-4" />
                                                        {config.label}
                                                    </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-primary gap-2" asChild>
                                                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                                                        <MessageSquare className="h-4 w-4" />
                                                        Chamar no WhatsApp
                                                    </a>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </AdminLayout>
    );
}
