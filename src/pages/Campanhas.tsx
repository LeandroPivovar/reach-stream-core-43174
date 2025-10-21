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
  Gift
} from 'lucide-react';

export default function Campanhas() {
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    group: '',
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
      mode: 'text' as 'text' | 'html' 
    },
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

  const contactGroups = ['VIP', 'Regular', 'Novos', 'Inativos'];

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
    // 1. Dados básicos + 2. Tipo + 3. Config específicas (se não for dispatch) + 4. Editor email + 5. Workflow
    const configStep = newCampaign.campaignType !== 'dispatch' ? 1 : 0;
    return 5 - (configStep === 0 ? 1 : 0); // Se dispatch, pula etapa 3
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


  const handleCreateCampaign = () => {
    console.log('Creating campaign:', newCampaign);
    setIsNewCampaignOpen(false);
    setCurrentStep(1);
    setNewCampaign({
      name: '',
      group: '',
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
        mode: 'text' 
      },
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            name: '',
            group: '',
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
              mode: 'text' 
            },
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Campanha - Etapa {currentStep} de {getTotalSteps()}</DialogTitle>
          </DialogHeader>

          {/* Etapa 1: Dados Básicos */}
          {currentStep === 1 && (
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
                <Label htmlFor="contact-group">Grupo de Contatos *</Label>
                <Select 
                  value={newCampaign.group} 
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleNextStep}
                  disabled={!newCampaign.name || !newCampaign.group}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 2: Seleção de Tipo de Campanha */}
          {currentStep === 2 && (
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

          {/* Etapa 3: Configurações Específicas do Tipo de Campanha */}
          {currentStep === 3 && newCampaign.campaignType !== 'dispatch' && (
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

          {/* Etapa 4: Editor de E-mail */}
          {((newCampaign.campaignType === 'dispatch' && currentStep === 3) || 
            (newCampaign.campaignType !== 'dispatch' && currentStep === 4)) && (
            <div className="space-y-6 py-4">
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

              <div className="grid gap-2">
                <Label htmlFor="email-content">
                  {newCampaign.email.mode === 'html' ? 'Conteúdo HTML *' : 'Conteúdo do E-mail *'}
                </Label>
                <Textarea
                  id="email-content"
                  value={newCampaign.email.content}
                  onChange={(e) => setNewCampaign({ 
                    ...newCampaign, 
                    email: { ...newCampaign.email, content: e.target.value }
                  })}
                  placeholder={
                    newCampaign.email.mode === 'html' 
                      ? 'Digite o HTML do e-mail...' 
                      : 'Digite o conteúdo do e-mail...'
                  }
                  rows={12}
                  className={newCampaign.email.mode === 'html' ? 'font-mono text-sm' : ''}
                />
              </div>
              
              {newCampaign.email.mode === 'html' && newCampaign.email.content && (
                <div className="grid gap-2">
                  <Label>Preview</Label>
                  <div 
                    className="border rounded-lg p-4 bg-card"
                    dangerouslySetInnerHTML={{ __html: newCampaign.email.content }}
                  />
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!newCampaign.email.subject || !newCampaign.email.content}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 5: Workflow e Envio */}
          {((newCampaign.campaignType === 'dispatch' && currentStep === 4) || 
            (newCampaign.campaignType !== 'dispatch' && currentStep === 5)) && (
            <div className="space-y-6 py-4">
              <div className="p-3 bg-muted rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">{newCampaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Grupo: {newCampaign.group}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">Trackeamento e Envio</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure o rastreamento e escolha quando enviar sua campanha
                </p>
              </div>

              <div className="grid gap-4">
                <Label>Tipo de Trackeamento *</Label>
                
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
                        Adicione tags UTM aos seus links para rastreamento no Google Analytics
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