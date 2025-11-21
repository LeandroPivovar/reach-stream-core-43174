import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { WorkflowCanvas, WorkflowStep } from '@/components/workflow/WorkflowCanvas';
import { SegmentationPicker } from '@/components/campaigns/SegmentationPicker';
import { WhatsappPreview } from '@/components/campaigns/WhatsappPreview';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  MessageSquare, 
  Mail, 
  Smartphone,
  MoreHorizontal,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Users,
  ArrowLeft,
  ArrowRight,
  Send,
  Clock,
  Download,
  Link2,
  BarChart2,
  Zap,
  Tag,
  Gift,
  DollarSign,
  Upload,
  X,
  Image
} from 'lucide-react';

export default function Campanhas() {
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 10;
  const [newCampaign, setNewCampaign] = useState({
    campaignComplexity: '' as 'simple' | 'advanced' | '',
    name: '',
    groups: [] as string[],
    segmentations: [] as string[],
    channel: '' as 'email' | 'sms' | 'whatsapp' | '',
    campaignType: '' as 'dispatch' | 'coupon' | 'giftback' | '',
    campaignConfig: {
      enableCoupon: false,
      enableGiftback: false,
      coupon: {
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: '',
        validityDate: undefined as Date | undefined
      },
      giftback: {
        giftValue: '',
        maxRedemptions: '',
        validityDate: undefined as Date | undefined
      }
    },
    email: { 
      subject: '', 
      content: '', 
      mode: 'text' as 'text' | 'html',
      media: [] as { url: string; type: 'image' | 'video'; name: string }[]
    },
    workflow: [] as WorkflowStep[],
    tracking: {
      type: '' as 'utm' | 'pixel' | 'shortlink' | '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: ''
    },
    scheduleType: 'now' as 'now' | 'schedule',
    scheduleDate: '',
    scheduleTime: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newMedia = Array.from(files).map(file => ({
        url: URL.createObjectURL(file),
        type: (file.type.startsWith('video/') ? 'video' : 'image') as 'image' | 'video',
        name: file.name
      }));
      setNewCampaign({
        ...newCampaign,
        email: {
          ...newCampaign.email,
          media: [...newCampaign.email.media, ...newMedia]
        }
      });
    }
  };

  const removeMedia = (index: number) => {
    setNewCampaign({
      ...newCampaign,
      email: {
        ...newCampaign.email,
        media: newCampaign.email.media.filter((_, i) => i !== index)
      }
    });
  };

  const contactGroups = [
    { name: 'VIP', count: 342, description: 'Clientes de alto valor' },
    { name: 'Regular', count: 1847, description: 'Clientes ativos regulares' },
    { name: 'Novos', count: 523, description: 'Últimos 30 dias' },
    { name: 'Inativos', count: 1205, description: 'Sem compras há 90+ dias' }
  ];

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Promoção Black Friday',
      type: ['WhatsApp', 'E-mail'],
      status: 'ativa',
      recipients: 5247,
      sent: 2847,
      opens: 1943,
      clicks: 312,
      responses: 89,
      revenue: 45890.50,
      createdAt: '2024-03-15',
      scheduledAt: '2024-03-20 09:00'
    },
    {
      id: 2,
      name: 'Carrinho Abandonado',
      type: ['E-mail'],
      status: 'pausada',
      recipients: 1254,
      sent: 1254,
      opens: 834,
      clicks: 127,
      responses: 23,
      revenue: 12340.00,
      createdAt: '2024-03-10',
      scheduledAt: null
    },
    {
      id: 3,
      name: 'Novos Produtos - Março',
      type: ['SMS'],
      status: 'agendada',
      recipients: 892,
      sent: 0,
      opens: 0,
      clicks: 0,
      responses: 0,
      revenue: 0,
      createdAt: '2024-03-18',
      scheduledAt: '2024-03-25 14:00'
    },
    {
      id: 4,
      name: 'Newsletter Semanal',
      type: ['E-mail'],
      status: 'finalizada',
      recipients: 3421,
      sent: 3421,
      opens: 2156,
      clicks: 445,
      responses: 67,
      revenue: 28750.80,
      createdAt: '2024-03-12',
      scheduledAt: null
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-500';
      case 'pausada': return 'bg-yellow-500';
      case 'agendada': return 'bg-blue-500';
      case 'finalizada': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ativa': return 'default';
      case 'pausada': return 'secondary';
      case 'agendada': return 'outline';
      case 'finalizada': return 'secondary';
      default: return 'secondary';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WhatsApp': return MessageSquare;
      case 'E-mail': return Mail;
      case 'SMS': return Smartphone;
      default: return MessageSquare;
    }
  };

  const getTotalSteps = () => {
    if (newCampaign.campaignComplexity === 'simple') {
      // Simple: 1. Complexity + 2. Segmentation + 3. Basic Data + 4. Channel + 5. Email/SMS/WhatsApp + 6. Coupon/Giftback + 7. Tracking/Send
      return 7;
    }
    // Advanced: 1. Complexity + 2. Segmentation + 3. Name + 4. Workflow (tudo configurado lá)
    return 4;
  };

  // Mock contacts data
  const mockContacts = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', phone: '(11) 98765-4321', segment: 'VIP' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 97654-3210', segment: 'Regular' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(11) 96543-2109', segment: 'VIP' },
    { id: 4, name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 95432-1098', segment: 'Novos' },
    { id: 5, name: 'Carlos Souza', email: 'carlos@email.com', phone: '(11) 94321-0987', segment: 'Regular' },
    { id: 6, name: 'Fernanda Lima', email: 'fernanda@email.com', phone: '(11) 93210-9876', segment: 'VIP' },
    { id: 7, name: 'Ricardo Alves', email: 'ricardo@email.com', phone: '(11) 92109-8765', segment: 'Inativos' },
    { id: 8, name: 'Juliana Rocha', email: 'juliana@email.com', phone: '(11) 91098-7654', segment: 'Regular' },
    { id: 9, name: 'Bruno Martins', email: 'bruno@email.com', phone: '(11) 90987-6543', segment: 'Novos' },
    { id: 10, name: 'Patricia Dias', email: 'patricia@email.com', phone: '(11) 89876-5432', segment: 'VIP' },
    { id: 11, name: 'Lucas Ferreira', email: 'lucas@email.com', phone: '(11) 88765-4321', segment: 'Regular' },
    { id: 12, name: 'Amanda Ribeiro', email: 'amanda@email.com', phone: '(11) 87654-3210', segment: 'Inativos' },
    { id: 13, name: 'Rafael Gomes', email: 'rafael@email.com', phone: '(11) 86543-2109', segment: 'VIP' },
    { id: 14, name: 'Camila Cardoso', email: 'camila@email.com', phone: '(11) 85432-1098', segment: 'Novos' },
    { id: 15, name: 'Thiago Mendes', email: 'thiago@email.com', phone: '(11) 84321-0987', segment: 'Regular' },
    { id: 16, name: 'Beatriz Castro', email: 'beatriz@email.com', phone: '(11) 83210-9876', segment: 'VIP' },
    { id: 17, name: 'Gustavo Pinto', email: 'gustavo@email.com', phone: '(11) 82109-8765', segment: 'Regular' },
    { id: 18, name: 'Larissa Barros', email: 'larissa@email.com', phone: '(11) 81098-7654', segment: 'Inativos' },
    { id: 19, name: 'Rodrigo Teixeira', email: 'rodrigo@email.com', phone: '(11) 80987-6543', segment: 'Novos' },
    { id: 20, name: 'Vanessa Moura', email: 'vanessa@email.com', phone: '(11) 79876-5432', segment: 'VIP' },
  ];

  const getFilteredContacts = () => {
    if (newCampaign.segmentations.length === 0) return [];
    // In a real app, this would filter based on actual segmentation rules
    return mockContacts;
  };

  const filteredContacts = getFilteredContacts();
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * contactsPerPage,
    currentPage * contactsPerPage
  );

  const handleNextStep = () => {
    if (currentStep < getTotalSteps()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleGroup = (groupName: string) => {
    setNewCampaign(prev => ({
      ...prev,
      groups: prev.groups.includes(groupName)
        ? prev.groups.filter(g => g !== groupName)
        : [...prev.groups, groupName]
    }));
  };


  const handleCreateCampaign = () => {
    console.log('Creating campaign:', newCampaign);
    setIsNewCampaignOpen(false);
    setCurrentStep(1);
    setNewCampaign({
      campaignComplexity: '',
      name: '',
      groups: [],
      segmentations: [],
      channel: '',
      campaignType: '',
      campaignConfig: {
        enableCoupon: false,
        enableGiftback: false,
        coupon: {
          discountType: 'percentage',
          discountValue: '',
          validityDate: undefined
        },
        giftback: {
          giftValue: '',
          maxRedemptions: '',
          validityDate: undefined
        }
      },
      email: { 
        subject: '', 
        content: '', 
        mode: 'text',
        media: []
      },
      workflow: [],
      tracking: {
        type: '',
        utmSource: '',
        utmMedium: '',
        utmCampaign: ''
      },
      scheduleType: 'now',
      scheduleDate: '',
      scheduleTime: ''
    });
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log('Exporting campaigns as:', format);
    setIsExportOpen(false);
  };

  const actions = (
    <>
      <HeaderActions.Filter onClick={() => console.log('Filter clicked')} />
      <HeaderActions.Export onClick={() => setIsExportOpen(true)} />
      <HeaderActions.Add onClick={() => setIsNewCampaignOpen(true)}>
        Nova Campanha
      </HeaderActions.Add>
    </>
  );

  return (
    <Layout 
      title="Campanhas" 
      subtitle="Gerencie suas campanhas de marketing multicanal"
      actions={actions}
      showSearch
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enviado</p>
                <p className="text-2xl font-bold text-foreground">7.522</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
                <p className="text-2xl font-bold text-foreground">64.8%</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(campaigns.reduce((acc, c) => acc + c.revenue, 0))}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Campanha</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Canais</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Destinatários</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Enviados</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Aberturas</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Cliques</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Faturamento</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-border last:border-0">
                    <td className="py-4 px-2">
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Criada em {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        {campaign.scheduledAt && (
                          <div className="text-xs text-muted-foreground">
                            Agendada para {new Date(campaign.scheduledAt).toLocaleString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex flex-wrap gap-1">
                        {campaign.type.map((channel) => {
                          const Icon = getChannelIcon(channel);
                          return (
                            <div key={channel} className="flex items-center space-x-1 bg-muted/50 rounded-full px-2 py-1">
                              <Icon className="w-3 h-3" />
                              <span className="text-xs">{channel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant={getStatusVariant(campaign.status)}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(campaign.status)}`}></div>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-right font-medium">
                      {campaign.recipients.toLocaleString()}
                    </td>
                    <td className="py-4 px-2 text-right font-medium">
                      {campaign.sent.toLocaleString()}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="font-medium">{campaign.opens.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {campaign.sent > 0 ? ((campaign.opens / campaign.sent) * 100).toFixed(1) : 0}%
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="font-medium">{campaign.clicks.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {campaign.opens > 0 ? ((campaign.clicks / campaign.opens) * 100).toFixed(1) : 0}%
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="font-medium text-green-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(campaign.revenue)}
                      </div>
                      {campaign.sent > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(campaign.revenue / campaign.sent)} / envio
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ações da Campanha</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-2">
                            <Button variant="ghost" className="justify-start">
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar Relatório
                            </Button>
                            <Button variant="ghost" className="justify-start">
                              <Edit className="w-4 h-4 mr-2" />
                              Editar Campanha
                            </Button>
                            {campaign.status === 'ativa' ? (
                              <Button variant="ghost" className="justify-start">
                                <Pause className="w-4 h-4 mr-2" />
                                Pausar Campanha
                              </Button>
                            ) : campaign.status === 'pausada' ? (
                              <Button variant="ghost" className="justify-start">
                                <Play className="w-4 h-4 mr-2" />
                                Reativar Campanha
                              </Button>
                            ) : null}
                            <Button variant="ghost" className="justify-start text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir Campanha
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Nova Campanha */}
      <Dialog open={isNewCampaignOpen} onOpenChange={(open) => {
        setIsNewCampaignOpen(open);
        if (!open) {
          setCurrentStep(1);
          setCurrentPage(1);
          setNewCampaign({
            campaignComplexity: '',
            name: '',
            groups: [],
            segmentations: [],
            channel: '',
            campaignType: '',
            campaignConfig: {
              enableCoupon: false,
              enableGiftback: false,
              coupon: {
                discountType: 'percentage',
                discountValue: '',
                validityDate: undefined
              },
              giftback: {
                giftValue: '',
                maxRedemptions: '',
                validityDate: undefined
              }
            },
            email: { 
              subject: '', 
              content: '', 
              mode: 'text',
              media: []
            },
            workflow: [],
            tracking: {
              type: '',
              utmSource: '',
              utmMedium: '',
              utmCampaign: ''
            },
            scheduleType: 'now',
            scheduleDate: '',
            scheduleTime: ''
          });
        }
      }}>
        <DialogContent className={cn(
          "overflow-y-auto",
          // Expandir apenas no passo do workflow
          newCampaign.campaignComplexity === 'advanced' && currentStep === 4
            ? "!max-w-[98vw] !w-[98vw] !max-h-[98vh] !h-[98vh] p-8"
            : newCampaign.campaignComplexity === 'simple' && currentStep === 5 && newCampaign.channel === 'whatsapp'
            ? "max-w-6xl max-h-[90vh]"
            : "max-w-3xl max-h-[90vh]"
        )}>
          <DialogHeader>
            <DialogTitle>Nova Campanha - Etapa {currentStep} de {getTotalSteps()}</DialogTitle>
          </DialogHeader>

          {/* Etapa 1: Seleção de Complexidade */}
          {currentStep === 1 && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Escolha o tipo de campanha mais adequado para suas necessidades
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Tipo de Campanha *</Label>
                <div className="grid grid-cols-1 gap-4">
                  <Card 
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.campaignComplexity === 'simple' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ 
                      ...newCampaign, 
                      campaignComplexity: 'simple',
                      campaignType: 'dispatch' // Simple campaigns are always dispatch
                    })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Campanha Simples</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Fluxo simplificado e rápido para envio direto de mensagens
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Apenas nome, grupos e conteúdo do e-mail</li>
                          <li>• Envio imediato ou agendado</li>
                          <li>• Ideal para iniciantes ou comunicações rápidas</li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.campaignComplexity === 'advanced' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ ...newCampaign, campaignComplexity: 'advanced' })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart2 className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Campanha Avançada</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Controle total com automações, cupons e análises detalhadas
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Cupons de desconto e giftback</li>
                          <li>• Editor HTML avançado para e-mails</li>
                          <li>• Workflow de automação personalizado</li>
                          <li>• Projeção de resultados e tracking completo</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleNextStep}
                  disabled={!newCampaign.campaignComplexity}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 2: Segmentação de Clientes */}
          {currentStep === 2 && (
            <div className="space-y-6 py-4">
              <SegmentationPicker
                selectedSegments={newCampaign.segmentations}
                onSegmentsChange={(segments) => {
                  setNewCampaign({ ...newCampaign, segmentations: segments });
                  setCurrentPage(1); // Reset pagination when segmentation changes
                }}
              />

              {/* Tabela de Contatos Impactados */}
              {newCampaign.segmentations.length > 0 && filteredContacts.length > 0 && (
                <Card className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">Contatos que receberão a campanha</h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredContacts.length} contato(s) impactado(s)
                    </p>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Segmento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedContacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell>{contact.email}</TableCell>
                            <TableCell>{contact.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{contact.segment}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={newCampaign.segmentations.length === 0}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 3: Dados Básicos (apenas para simple) */}
          {currentStep === 3 && newCampaign.campaignComplexity === 'simple' && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Defina o nome da sua campanha
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="campaign-name">Nome da Campanha *</Label>
                <Input
                  id="campaign-name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="Ex: Promoção Black Friday 2025"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!newCampaign.name}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 4: Seleção de Canal (apenas para simple) */}
          {currentStep === 4 && newCampaign.campaignComplexity === 'simple' && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Escolha o canal de comunicação para sua campanha
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Canal de Envio *</Label>
                <div className="grid grid-cols-1 gap-4">
                  <Card 
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.channel === 'email' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ ...newCampaign, channel: 'email' })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">E-mail</h3>
                        <p className="text-sm text-muted-foreground">
                          Envio de e-mails com suporte a HTML, imagens e links. Ideal para newsletters e comunicações detalhadas.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.channel === 'sms' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ ...newCampaign, channel: 'sms' })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">SMS</h3>
                        <p className="text-sm text-muted-foreground">
                          Mensagens de texto diretas e imediatas. Perfeito para alertas urgentes e confirmações.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.channel === 'whatsapp' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ ...newCampaign, channel: 'whatsapp' })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
                        <p className="text-sm text-muted-foreground">
                          Mensagens via WhatsApp Business com suporte a mídia e botões interativos.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!newCampaign.channel}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}


          {/* Email/SMS/WhatsApp Content Editor Step (apenas para simple) */}
          {newCampaign.campaignComplexity === 'simple' && currentStep === 5 && (
            <div className="space-y-6 py-4">
              {newCampaign.channel === 'whatsapp' ? (
                <div className="flex gap-6">
                  {/* Form Content */}
                  <div className="flex-1 space-y-6">
                    <div className="bg-green-600/10 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Configure a mensagem do WhatsApp</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Suporta texto formatado, emojis e até 4096 caracteres
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="whatsapp-content">Mensagem WhatsApp *</Label>
                      <Textarea
                        id="whatsapp-content"
                        value={newCampaign.email.content}
                        onChange={(e) => setNewCampaign({ 
                          ...newCampaign, 
                          email: { ...newCampaign.email, content: e.target.value }
                        })}
                        placeholder="Digite a mensagem do WhatsApp..."
                        rows={8}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use *negrito*, _itálico_, ~tachado~ para formatar o texto
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label>Anexar Imagem ou Vídeo</Label>
                      <div className="flex flex-col gap-3">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            id="whatsapp-media-upload"
                          />
                          <label htmlFor="whatsapp-media-upload">
                            <Button type="button" variant="outline" className="w-full" asChild>
                              <div className="cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload de Mídia
                              </div>
                            </Button>
                          </label>
                        </div>
                        {newCampaign.email.media.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {newCampaign.email.media.map((item, index) => (
                              <div key={index} className="relative group border rounded-md p-2">
                                <div className="flex items-center gap-2">
                                  {item.type === 'image' ? (
                                    <img src={item.url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                  ) : (
                                    <video src={item.url} className="w-12 h-12 object-cover rounded" />
                                  )}
                                  <span className="text-xs truncate flex-1">{item.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => removeMedia(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* WhatsApp Preview */}
                  <WhatsappPreview 
                    content={newCampaign.email.content} 
                    media={newCampaign.email.media}
                  />
                </div>
              ) : (
                <>
                  {newCampaign.channel === 'email' && (
                    <>
                      <div className="bg-orange-500/10 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">Configure o conteúdo do seu e-mail</span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email-subject">Assunto do E-mail *</Label>
                    <Input
                      id="email-subject"
                      value={newCampaign.email.subject}
                      onChange={(e) => setNewCampaign({ 
                        ...newCampaign, 
                        email: { ...newCampaign.email, subject: e.target.value }
                      })}
                      placeholder="Ex: Aproveite 20% de desconto na Black Friday!"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email-content">Conteúdo do E-mail *</Label>
                    <Textarea
                      id="email-content"
                      value={newCampaign.email.content}
                      onChange={(e) => setNewCampaign({ 
                        ...newCampaign, 
                        email: { ...newCampaign.email, content: e.target.value }
                      })}
                      placeholder="Digite o conteúdo do e-mail..."
                      rows={12}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Anexar Imagem ou Vídeo</Label>
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="email-media-upload"
                        />
                        <label htmlFor="email-media-upload">
                          <Button type="button" variant="outline" className="w-full" asChild>
                            <div className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload de Mídia
                            </div>
                          </Button>
                        </label>
                      </div>
                      {newCampaign.email.media.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {newCampaign.email.media.map((item, index) => (
                            <div key={index} className="relative group border rounded-md p-2">
                              <div className="flex items-center gap-2">
                                {item.type === 'image' ? (
                                  <img src={item.url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                ) : (
                                  <video src={item.url} className="w-12 h-12 object-cover rounded" />
                                )}
                                <span className="text-xs truncate flex-1">{item.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeMedia(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {newCampaign.channel === 'sms' && (
                <>
                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Configure o conteúdo do SMS</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Limite de 160 caracteres por mensagem
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="sms-content">Mensagem SMS *</Label>
                      <span className="text-xs text-muted-foreground">
                        {newCampaign.email.content.length}/160
                      </span>
                    </div>
                    <Textarea
                      id="sms-content"
                      value={newCampaign.email.content}
                      onChange={(e) => {
                        if (e.target.value.length <= 160) {
                          setNewCampaign({ 
                            ...newCampaign, 
                            email: { ...newCampaign.email, content: e.target.value }
                          });
                        }
                      }}
                      placeholder="Digite a mensagem do SMS..."
                      rows={4}
                      maxLength={160}
                    />
                  </div>
                </>
              )}

              </>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={
                    newCampaign.channel === 'email' 
                      ? !newCampaign.email.subject || !newCampaign.email.content
                      : !newCampaign.email.content
                  }
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 3: Nome da Campanha (apenas para advanced) */}
          {currentStep === 3 && newCampaign.campaignComplexity === 'advanced' && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Defina o nome da sua campanha avançada
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="campaign-name-advanced">Nome da Campanha *</Label>
                <Input
                  id="campaign-name-advanced"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="Ex: Campanha de Reengajamento Q1 2025"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!newCampaign.name}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Workflow Step (only for advanced) */}
          {newCampaign.campaignComplexity === 'advanced' && currentStep === 4 && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">Editor de Workflow Visual</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure sua automação completa: adicione nós de e-mail, SMS, WhatsApp, condições, delays e muito mais. 
                  Clique nos nós para configurar o conteúdo das mensagens, agendamento e outras opções.
                </p>
              </div>

              <WorkflowCanvas
                workflow={newCampaign.workflow}
                onChange={(workflow) => setNewCampaign({ ...newCampaign, workflow })}
              />

              {/* Resumo da Campanha */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card className="p-4 border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Contatos impactados</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {(() => {
                      // Calcular total de afetados baseado nas segmentações
                      const mockAffectedCounts: Record<string, number> = {
                        'by_purchase_count': 2847,
                        'birthday': 142,
                        'inactive_customers': 1523,
                        'active_coupon': 634,
                        'high_ticket': 458,
                        'purchase_value_x': 891,
                        'lead_captured': 3241,
                        'cart_recovered_customer': 287,
                        'no_purchase_x_days': 1876,
                        'gender_male': 4562,
                        'gender_female': 5123,
                        'by_state': 9685,
                        'all': 9685
                      };
                      
                      const total = newCampaign.segmentations.reduce((sum, seg) => {
                        return sum + (mockAffectedCounts[seg] || 0);
                      }, 0);
                      
                      return total.toLocaleString('pt-BR');
                    })()}
                  </p>
                </Card>

                <Card className="p-4 border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-muted-foreground">Créditos</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {(() => {
                      const mockAffectedCounts: Record<string, number> = {
                        'by_purchase_count': 2847,
                        'birthday': 142,
                        'inactive_customers': 1523,
                        'active_coupon': 634,
                        'high_ticket': 458,
                        'purchase_value_x': 891,
                        'lead_captured': 3241,
                        'cart_recovered_customer': 287,
                        'no_purchase_x_days': 1876,
                        'gender_male': 4562,
                        'gender_female': 5123,
                        'by_state': 9685,
                        'all': 9685
                      };
                      
                      const total = newCampaign.segmentations.reduce((sum, seg) => {
                        return sum + (mockAffectedCounts[seg] || 0);
                      }, 0);
                      
                      const credits = Math.ceil(total / 100); // 1 crédito a cada 100 pessoas
                      return credits.toLocaleString('pt-BR');
                    })()}
                  </p>
                </Card>

                <Card className="p-4 border-green-500/20 bg-green-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-muted-foreground">Valor Total</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {(() => {
                      const mockAffectedCounts: Record<string, number> = {
                        'by_purchase_count': 2847,
                        'birthday': 142,
                        'inactive_customers': 1523,
                        'active_coupon': 634,
                        'high_ticket': 458,
                        'purchase_value_x': 891,
                        'lead_captured': 3241,
                        'cart_recovered_customer': 287,
                        'no_purchase_x_days': 1876,
                        'gender_male': 4562,
                        'gender_female': 5123,
                        'by_state': 9685,
                        'all': 9685
                      };
                      
                      const total = newCampaign.segmentations.reduce((sum, seg) => {
                        return sum + (mockAffectedCounts[seg] || 0);
                      }, 0);
                      
                      const credits = Math.ceil(total / 100);
                      const valorPorCredito = 0.10;
                      const valorTotal = credits * valorPorCredito;
                      
                      return `R$ ${valorTotal.toFixed(2)}`;
                    })()}
                  </p>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={handleCreateCampaign}>
                  Criar Campanha
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 6: Cupom e Giftback (apenas para simple) */}
          {newCampaign.campaignComplexity === 'simple' && currentStep === 6 && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-primary" />
                  <span className="font-medium">Benefícios Opcionais</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Selecione quais benefícios deseja adicionar à campanha (opcional)
                </p>
              </div>

              {/* Seleção de Benefícios */}
              <div className="space-y-3">
                <Label>Selecione os benefícios que deseja oferecer:</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="enable-coupon"
                      checked={newCampaign.campaignConfig.enableCoupon}
                      onCheckedChange={(checked) => setNewCampaign({
                        ...newCampaign,
                        campaignConfig: {
                          ...newCampaign.campaignConfig,
                          enableCoupon: checked as boolean
                        }
                      })}
                    />
                    <label htmlFor="enable-coupon" className="text-sm font-medium cursor-pointer">
                      Cupom de Desconto
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="enable-giftback"
                      checked={newCampaign.campaignConfig.enableGiftback}
                      onCheckedChange={(checked) => setNewCampaign({
                        ...newCampaign,
                        campaignConfig: {
                          ...newCampaign.campaignConfig,
                          enableGiftback: checked as boolean
                        }
                      })}
                    />
                    <label htmlFor="enable-giftback" className="text-sm font-medium cursor-pointer">
                      Giftback
                    </label>
                  </div>
                </div>
              </div>

              {/* Cupom de Desconto */}
              {newCampaign.campaignConfig.enableCoupon && (
                <Card className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Cupom de Desconto</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure o desconto que será oferecido aos clientes
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Tipo de Desconto */}
                    <div className="grid gap-2">
                      <Label>Tipo de Desconto</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="discount-percentage"
                            name="discount-type"
                            checked={newCampaign.campaignConfig.coupon.discountType === 'percentage'}
                            onChange={() => setNewCampaign({
                              ...newCampaign,
                              campaignConfig: {
                                ...newCampaign.campaignConfig,
                                coupon: {
                                  ...newCampaign.campaignConfig.coupon,
                                  discountType: 'percentage',
                                  discountValue: ''
                                }
                              }
                            })}
                            className="cursor-pointer"
                          />
                          <label htmlFor="discount-percentage" className="text-sm cursor-pointer">
                            Percentual (%)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="discount-fixed"
                            name="discount-type"
                            checked={newCampaign.campaignConfig.coupon.discountType === 'fixed'}
                            onChange={() => setNewCampaign({
                              ...newCampaign,
                              campaignConfig: {
                                ...newCampaign.campaignConfig,
                                coupon: {
                                  ...newCampaign.campaignConfig.coupon,
                                  discountType: 'fixed',
                                  discountValue: ''
                                }
                              }
                            })}
                            className="cursor-pointer"
                          />
                          <label htmlFor="discount-fixed" className="text-sm cursor-pointer">
                            Valor Fixo (R$)
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Valor do Desconto */}
                    <div className="grid gap-2">
                      <Label htmlFor="discount-value">
                        {newCampaign.campaignConfig.coupon.discountType === 'percentage' 
                          ? 'Percentual de Desconto (%)' 
                          : 'Valor do Desconto (R$)'}
                      </Label>
                      <Input
                        id="discount-value"
                        type="number"
                        min="0"
                        max={newCampaign.campaignConfig.coupon.discountType === 'percentage' ? '100' : undefined}
                        step={newCampaign.campaignConfig.coupon.discountType === 'fixed' ? '0.01' : '1'}
                        placeholder={newCampaign.campaignConfig.coupon.discountType === 'percentage' ? 'Ex: 10' : 'Ex: 50.00'}
                        value={newCampaign.campaignConfig.coupon.discountValue}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          campaignConfig: {
                            ...newCampaign.campaignConfig,
                            coupon: {
                              ...newCampaign.campaignConfig.coupon,
                              discountValue: e.target.value
                            }
                          }
                        })}
                      />
                    </div>

                    {/* Data de Validade */}
                    <div className="grid gap-2">
                      <Label>Data de Validade do Cupom</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newCampaign.campaignConfig.coupon.validityDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newCampaign.campaignConfig.coupon.validityDate ? (
                              format(newCampaign.campaignConfig.coupon.validityDate, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione a data de validade</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background" align="start">
                          <Calendar
                            mode="single"
                            selected={newCampaign.campaignConfig.coupon.validityDate}
                            onSelect={(date) => setNewCampaign({
                              ...newCampaign,
                              campaignConfig: {
                                ...newCampaign.campaignConfig,
                                coupon: {
                                  ...newCampaign.campaignConfig.coupon,
                                  validityDate: date
                                }
                              }
                            })}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </Card>
              )}

              {/* Giftback */}
              {newCampaign.campaignConfig.enableGiftback && (
                <Card className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Giftback</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure o giftback que será oferecido aos clientes
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="giftback-value">Valor do Giftback (R$)</Label>
                      <Input
                        id="giftback-value"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ex: 50.00"
                        value={newCampaign.campaignConfig.giftback.giftValue}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          campaignConfig: {
                            ...newCampaign.campaignConfig,
                            giftback: {
                              ...newCampaign.campaignConfig.giftback,
                              giftValue: e.target.value
                            }
                          }
                        })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="max-redemptions">Número Máximo de Resgates</Label>
                      <Input
                        id="max-redemptions"
                        type="number"
                        min="1"
                        placeholder="Ex: 100"
                        value={newCampaign.campaignConfig.giftback.maxRedemptions}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          campaignConfig: {
                            ...newCampaign.campaignConfig,
                            giftback: {
                              ...newCampaign.campaignConfig.giftback,
                              maxRedemptions: e.target.value
                            }
                          }
                        })}
                      />
                    </div>

                    {/* Data de Validade */}
                    <div className="grid gap-2">
                      <Label>Data de Validade do Giftback</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newCampaign.campaignConfig.giftback.validityDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newCampaign.campaignConfig.giftback.validityDate ? (
                              format(newCampaign.campaignConfig.giftback.validityDate, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione a data de validade</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background" align="start">
                          <Calendar
                            mode="single"
                            selected={newCampaign.campaignConfig.giftback.validityDate}
                            onSelect={(date) => setNewCampaign({
                              ...newCampaign,
                              campaignConfig: {
                                ...newCampaign.campaignConfig,
                                giftback: {
                                  ...newCampaign.campaignConfig.giftback,
                                  validityDate: date
                                }
                              }
                            })}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={handleNextStep}>
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Tracking & Send Step (apenas para simple) */}
          {newCampaign.campaignComplexity === 'simple' && currentStep === 7 && (
            <div className="space-y-6 py-4">
              <div className="p-3 bg-muted rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">{newCampaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Grupos: {newCampaign.groups.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">Envio</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Escolha quando enviar sua campanha
                </p>
              </div>

              {/* Resumo da Campanha */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card className="p-4 border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Contatos impactados</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {(() => {
                      // Calcular total de afetados baseado nas segmentações
                      const mockAffectedCounts: Record<string, number> = {
                        'by_purchase_count': 2847,
                        'birthday': 142,
                        'inactive_customers': 1523,
                        'active_coupon': 634,
                        'high_ticket': 458,
                        'purchase_value_x': 891,
                        'lead_captured': 3241,
                        'cart_recovered_customer': 287,
                        'no_purchase_x_days': 1876,
                        'gender_male': 4562,
                        'gender_female': 5123,
                        'by_state': 9685,
                        'all': 9685
                      };
                      
                      const total = newCampaign.segmentations.reduce((sum, seg) => {
                        return sum + (mockAffectedCounts[seg] || 0);
                      }, 0);
                      
                      return total.toLocaleString('pt-BR');
                    })()}
                  </p>
                </Card>

                <Card className="p-4 border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-muted-foreground">Créditos</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {(() => {
                      const mockAffectedCounts: Record<string, number> = {
                        'by_purchase_count': 2847,
                        'birthday': 142,
                        'inactive_customers': 1523,
                        'active_coupon': 634,
                        'high_ticket': 458,
                        'purchase_value_x': 891,
                        'lead_captured': 3241,
                        'cart_recovered_customer': 287,
                        'no_purchase_x_days': 1876,
                        'gender_male': 4562,
                        'gender_female': 5123,
                        'by_state': 9685,
                        'all': 9685
                      };
                      
                      const total = newCampaign.segmentations.reduce((sum, seg) => {
                        return sum + (mockAffectedCounts[seg] || 0);
                      }, 0);
                      
                      const credits = Math.ceil(total / 100); // 1 crédito a cada 100 pessoas
                      return credits.toLocaleString('pt-BR');
                    })()}
                  </p>
                </Card>

                <Card className="p-4 border-green-500/20 bg-green-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-muted-foreground">Valor Total</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {(() => {
                      const mockAffectedCounts: Record<string, number> = {
                        'by_purchase_count': 2847,
                        'birthday': 142,
                        'inactive_customers': 1523,
                        'active_coupon': 634,
                        'high_ticket': 458,
                        'purchase_value_x': 891,
                        'lead_captured': 3241,
                        'cart_recovered_customer': 287,
                        'no_purchase_x_days': 1876,
                        'gender_male': 4562,
                        'gender_female': 5123,
                        'by_state': 9685,
                        'all': 9685
                      };
                      
                      const total = newCampaign.segmentations.reduce((sum, seg) => {
                        return sum + (mockAffectedCounts[seg] || 0);
                      }, 0);
                      
                      const credits = Math.ceil(total / 100);
                      const valorPorCredito = 0.10;
                      const valorTotal = credits * valorPorCredito;
                      
                      return `R$ ${valorTotal.toFixed(2)}`;
                    })()}
                  </p>
                </Card>
              </div>

              <div className="grid gap-4 mt-6">
                <Label>Quando enviar a campanha?</Label>
                
                <Card
                  className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                    newCampaign.scheduleType === 'now' ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setNewCampaign({ ...newCampaign, scheduleType: 'now' })}
                >
                  <div className="flex items-start gap-3">
                    <Send className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Enviar Agora</p>
                      <p className="text-sm text-muted-foreground">
                        A campanha será enviada imediatamente após a criação
                      </p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                    newCampaign.scheduleType === 'schedule' ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setNewCampaign({ ...newCampaign, scheduleType: 'schedule' })}
                >
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Agendar Envio</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Escolha data e hora para enviar a campanha
                      </p>
                      
                      {newCampaign.scheduleType === 'schedule' && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="grid gap-2">
                            <Label htmlFor="schedule-date">Data</Label>
                            <Input
                              id="schedule-date"
                              type="date"
                              value={newCampaign.scheduleDate}
                              onChange={(e) => setNewCampaign({ ...newCampaign, scheduleDate: e.target.value })}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="schedule-time">Hora</Label>
                            <Input
                              id="schedule-time"
                              type="time"
                              value={newCampaign.scheduleTime}
                              onChange={(e) => setNewCampaign({ ...newCampaign, scheduleTime: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={
                    (newCampaign.scheduleType === 'schedule' && 
                    (!newCampaign.scheduleDate || !newCampaign.scheduleTime))
                  }
                >
                  {newCampaign.scheduleType === 'now' ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Criar e Enviar
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Criar e Agendar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Exportar Campanhas */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar Campanhas</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <p className="text-sm text-muted-foreground">
              Escolha o formato para exportar os dados das campanhas
            </p>

            <div className="grid gap-3">
              <Card 
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleExport('csv')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">CSV</p>
                    <p className="text-xs text-muted-foreground">
                      Arquivo de valores separados por vírgula
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleExport('excel')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Excel</p>
                    <p className="text-xs text-muted-foreground">
                      Planilha do Microsoft Excel (.xlsx)
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleExport('pdf')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">PDF</p>
                    <p className="text-xs text-muted-foreground">
                      Documento portátil para impressão
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Dados incluídos:</strong> Nome da campanha, canais, status, 
                destinatários, métricas de envio, aberturas e cliques.
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsExportOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}