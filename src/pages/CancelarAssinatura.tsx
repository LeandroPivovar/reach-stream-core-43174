import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, XCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export default function CancelarAssinatura() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [confirmed, setConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCancel = async () => {
        setIsLoading(true);
        try {
            await api.cancelSubscription();
            setConfirmed(true);
        } catch (err) {
            toast({ title: 'Erro', description: 'Não foi possível cancelar a assinatura. Tente novamente.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    if (confirmed) {
        return (
            <Layout title="Assinatura Cancelada" subtitle="Seu cancelamento foi processado">
                <div className="max-w-2xl mx-auto mt-12 flex justify-center">
                    <Card className="p-10 text-center space-y-6 w-full">
                        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-12 h-12 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-3">Cancelamento Confirmado</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Sua assinatura foi cancelada com sucesso. Conforme nossa política:
                            </p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-6 text-left space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-orange-500 flex-shrink-0" />
                                <p className="text-sm">
                                    <span className="font-semibold">Cobranças cessadas:</span> você não será mais cobrado a partir de agora.
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-orange-500 flex-shrink-0" />
                                <p className="text-sm">
                                    <span className="font-semibold">Sem reembolso:</span> o valor já pago não será devolvido, conforme os termos de uso.
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                                <p className="text-sm">
                                    <span className="font-semibold">Acesso garantido por 30 dias:</span> todos os benefícios do seu plano continuarão disponíveis por 30 dias a partir da data do último pagamento.
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Esperamos te ver de volta em breve! Se mudar de ideia, basta acessar a página de <span className="font-medium">Assinaturas</span> para reativar.
                        </p>
                        <Button onClick={() => navigate('/assinaturas')} className="px-8">
                            Ir para Assinaturas
                        </Button>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Cancelar Assinatura" subtitle="Revise antes de confirmar o cancelamento">
            <div className="max-w-2xl mx-auto mt-12 flex justify-center">
                <Card className="p-10 w-full space-y-8">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-12 h-12 text-destructive" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Tem certeza que deseja cancelar?</h2>
                            <p className="text-muted-foreground">
                                Esta ação irá cancelar sua assinatura atual. Leia as informações abaixo antes de prosseguir.
                            </p>
                        </div>
                    </div>

                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wide text-destructive">O que acontece ao cancelar:</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                                <p className="text-sm">As cobranças serão encerradas imediatamente após o cancelamento.</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                                <p className="text-sm">O valor já pago <strong>não será reembolsado</strong>, conforme os termos de uso da plataforma.</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm">Seus benefícios <strong>continuarão disponíveis por 30 dias</strong> a partir da data do seu último pagamento.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate('/assinaturas')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Não, manter assinatura
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            disabled={isLoading}
                            onClick={handleCancel}
                        >
                            {isLoading ? 'Cancelando...' : 'Sim, cancelar assinatura'}
                        </Button>
                    </div>
                </Card>
            </div>
        </Layout>
    );
}
