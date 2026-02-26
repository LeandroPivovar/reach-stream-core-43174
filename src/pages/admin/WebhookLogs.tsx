import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Terminal, Eye, Clock, Hash, Globe } from 'lucide-react';
import { api } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function WebhookLogs() {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['webhook-logs'],
        queryFn: () => api.getWebhookLogs(),
        refetchInterval: 5000, // Auto refresh every 5s
    });

    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleOpenDetail = (log: any) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    if (isLoading) {
        return (
            <Layout title="Logs de Webhooks">
                <div className="flex justify-center items-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            title="Logs de Webhooks"
            subtitle="Visualize todos os payloads recebidos via webhook"
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white">Administração de Webhooks</h2>
                        <p className="text-muted-foreground mt-2">
                            Endpoint para envio: <code className="bg-muted px-2 py-1 rounded text-primary text-xs">POST /api/webhooks/receive/[source]</code>
                        </p>
                    </div>
                    <Terminal className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Origem (Source)</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.map((log: any) => (
                                <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenDetail(log)}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                            {log.source || 'N/A'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-mono text-[10px]">
                                            {log.method}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate font-mono text-xs text-muted-foreground">
                                        {log.url}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(log)}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            Ver Payload
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {!logs?.length && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Terminal className="h-8 w-8 opacity-20" />
                                            <p>Nenhum webhook recebido ainda.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Detail Modal */}
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-primary" />
                                Detalhes do Webhook #{selectedLog?.id}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                    <Hash className="h-3 w-3" /> ORIGEM
                                </p>
                                <p className="text-sm font-medium">{selectedLog?.source || 'Desconhecida'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> RECEBIDO EM
                                </p>
                                <p className="text-sm font-medium">{selectedLog && new Date(selectedLog.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                    <Globe className="h-3 w-3" /> URL DE RECEBIMENTO
                                </p>
                                <p className="text-xs font-mono bg-muted p-2 rounded break-all">{selectedLog?.url}</p>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 bg-black/20 rounded-lg border border-border p-4">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 text-primary border-b border-primary/20 pb-1">HEADERS</h4>
                                    <pre className="text-xs font-mono text-muted-foreground">
                                        {JSON.stringify(selectedLog?.headers, null, 2)}
                                    </pre>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold mb-2 text-primary border-b border-primary/20 pb-1">PAYLOAD (BODY)</h4>
                                    <pre className="text-xs font-mono text-green-400">
                                        {JSON.stringify(selectedLog?.payload, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setIsDetailModalOpen(false)}>Fechar Detalhes</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
