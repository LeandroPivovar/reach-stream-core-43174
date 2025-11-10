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
  const [newCampaign, setNewCampaign] = useState({
    campaignComplexity: '' as 'simple' | 'advanced' | '',
    name: '',
    groups: [] as string[],
    segmentations: [] as string[],
    channel: '' as 'email' | 'sms' | 'whatsapp' | '',
    campaignType: '' as 'dispatch' | 'coupon' | 'giftback' | '',
    campaignConfig: {
      coupon: {
        discountPercentage: '',
        validityStart: undefined as Date | undefined,
        validityEnd: undefined as Date | undefined
      },
      cashback: {
        returnPercentage: '',
        validityStart: undefined as Date | undefined,
        validityEnd: undefined as Date | undefined
      },
      giftback: {
        giftValue: '',
        maxRedemptions: ''
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
      // Simple: 1. Complexity + 2. Segmentation + 3. Basic Data + 4. Channel + 5. Email/SMS/WhatsApp + 6. Tracking/Send
      return 6;
    }
    // Advanced: 1. Complexity + 2. Segmentation + 3. Basic Data + 4. Channel + 5. Type + 6. Config (if not dispatch) + 7. Email/SMS/WhatsApp + 8. Workflow + 9. Tracking/Send
    const configStep = newCampaign.campaignType !== 'dispatch' ? 1 : 0;
    return 9 - (configStep === 0 ? 1 : 0);
  };

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
        coupon: {
          discountPercentage: '',
          validityStart: undefined,
          validityEnd: undefined
        },
        cashback: {
          returnPercentage: '',
          validityStart: undefined,
          validityEnd: undefined
        },
        giftback: {
          giftValue: '',
          maxRedemptions: ''
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
          setNewCampaign({
            campaignComplexity: '',
            name: '',
            groups: [],
            segmentations: [],
            channel: '',
            campaignType: '',
            campaignConfig: {
              coupon: {
                discountPercentage: '',
                validityStart: undefined,
                validityEnd: undefined
              },
              cashback: {
                returnPercentage: '',
                validityStart: undefined,
                validityEnd: undefined
              },
              giftback: {
                giftValue: '',
                maxRedemptions: ''
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
          newCampaign.campaignComplexity === 'advanced' && (
            (newCampaign.campaignType === 'dispatch' && currentStep === 7) ||
            (newCampaign.campaignType !== 'dispatch' && currentStep === 8)
          )
            ? "!max-w-[98vw] !w-[98vw] !max-h-[98vh] !h-[98vh] p-8"
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
                          <li>• Cupons de desconto e gift back / cashback</li>
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
                onSegmentsChange={(segments) => setNewCampaign({ ...newCampaign, segmentations: segments })}
              />

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

          {/* Etapa 3: Dados Básicos */}
          {currentStep === 3 && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Comece definindo o nome e o público-alvo da sua campanha
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

              <div className="grid gap-2">
                <Label>Público-Alvo * (selecione um ou mais grupos)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {contactGroups.map((group) => (
                    <Card
                      key={group.name}
                      className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                        newCampaign.groups.includes(group.name) ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => toggleGroup(group.name)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                          newCampaign.groups.includes(group.name) 
                            ? 'bg-primary border-primary' 
                            : 'border-input'
                        }`}>
                          {newCampaign.groups.includes(group.name) && (
                            <Users className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">{group.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {group.count.toLocaleString()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{group.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Total selecionado: {contactGroups.filter(g => newCampaign.groups.includes(g.name)).reduce((acc, g) => acc + g.count, 0).toLocaleString()} contatos
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!newCampaign.name || newCampaign.groups.length === 0}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 4: Seleção de Canal */}
          {currentStep === 4 && (
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

          {/* Etapa 5: Seleção de Tipo de Campanha (apenas para advanced) */}
          {currentStep === 5 && newCampaign.campaignComplexity === 'advanced' && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Escolha o tipo de campanha que melhor se adequa ao seu objetivo
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Tipo de Campanha *</Label>
                <div className="grid grid-cols-1 gap-4">
                  <Card 
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.campaignType === 'dispatch' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ ...newCampaign, campaignType: 'dispatch' })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Apenas Disparo</h3>
                        <p className="text-sm text-muted-foreground">
                          Envio simples de mensagens, emails ou SMS para seus contatos. Ideal para comunicações diretas, newsletters e avisos.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.campaignType === 'coupon' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ ...newCampaign, campaignType: 'coupon' })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tag className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Cupons de Desconto</h3>
                        <p className="text-sm text-muted-foreground">
                          Crie e distribua cupons promocionais personalizados. Perfeito para campanhas de vendas, promoções sazonais e incentivos.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.campaignType === 'giftback' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ ...newCampaign, campaignType: 'giftback' })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Gift className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Gift Back / Cash Back</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure programas de recompensa e cashback para seus clientes. Estimule a fidelização e o retorno de compras.
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
                  disabled={!newCampaign.campaignType}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 6: Configurações Específicas do Tipo de Campanha (apenas para advanced) */}
          {currentStep === 6 && newCampaign.campaignComplexity === 'advanced' && newCampaign.campaignType !== 'dispatch' && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Configure os parâmetros específicos desta campanha
                </p>
              </div>

              {/* Cupom de Desconto */}
              {newCampaign.campaignType === 'coupon' && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="discount-percentage">Porcentagem do Desconto (%)*</Label>
                    <Input
                      id="discount-percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={newCampaign.campaignConfig.coupon.discountPercentage}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        campaignConfig: {
                          ...newCampaign.campaignConfig,
                          coupon: {
                            ...newCampaign.campaignConfig.coupon,
                            discountPercentage: e.target.value
                          }
                        }
                      })}
                      placeholder="Ex: 20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Válido de *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newCampaign.campaignConfig.coupon.validityStart && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newCampaign.campaignConfig.coupon.validityStart ? (
                              format(newCampaign.campaignConfig.coupon.validityStart, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione a data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newCampaign.campaignConfig.coupon.validityStart}
                            onSelect={(date) => setNewCampaign({
                              ...newCampaign,
                              campaignConfig: {
                                ...newCampaign.campaignConfig,
                                coupon: {
                                  ...newCampaign.campaignConfig.coupon,
                                  validityStart: date
                                }
                              }
                            })}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-2">
                      <Label>Válido até *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newCampaign.campaignConfig.coupon.validityEnd && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newCampaign.campaignConfig.coupon.validityEnd ? (
                              format(newCampaign.campaignConfig.coupon.validityEnd, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione a data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newCampaign.campaignConfig.coupon.validityEnd}
                            onSelect={(date) => setNewCampaign({
                              ...newCampaign,
                              campaignConfig: {
                                ...newCampaign.campaignConfig,
                                coupon: {
                                  ...newCampaign.campaignConfig.coupon,
                                  validityEnd: date
                                }
                              }
                            })}
                            disabled={(date) => 
                              newCampaign.campaignConfig.coupon.validityStart 
                                ? date < newCampaign.campaignConfig.coupon.validityStart 
                                : false
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Back */}
              {newCampaign.campaignType === 'giftback' && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="return-percentage">Percentual de Retorno (%)*</Label>
                    <Input
                      id="return-percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={newCampaign.campaignConfig.cashback.returnPercentage}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        campaignConfig: {
                          ...newCampaign.campaignConfig,
                          cashback: {
                            ...newCampaign.campaignConfig.cashback,
                            returnPercentage: e.target.value
                          }
                        }
                      })}
                      placeholder="Ex: 10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Válido de *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newCampaign.campaignConfig.cashback.validityStart && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newCampaign.campaignConfig.cashback.validityStart ? (
                              format(newCampaign.campaignConfig.cashback.validityStart, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione a data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newCampaign.campaignConfig.cashback.validityStart}
                            onSelect={(date) => setNewCampaign({
                              ...newCampaign,
                              campaignConfig: {
                                ...newCampaign.campaignConfig,
                                cashback: {
                                  ...newCampaign.campaignConfig.cashback,
                                  validityStart: date
                                }
                              }
                            })}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-2">
                      <Label>Válido até *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !newCampaign.campaignConfig.cashback.validityEnd && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newCampaign.campaignConfig.cashback.validityEnd ? (
                              format(newCampaign.campaignConfig.cashback.validityEnd, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione a data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newCampaign.campaignConfig.cashback.validityEnd}
                            onSelect={(date) => setNewCampaign({
                              ...newCampaign,
                              campaignConfig: {
                                ...newCampaign.campaignConfig,
                                cashback: {
                                  ...newCampaign.campaignConfig.cashback,
                                  validityEnd: date
                                }
                              }
                            })}
                            disabled={(date) => 
                              newCampaign.campaignConfig.cashback.validityStart 
                                ? date < newCampaign.campaignConfig.cashback.validityStart 
                                : false
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="gift-value">Valor do Brinde *</Label>
                    <Input
                      id="gift-value"
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
                      placeholder="Ex: R$ 50,00 ou Brinde Premium"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="max-redemptions">Quantidade Máxima de Resgates *</Label>
                    <Input
                      id="max-redemptions"
                      type="number"
                      min="1"
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
                      placeholder="Ex: 100"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={
                    (newCampaign.campaignType === 'coupon' && (
                      !newCampaign.campaignConfig.coupon.discountPercentage ||
                      !newCampaign.campaignConfig.coupon.validityStart ||
                      !newCampaign.campaignConfig.coupon.validityEnd
                    )) ||
                    (newCampaign.campaignType === 'giftback' && (
                      !newCampaign.campaignConfig.cashback.returnPercentage ||
                      !newCampaign.campaignConfig.cashback.validityStart ||
                      !newCampaign.campaignConfig.cashback.validityEnd ||
                      !newCampaign.campaignConfig.giftback.giftValue ||
                      !newCampaign.campaignConfig.giftback.maxRedemptions
                    ))
                  }
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Email/SMS/WhatsApp Content Editor Step */}
          {(
            (newCampaign.campaignComplexity === 'simple' && currentStep === 5) ||
            (newCampaign.campaignComplexity === 'advanced' && newCampaign.campaignType === 'dispatch' && currentStep === 6) ||
            (newCampaign.campaignComplexity === 'advanced' && newCampaign.campaignType !== 'dispatch' && currentStep === 7)
          ) && (
            <div className="space-y-6 py-4">
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
                  
                  {newCampaign.campaignComplexity === 'advanced' && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Modo de Edição</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {newCampaign.email.mode === 'text' ? '✉️ Texto simples' : '💻 HTML avançado'}
                          </span>
                          <Switch
                            checked={newCampaign.email.mode === 'html'}
                            onCheckedChange={(checked) => setNewCampaign({ 
                              ...newCampaign, 
                              email: { 
                                ...newCampaign.email, 
                                mode: checked ? 'html' : 'text'
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="email-content">
                      {newCampaign.campaignComplexity === 'advanced' && newCampaign.email.mode === 'html' ? 'Conteúdo HTML *' : 'Conteúdo do E-mail *'}
                    </Label>
                    <Textarea
                      id="email-content"
                      value={newCampaign.email.content}
                      onChange={(e) => setNewCampaign({ 
                        ...newCampaign, 
                        email: { ...newCampaign.email, content: e.target.value }
                      })}
                      placeholder={
                        newCampaign.campaignComplexity === 'advanced' && newCampaign.email.mode === 'html' 
                          ? 'Digite o HTML do e-mail...' 
                          : 'Digite o conteúdo do e-mail...'
                      }
                      rows={12}
                      className={newCampaign.campaignComplexity === 'advanced' && newCampaign.email.mode === 'html' ? 'font-mono text-sm' : ''}
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
                  
                  {newCampaign.campaignComplexity === 'advanced' && newCampaign.email.mode === 'html' && newCampaign.email.content && (
                    <div className="grid gap-2">
                      <Label>Preview</Label>
                      <div 
                        className="border rounded-lg p-4 bg-card"
                        dangerouslySetInnerHTML={{ __html: newCampaign.email.content }}
                      />
                    </div>
                  )}
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

              {newCampaign.channel === 'whatsapp' && (
                <>
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
                </>
              )}

              <div className="flex justify-between">
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

          {/* Workflow Step (only for advanced) */}
          {newCampaign.campaignComplexity === 'advanced' && (
            (newCampaign.campaignType === 'dispatch' && currentStep === 7) ||
            (newCampaign.campaignType !== 'dispatch' && currentStep === 8)
          ) && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">Editor de Workflow Visual</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Arraste e solte os blocos, conecte-os para criar sua automação personalizada
                </p>
              </div>

              <WorkflowCanvas
                workflow={newCampaign.workflow}
                onChange={(workflow) => setNewCampaign({ ...newCampaign, workflow })}
              />

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

          {/* Tracking & Send Step */}
          {(
            (newCampaign.campaignComplexity === 'simple' && currentStep === 6) ||
            (newCampaign.campaignComplexity === 'advanced' && newCampaign.campaignType === 'dispatch' && currentStep === 8) ||
            (newCampaign.campaignComplexity === 'advanced' && newCampaign.campaignType !== 'dispatch' && currentStep === 9)
          ) && (
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
                  <span className="font-medium">{newCampaign.campaignComplexity === 'simple' ? 'Envio' : 'Rastreamento e Envio'}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {newCampaign.campaignComplexity === 'simple' 
                    ? 'Escolha quando enviar sua campanha' 
                    : 'Configure o rastreamento e escolha quando enviar sua campanha'
                  }
                </p>
              </div>

              {newCampaign.campaignComplexity === 'advanced' && (
                <div className="grid gap-4">
                  <Label>Tipo de Rastreamento *</Label>
                
                  <Card 
                    className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.tracking.type === 'utm' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ 
                      ...newCampaign, 
                      tracking: { ...newCampaign.tracking, type: 'utm' }
                    })}
                  >
                    <div className="flex items-start gap-3">
                      <Link2 className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Parâmetros UTM</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Adicione tags UTM aos seus links para rastreamento no Google Analytics. 
                          UTM (Urchin Tracking Module) são códigos adicionados às URLs que permitem identificar a origem, 
                          meio e campanha de onde vêm seus visitantes, facilitando a análise de performance.
                        </p>
                        
                        {newCampaign.tracking.type === 'utm' && (
                          <div className="space-y-3 mt-3">
                            <div className="grid gap-2">
                              <Label htmlFor="utm-source">Origem (utm_source)</Label>
                              <Input
                                id="utm-source"
                                value={newCampaign.tracking.utmSource}
                                onChange={(e) => setNewCampaign({ 
                                  ...newCampaign, 
                                  tracking: { ...newCampaign.tracking, utmSource: e.target.value }
                                })}
                                placeholder="Ex: newsletter, whatsapp, sms"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="utm-medium">Mídia (utm_medium)</Label>
                              <Input
                                id="utm-medium"
                                value={newCampaign.tracking.utmMedium}
                                onChange={(e) => setNewCampaign({ 
                                  ...newCampaign, 
                                  tracking: { ...newCampaign.tracking, utmMedium: e.target.value }
                                })}
                                placeholder="Ex: email, social, paid"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="utm-campaign">Campanha (utm_campaign)</Label>
                              <Input
                                id="utm-campaign"
                                value={newCampaign.tracking.utmCampaign}
                                onChange={(e) => setNewCampaign({ 
                                  ...newCampaign, 
                                  tracking: { ...newCampaign.tracking, utmCampaign: e.target.value }
                                })}
                                placeholder="Ex: black-friday, lancamento"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.tracking.type === 'pixel' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ 
                      ...newCampaign, 
                      tracking: { ...newCampaign.tracking, type: 'pixel' }
                    })}
                  >
                    <div className="flex items-start gap-3">
                      <Eye className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Pixel de Conversão</p>
                        <p className="text-sm text-muted-foreground">
                          Rastreie conversões usando pixels do Facebook, Google ou outros
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                      newCampaign.tracking.type === 'shortlink' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setNewCampaign({ 
                      ...newCampaign, 
                      tracking: { ...newCampaign.tracking, type: 'shortlink' }
                    })}
                  >
                    <div className="flex items-start gap-3">
                      <Link2 className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Link Curto Rastreável</p>
                        <p className="text-sm text-muted-foreground">
                          Crie links curtos personalizados com rastreamento de cliques
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

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