import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LifeBuoy, 
  MessageCircle, 
  Mail, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  Send,
  ChevronLeft,
  MessageSquare
} from 'lucide-react';
import { api, Ticket, TicketMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

export default function Suporte() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    category: 'Relatar Problema',
    message: ''
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket?.messages]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await api.ticketsApi.getAll();
      setTickets(data);
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketData.subject || !newTicketData.message) return;

    try {
      setIsSending(true);
      await api.ticketsApi.create(newTicketData);
      toast({
        title: 'Ticket aberto com sucesso!',
        description: 'Nossa equipe responderá em breve.',
      });
      setShowNewTicketModal(false);
      setNewTicketData({ subject: '', category: 'Relatar Problema', message: '' });
      loadTickets();
    } catch (error) {
      toast({
        title: 'Erro ao abrir ticket',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
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

  if (selectedTicket) {
    return (
      <Layout 
        title={`Ticket #${selectedTicket.id}`} 
        subtitle={selectedTicket.subject}
        actions={
          <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        }
      >
        <div className="flex flex-col h-[calc(100vh-200px)]">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedTicket.status)}
                <span className="text-sm text-muted-foreground">{selectedTicket.category}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Aberto em {format(new Date(selectedTicket.createdAt), "dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {selectedTicket.messages?.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.isAdmin 
                        ? 'bg-muted text-foreground rounded-tl-none' 
                        : 'bg-primary text-primary-foreground rounded-tr-none'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <span className="text-[10px] mt-1 block opacity-70">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {selectedTicket.status !== 'finalizado' ? (
              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                <Input 
                  placeholder="Digite sua mensagem..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <Button type="submit" disabled={isSending || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <div className="p-4 border-t bg-muted/30 text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Este ticket foi finalizado. Caso ainda precise de ajuda, abra um novo ticket.
                </p>
              </div>
            )}
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Suporte"
      subtitle="Gerencie seus tickets e fale com nossa equipe"
      actions={
        <Button onClick={() => setShowNewTicketModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Ticket
        </Button>
      }
    >
      <div className="space-y-6">
        {showNewTicketModal && (
          <Card className="p-6 border-primary/50 shadow-lg animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-semibold mb-4">Abrir Novo Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input 
                    id="subject" 
                    placeholder="Resumo do problema"
                    value={newTicketData.subject}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <select 
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTicketData.category}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option>Relatar Problema</option>
                    <option>Dúvida Técnica</option>
                    <option>Sugestão</option>
                    <option>Financeiro</option>
                    <option>Outros</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Descrição detalhada</Label>
                <Textarea 
                  id="message" 
                  placeholder="Descreva o que está acontecendo..."
                  rows={4}
                  value={newTicketData.message}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowNewTicketModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSending}>
                  {isSending ? 'Abrindo...' : 'Abrir Ticket'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Meus Tickets</h3>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar ticket..." className="pl-8 h-8" />
            </div>
          </div>
          
          <div className="divide-y">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="max-w-[200px] mx-auto text-sm text-muted-foreground text-center">
                  Você ainda não possui tickets abertos.
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowNewTicketModal(true)}>
                  Abrir meu primeiro ticket
                </Button>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between"
                  onClick={() => loadTicketDetail(ticket.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ticket.status === 'pendente' ? 'bg-yellow-100' : 
                      ticket.status === 'respondido' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      <LifeBuoy className={`w-5 h-5 ${
                        ticket.status === 'pendente' ? 'text-yellow-600' : 
                        ticket.status === 'respondido' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">#{ticket.id} - {ticket.subject}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{ticket.category}</span>
                        <span className="text-xs text-muted-foreground px-1">•</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Atualizado {format(new Date(ticket.updatedAt), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Existing support channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card className="p-6 flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-4">Atendimento rápido para dúvidas diretas.</p>
              <Button variant="link" className="p-0 h-auto text-primary" asChild>
                <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
              </Button>
            </div>
          </Card>
          <Card className="p-6 flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">E-mail</h3>
              <p className="text-sm text-muted-foreground mb-4">Questões financeiras ou administrativas.</p>
              <Button variant="link" className="p-0 h-auto text-primary" asChild>
                <a href="mailto:suporte@nucleocrm.com.br">suporte@nucleocrm.com.br</a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
