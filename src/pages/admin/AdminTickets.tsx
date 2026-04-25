import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LifeBuoy, 
  Search, 
  Clock, 
  CheckCircle2, 
  Send,
  ChevronLeft,
  User,
  Filter,
  MoreVertical
} from 'lucide-react';
import { api, Ticket, TicketMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminTickets() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  useEffect(() => {
    if (selectedTicket && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket?.messages]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await api.ticketsApi.getAll();
      if (filterStatus !== 'all') {
        setTickets(data.filter(t => t.status === filterStatus));
      } else {
        setTickets(data);
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar tickets',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTicketDetail = async (id: number) => {
    try {
      const data = await api.ticketsApi.getById(id);
      setSelectedTicket(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar conversa',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      setIsSending(true);
      await api.ticketsApi.addMessage(selectedTicket.id, newMessage);
      setNewMessage('');
      loadTicketDetail(selectedTicket.id);
      loadTickets(); // Update status in list
    } catch (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFinishTicket = async () => {
    if (!selectedTicket) return;

    try {
      setIsSending(true);
      await api.ticketsApi.finish(selectedTicket.id);
      toast({
        title: 'Ticket finalizado',
        description: 'O ticket foi marcado como resolvido.',
      });
      loadTicketDetail(selectedTicket.id);
      loadTickets();
    } catch (error) {
      toast({
        title: 'Erro ao finalizar ticket',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case 'respondido':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Respondido</Badge>;
      case 'finalizado':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Finalizado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="Tickets de Suporte">
      <div className="flex h-[calc(100vh-160px)] gap-6">
        {/* Ticket List */}
        <Card className={`flex-[0.4] flex flex-col overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Gerenciar Tickets</h3>
              <div className="flex items-center gap-2">
                <select 
                  className="text-xs border rounded p-1"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="pendente">Pendentes</option>
                  <option value="respondido">Respondidos</option>
                  <option value="finalizado">Finalizados</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por assunto ou usuário..." className="pl-8 h-8 text-sm" />
            </div>
          </div>

          <ScrollArea className="flex-1 divide-y">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Nenhum ticket encontrado.</div>
            ) : (
              tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'bg-muted border-l-4 border-primary' : ''}`}
                  onClick={() => loadTicketDetail(ticket.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono text-muted-foreground">#{ticket.id}</span>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <h4 className="font-medium text-sm truncate">{ticket.subject}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">
                        {ticket.user ? `${ticket.user.firstName} ${ticket.user.lastName}` : 'Desconhecido'}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(ticket.updatedAt), "dd/MM HH:mm")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </Card>

        {/* Ticket Chat */}
        <Card className={`flex-1 flex flex-col overflow-hidden ${!selectedTicket ? 'hidden lg:flex items-center justify-center bg-muted/20' : 'flex'}`}>
          {selectedTicket ? (
            <>
              <div className="p-4 border-b bg-muted/30 flex justify-between items-center sm:px-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedTicket(null)}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <h3 className="font-semibold text-sm">#{selectedTicket.id} - {selectedTicket.subject}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{selectedTicket.category}</span>
                      <span className="text-xs px-1 opacity-50">•</span>
                      <span className="text-xs text-primary font-medium">{selectedTicket.user?.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'finalizado' && (
                    <Button variant="outline" size="sm" onClick={handleFinishTicket} disabled={isSending}>
                      Finalizar Ticket
                    </Button>
                  )}
                  <Button variant="ghost" size="icon">
                     <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
                <div className="space-y-6">
                  {selectedTicket.messages?.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex flex-col gap-1 max-w-[85%]">
                         <div className={`flex items-center gap-2 px-1 mb-0.5 ${msg.isAdmin ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] font-medium text-muted-foreground">
                               {msg.isAdmin ? 'Administração' : `${selectedTicket.user?.firstName} ${selectedTicket.user?.lastName}`}
                            </span>
                            <span className="text-[9px] text-muted-foreground opacity-70">
                               {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                            </span>
                         </div>
                        <div className={`p-3 rounded-lg ${
                          msg.isAdmin 
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                            : 'bg-muted text-foreground rounded-tl-none border shadow-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {selectedTicket.status !== 'finalizado' ? (
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-background flex gap-2">
                  <Input 
                    placeholder="Responda ao cliente..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isSending || !newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <div className="p-6 border-t bg-muted/30 text-center">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Este ticket foi finalizado em {format(new Date(selectedTicket.updatedAt), "dd/MM/yyyy")}.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-4 p-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <LifeBuoy className="w-10 h-10 text-muted-foreground opacity-20" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-muted-foreground">Nenhum ticket selecionado</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Selecione um ticket na lista ao lado para ver a conversa e responder o cliente.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
