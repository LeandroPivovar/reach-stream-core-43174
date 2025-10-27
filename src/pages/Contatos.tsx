import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useScoreConfig } from '@/hooks/use-score-config';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Upload,
  Tag,
  Users,
  MapPin,
  Activity,
  Download,
  FileSpreadsheet,
  CreditCard,
  Target,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Mail,
  MousePointerClick,
  Clock,
  Flame,
  Zap,
  Snowflake,
  Settings,
  RotateCcw,
  Save,
  Send,
  X,
  CheckSquare,
  Filter,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Purchase {
  id: number;
  date: string;
  value: number;
  product: string;
}

interface HistoryEvent {
  id: number;
  type: 'purchase' | 'email_open' | 'link_click' | 'campaign_participation';
  date: string;
  description: string;
  metadata?: {
    value?: number;
    product?: string;
    campaign?: string;
    subject?: string;
    link?: string;
  };
}

interface ContactDetail {
  paymentMethod: string;
  sourceCampaign: string;
  purchases: Purchase[];
  ltv: number;
  history: HistoryEvent[];
  score?: number;
  emailOpens?: number;
  linkClicks?: number;
}

export default function Contatos() {
  const { config: scoreConfig, updateWeights, resetToDefaults } = useScoreConfig();
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [tempWeights, setTempWeights] = useState(scoreConfig.weights);
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [isBulkCampaignOpen, setIsBulkCampaignOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  
  // Estados de Filtro
  const [filters, setFilters] = useState({
    name: '',
    campaign: '',
    scoreMin: 0,
    scoreMax: 100,
    ltvMin: 0,
    ltvMax: 10000,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    group: '',
    status: 'Ativo',
    tags: [] as string[],
    state: '',
    city: ''
  });

  // Mock data for contact details with LTV information
  const contactDetails: Record<number, ContactDetail> = {
    1: {
      paymentMethod: 'Cartão de crédito',
      sourceCampaign: 'Black Friday 2025',
      purchases: [
        { id: 1, date: '2025-11-28', value: 199.00, product: 'Produto Premium' },
        { id: 2, date: '2025-12-15', value: 89.90, product: 'Produto Básico' },
      ],
      ltv: 288.90,
      history: [
        { id: 1, type: 'campaign_participation', date: '2025-11-20', description: 'Entrou na campanha', metadata: { campaign: 'Black Friday 2025' } },
        { id: 2, type: 'email_open', date: '2025-11-22', description: 'Abriu e-mail', metadata: { subject: 'Super Ofertas Black Friday!' } },
        { id: 3, type: 'link_click', date: '2025-11-25', description: 'Clicou em link', metadata: { link: 'Produto Premium' } },
        { id: 4, type: 'purchase', date: '2025-11-28', description: 'Compra realizada', metadata: { value: 199.00, product: 'Produto Premium' } },
        { id: 5, type: 'email_open', date: '2025-12-10', description: 'Abriu e-mail', metadata: { subject: 'Novidades de Dezembro' } },
        { id: 6, type: 'link_click', date: '2025-12-12', description: 'Clicou em link', metadata: { link: 'Produto Básico' } },
        { id: 7, type: 'purchase', date: '2025-12-15', description: 'Compra realizada', metadata: { value: 89.90, product: 'Produto Básico' } },
      ]
    },
    2: {
      paymentMethod: 'PIX',
      sourceCampaign: 'Newsletter Semanal',
      purchases: [
        { id: 1, date: '2025-10-05', value: 149.00, product: 'Produto Standard' },
      ],
      ltv: 149.00,
      history: [
        { id: 1, type: 'campaign_participation', date: '2025-09-28', description: 'Inscreveu-se na newsletter', metadata: { campaign: 'Newsletter Semanal' } },
        { id: 2, type: 'email_open', date: '2025-10-01', description: 'Abriu e-mail', metadata: { subject: 'Promoção da Semana' } },
        { id: 3, type: 'link_click', date: '2025-10-03', description: 'Clicou em link', metadata: { link: 'Ver Produtos' } },
        { id: 4, type: 'purchase', date: '2025-10-05', description: 'Compra realizada', metadata: { value: 149.00, product: 'Produto Standard' } },
      ]
    },
    3: {
      paymentMethod: 'Boleto',
      sourceCampaign: 'Campanha Fidelidade',
      purchases: [
        { id: 1, date: '2025-09-10', value: 299.00, product: 'Kit Premium' },
        { id: 2, date: '2025-11-20', value: 189.90, product: 'Upgrade Plus' },
        { id: 3, date: '2025-12-30', value: 99.90, product: 'Add-on Extra' },
      ],
      ltv: 588.80,
      history: [
        { id: 1, type: 'campaign_participation', date: '2025-09-01', description: 'Entrou no programa', metadata: { campaign: 'Campanha Fidelidade' } },
        { id: 2, type: 'purchase', date: '2025-09-10', description: 'Compra realizada', metadata: { value: 299.00, product: 'Kit Premium' } },
        { id: 3, type: 'email_open', date: '2025-10-15', description: 'Abriu e-mail', metadata: { subject: 'Pontos de Fidelidade' } },
        { id: 4, type: 'email_open', date: '2025-11-10', description: 'Abriu e-mail', metadata: { subject: 'Benefícios Exclusivos' } },
        { id: 5, type: 'link_click', date: '2025-11-18', description: 'Clicou em link', metadata: { link: 'Upgrade Plus' } },
        { id: 6, type: 'purchase', date: '2025-11-20', description: 'Compra realizada', metadata: { value: 189.90, product: 'Upgrade Plus' } },
        { id: 7, type: 'email_open', date: '2025-12-20', description: 'Abriu e-mail', metadata: { subject: 'Feliz Natal' } },
        { id: 8, type: 'link_click', date: '2025-12-28', description: 'Clicou em link', metadata: { link: 'Add-on Extra' } },
        { id: 9, type: 'purchase', date: '2025-12-30', description: 'Compra realizada', metadata: { value: 99.90, product: 'Add-on Extra' } },
      ]
    }
  };

  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'Ana Silva',
      phone: '(11) 99999-9999',
      email: 'ana.silva@email.com',
      group: 'VIP',
      status: 'Ativo',
      tags: ['Black Friday', 'Newsletter'],
      state: 'SP',
      city: 'São Paulo',
      lastInteraction: '2024-03-20'
    },
    {
      id: 2,
      name: 'Carlos Santos',
      phone: '(21) 88888-8888',
      email: 'carlos.santos@email.com',
      group: 'Regular',
      status: 'Inativo',
      tags: ['Promoção'],
      state: 'RJ',
      city: 'Rio de Janeiro',
      lastInteraction: '2024-03-15'
    },
    {
      id: 3,
      name: 'Mariana Costa',
      phone: '(31) 77777-7777',
      email: 'mariana.costa@email.com',
      group: 'VIP',
      status: 'Ativo',
      tags: ['Newsletter', 'Fidelidade'],
      state: 'MG',
      city: 'Belo Horizonte',
      lastInteraction: '2024-03-22'
    }
  ]);

  const [groups] = useState(['VIP', 'Regular', 'Novos', 'Inativos']);
  const [tags] = useState(['Black Friday', 'Newsletter', 'Promoção', 'Fidelidade', 'Carrinho Abandonado']);
  const [states] = useState(['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE']);
  const [statuses] = useState(['Ativo', 'Inativo', 'Bloqueado', 'Aguardando']);
  const [campaigns] = useState(['Black Friday 2025', 'Newsletter Semanal', 'Campanha Fidelidade', 'Promoção Verão', 'Lançamento Produto']);

  // Funções de cálculo (devem vir antes de filteredContacts)
  const calculateScore = (detail: ContactDetail) => {
    const emailOpens = detail.history.filter(e => e.type === 'email_open').length;
    const linkClicks = detail.history.filter(e => e.type === 'link_click').length;
    const purchases = detail.purchases.length;
    const ltv = detail.ltv;
    
    const { emailOpens: emailWeight, linkClicks: clickWeight, purchases: purchaseWeight, ltvDivisor } = scoreConfig.weights;
    
    return Math.min(100, Math.round(
      (emailOpens * emailWeight) + 
      (linkClicks * clickWeight) + 
      (purchases * purchaseWeight) + 
      (ltv / ltvDivisor)
    ));
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return { 
      bg: 'bg-score-hot', 
      text: 'text-score-hot', 
      border: 'border-score-hot',
      bgLight: 'bg-score-hot-bg',
      label: 'Lead Quente', 
      icon: Flame 
    };
    if (score >= 40) return { 
      bg: 'bg-score-warm', 
      text: 'text-score-warm', 
      border: 'border-score-warm',
      bgLight: 'bg-score-warm-bg',
      label: 'Lead Morno', 
      icon: Zap 
    };
    return { 
      bg: 'bg-score-cold', 
      text: 'text-score-cold', 
      border: 'border-score-cold',
      bgLight: 'bg-score-cold-bg',
      label: 'Lead Frio', 
      icon: Snowflake 
    };
  };

  const getLtvColor = (ltv: number) => {
    if (ltv >= 400) return { 
      bg: 'bg-ltv-high', 
      text: 'text-ltv-high', 
      border: 'border-ltv-high',
      bgLight: 'bg-ltv-high-bg'
    };
    if (ltv >= 200) return { 
      bg: 'bg-ltv-medium', 
      text: 'text-ltv-medium', 
      border: 'border-ltv-medium',
      bgLight: 'bg-ltv-medium-bg'
    };
    return { 
      bg: 'bg-ltv-low', 
      text: 'text-ltv-low', 
      border: 'border-ltv-low',
      bgLight: 'bg-ltv-low-bg'
    };
  };

  const getLtvLabel = (ltv: number) => {
    if (ltv >= 400) return 'Alto Valor';
    if (ltv >= 200) return 'Médio Valor';
    return 'Baixo Valor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-500';
      case 'Inativo': return 'bg-gray-500';
      case 'Bloqueado': return 'bg-red-500';
      case 'Aguardando': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Aplicar filtros
  const filteredContacts = contacts.filter(contact => {
    const contactDetail = contactDetails[contact.id];
    const score = contactDetail ? calculateScore(contactDetail) : 0;
    const ltv = contactDetail?.ltv || 0;
    const campaign = contactDetail?.sourceCampaign || '';

    // Filtro por nome
    if (filters.name.trim() && !contact.name.toLowerCase().includes(filters.name.toLowerCase().trim())) {
      return false;
    }

    // Filtro por campanha
    if (filters.campaign && filters.campaign.trim() && campaign !== filters.campaign) {
      return false;
    }

    // Filtro por score
    if (contactDetail && (score < filters.scoreMin || score > filters.scoreMax)) {
      return false;
    }

    // Filtro por LTV
    if (contactDetail && (ltv < filters.ltvMin || ltv > filters.ltvMax)) {
      return false;
    }

    return true;
  });

  const hasActiveFilters = filters.name !== '' || 
    filters.campaign !== '' || 
    filters.scoreMin > 0 || 
    filters.scoreMax < 100 || 
    filters.ltvMin > 0 || 
    filters.ltvMax < 10000;

  const clearFilters = () => {
    setFilters({
      name: '',
      campaign: '',
      scoreMin: 0,
      scoreMax: 100,
      ltvMin: 0,
      ltvMax: 10000,
    });
  };

  // Funções de seleção múltipla
  const toggleContactSelection = (contactId: number) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedContacts(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const clearSelection = () => {
    setSelectedContacts(new Set());
  };

  const handleBulkRemove = () => {
    if (window.confirm(`Tem certeza que deseja remover ${selectedContacts.size} contatos?`)) {
      setContacts(contacts.filter(c => !selectedContacts.has(c.id)));
      clearSelection();
      // TODO: Quando backend estiver ativo, fazer: DELETE /api/contacts/bulk
    }
  };

  const handleBulkExport = () => {
    const selectedContactsData = contacts.filter(c => selectedContacts.has(c.id));
    const csvContent = [
      ['Nome', 'Telefone', 'Email', 'Grupo', 'Status', 'Etiquetas', 'Estado', 'Cidade'].join(','),
      ...selectedContactsData.map(c => [
        c.name,
        c.phone,
        c.email,
        c.group,
        c.status,
        c.tags.join(';'),
        c.state,
        c.city
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos-selecionados-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    clearSelection();
  };

  const handleBulkAddToCampaign = () => {
    if (!selectedCampaign) {
      alert('Selecione uma campanha');
      return;
    }
    
    const selectedContactsData = contacts.filter(c => selectedContacts.has(c.id));
    console.log('Enviando leads para campanha:', {
      campaign: selectedCampaign,
      lead_ids: Array.from(selectedContacts),
      leads: selectedContactsData.map(c => ({ id: c.id, name: c.name, email: c.email }))
    });
    
    // TODO: Quando backend estiver ativo, fazer:
    // POST /campaigns/{selectedCampaign}/add-leads
    // body: { lead_ids: Array.from(selectedContacts) }
    
    alert(`${selectedContacts.size} leads adicionados à campanha "${selectedCampaign}" com sucesso!`);
    setIsBulkCampaignOpen(false);
    setSelectedCampaign('');
    clearSelection();
  };


  const handleSaveContact = () => {
    const contactToAdd = {
      id: contacts.length + 1,
      name: newContact.name,
      phone: newContact.phone,
      email: newContact.email,
      group: newContact.group,
      status: newContact.status,
      tags: newContact.tags,
      state: newContact.state,
      city: newContact.city,
      lastInteraction: new Date().toISOString().split('T')[0]
    };
    setContacts([...contacts, contactToAdd]);
    setIsNewContactOpen(false);
    setNewContact({
      name: '',
      phone: '',
      email: '',
      group: '',
      status: 'Ativo',
      tags: [],
      state: '',
      city: ''
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Nome', 'Telefone', 'Email', 'Grupo', 'Status', 'Etiquetas', 'Estado', 'Cidade'].join(','),
      ...contacts.map(c => [
        c.name,
        c.phone,
        c.email,
        c.group,
        c.status,
        c.tags.join(';'),
        c.state,
        c.city
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contatos.csv';
    a.click();
    setIsExportOpen(false);
  };

  const actions = (
    <>
      <Button variant="outline" onClick={() => setIsImportOpen(true)}>
        <Upload className="w-4 h-4 mr-2" />
        Importar
      </Button>
      <HeaderActions.Add onClick={() => setIsNewContactOpen(true)}>
        Novo Contato
      </HeaderActions.Add>
    </>
  );

  return (
    <Layout 
      title="Contatos" 
      subtitle="Gerencie sua base de leads e clientes"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Barra de Ações em Massa e Filtros */}
        <Card className={`p-4 ${selectedContacts.size > 0 ? 'bg-primary/10 border-primary/30' : 'bg-card'} shadow-sm sticky top-4 z-10`}>
          <div className="flex items-center justify-between gap-4">
            {/* Lado Esquerdo - Seleção e Ações */}
            <div className="flex items-center gap-4 flex-1">
              {selectedContacts.size > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">
                      {selectedContacts.size} {selectedContacts.size === 1 ? 'contato' : 'contatos'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setIsBulkCampaignOpen(true)}
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Enviar para Campanha
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkExport}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Exportar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkRemove}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="gap-2 ml-auto"
                  >
                    <X className="w-4 h-4" />
                    Limpar
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">{filteredContacts.length} contatos</span>
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2">
                        Filtros ativos
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Lado Direito - Filtros e Ações */}
            <div className="flex items-center gap-2">
              {selectedContacts.size === 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExportOpen(true)}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>

                  <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant={hasActiveFilters ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filtros
                        {hasActiveFilters && (
                          <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                            !
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filtrar Contatos
                          </h4>
                          {hasActiveFilters && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearFilters}
                              className="h-8 text-xs"
                            >
                              Limpar
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          {/* Filtro por Nome */}
                          <div className="space-y-2">
                            <Label htmlFor="filter-name" className="text-xs font-medium">
                              <Search className="w-3 h-3 inline mr-1" />
                              Nome do Lead
                            </Label>
                            <Input
                              id="filter-name"
                              placeholder="Buscar por nome..."
                              value={filters.name}
                              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                              className="h-9"
                            />
                          </div>

                          {/* Filtro por Campanha */}
                          <div className="space-y-2">
                            <Label htmlFor="filter-campaign" className="text-xs font-medium">
                              <Target className="w-3 h-3 inline mr-1" />
                              Campanha de Origem
                            </Label>
                            <Select 
                              value={filters.campaign || "all"} 
                              onValueChange={(value) => setFilters({ ...filters, campaign: value === "all" ? "" : value })}
                            >
                              <SelectTrigger id="filter-campaign" className="h-9">
                                <SelectValue placeholder="Todas as campanhas" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover">
                                <SelectItem value="all">Todas as campanhas</SelectItem>
                                {campaigns.map((campaign) => (
                                  <SelectItem key={campaign} value={campaign}>
                                    {campaign}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Filtro por Score */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">
                              <Activity className="w-3 h-3 inline mr-1" />
                              Score (Pontuação)
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="score-min" className="text-xs text-muted-foreground">Mínimo</Label>
                                <Input
                                  id="score-min"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={filters.scoreMin}
                                  onChange={(e) => setFilters({ ...filters, scoreMin: parseInt(e.target.value) || 0 })}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label htmlFor="score-max" className="text-xs text-muted-foreground">Máximo</Label>
                                <Input
                                  id="score-max"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={filters.scoreMax}
                                  onChange={(e) => setFilters({ ...filters, scoreMax: parseInt(e.target.value) || 100 })}
                                  className="h-9"
                                />
                              </div>
                            </div>
                            <div className="flex gap-1 mt-1">
                              <Badge 
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-muted"
                                onClick={() => setFilters({ ...filters, scoreMin: 70, scoreMax: 100 })}
                              >
                                🟢 Quentes (70-100)
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-muted"
                                onClick={() => setFilters({ ...filters, scoreMin: 40, scoreMax: 69 })}
                              >
                                🟡 Mornos (40-69)
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-muted"
                                onClick={() => setFilters({ ...filters, scoreMin: 0, scoreMax: 39 })}
                              >
                                🔵 Frios (0-39)
                              </Badge>
                            </div>
                          </div>

                          {/* Filtro por LTV */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">
                              <TrendingUp className="w-3 h-3 inline mr-1" />
                              LTV (Lifetime Value)
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="ltv-min" className="text-xs text-muted-foreground">Mínimo (R$)</Label>
                                <Input
                                  id="ltv-min"
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={filters.ltvMin}
                                  onChange={(e) => setFilters({ ...filters, ltvMin: parseFloat(e.target.value) || 0 })}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label htmlFor="ltv-max" className="text-xs text-muted-foreground">Máximo (R$)</Label>
                                <Input
                                  id="ltv-max"
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={filters.ltvMax}
                                  onChange={(e) => setFilters({ ...filters, ltvMax: parseFloat(e.target.value) || 10000 })}
                                  className="h-9"
                                />
                              </div>
                            </div>
                            <div className="flex gap-1 mt-1">
                              <Badge 
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-muted"
                                onClick={() => setFilters({ ...filters, ltvMin: 400, ltvMax: 10000 })}
                              >
                                Alto (R$ 400+)
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-muted"
                                onClick={() => setFilters({ ...filters, ltvMin: 200, ltvMax: 399 })}
                              >
                                Médio (R$ 200-399)
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-muted"
                                onClick={() => setFilters({ ...filters, ltvMin: 0, ltvMax: 199 })}
                              >
                                Baixo (&lt; R$ 200)
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            {filteredContacts.length} de {contacts.length} contatos exibidos
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4 hover-lift animate-fade-in shadow-card border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Contatos</p>
                <p className="text-2xl font-bold text-foreground">8.247</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover-lift animate-fade-in shadow-card border-l-4 border-l-score-hot" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Quentes</p>
                <p className="text-2xl font-bold text-score-hot">
                  {contacts.filter(c => {
                    const detail = contactDetails[c.id];
                    return detail && calculateScore(detail) >= 70;
                  }).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-score-hot-bg rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-score-hot" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover-lift animate-fade-in shadow-card border-l-4 border-l-score-warm" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Mornos</p>
                <p className="text-2xl font-bold text-score-warm">
                  {contacts.filter(c => {
                    const detail = contactDetails[c.id];
                    return detail && calculateScore(detail) >= 40 && calculateScore(detail) < 70;
                  }).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-score-warm-bg rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-score-warm" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover-lift animate-fade-in shadow-card border-l-4 border-l-score-cold" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Frios</p>
                <p className="text-2xl font-bold text-score-cold">
                  {contacts.filter(c => {
                    const detail = contactDetails[c.id];
                    return detail && calculateScore(detail) < 40;
                  }).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-score-cold-bg rounded-lg flex items-center justify-center">
                <Snowflake className="w-5 h-5 text-score-cold" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover-lift animate-fade-in shadow-card border-l-4 border-l-ltv" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold text-ltv">
                  {Math.round(
                    contacts
                      .filter(c => contactDetails[c.id])
                      .reduce((acc, c) => acc + calculateScore(contactDetails[c.id]), 0) /
                    contacts.filter(c => contactDetails[c.id]).length
                  )}
                </p>
              </div>
              <div className="w-10 h-10 bg-ltv-bg rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-ltv" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="tags">Etiquetas</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="score-config">
              <Settings className="w-4 h-4 mr-2" />
              Config. Score
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <Card className="p-6 shadow-card animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground w-10">
                        <Checkbox
                          checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Selecionar todos"
                        />
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Score</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Contato</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Grupo</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Etiquetas</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Localização</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => {
                      const contactLtv = contactDetails[contact.id]?.ltv || 0;
                      const ltvColors = getLtvColor(contactLtv);
                      const contactDetail = contactDetails[contact.id];
                      const score = contactDetail ? calculateScore(contactDetail) : 0;
                      const scoreColors = getScoreColor(score);
                      const ScoreIcon = scoreColors.icon;
                      
                      return (
                        <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                          <td className="py-4 px-2">
                            <Checkbox
                              checked={selectedContacts.has(contact.id)}
                              onCheckedChange={() => toggleContactSelection(contact.id)}
                              aria-label={`Selecionar ${contact.name}`}
                            />
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex-shrink-0">
                                      {contactLtv > 0 ? (
                                      <div className={`w-8 h-8 rounded-full ${ltvColors.bg} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                        <TrendingUp className="w-4 h-4" />
                                      </div>
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                          <Users className="w-4 h-4" />
                                        </div>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="p-3">
                                    {contactLtv > 0 ? (
                                      <div className="space-y-1">
                                        <p className="font-semibold">Total Comprado</p>
                                        <p className="text-lg font-bold text-primary">
                                          R$ {contactLtv.toFixed(2)}
                                        </p>
                                        <p className={`text-xs ${ltvColors.text}`}>
                                          {getLtvLabel(contactLtv)}
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-sm">Nenhuma compra registrada</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{contact.name}</span>
                                  {contactLtv > 0 && (
                                    <Badge variant="outline" className={`${ltvColors.border} ${ltvColors.text} text-xs px-2`}>
                                      R$ {contactLtv.toFixed(2)}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Último contato: {new Date(contact.lastInteraction).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            {contactDetail ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 cursor-pointer">
                                      <div className={`w-12 h-12 rounded-lg ${scoreColors.bg} flex items-center justify-center text-white shadow-score transition-transform hover:scale-105`}>
                                        <ScoreIcon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <div className="text-2xl font-bold">{score}</div>
                                        <div className={`text-xs ${scoreColors.text} font-medium`}>
                                          {scoreColors.label.split(' ')[1]}
                                        </div>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="p-3">
                                    <div className="space-y-2">
                                      <p className="font-semibold">{scoreColors.label}</p>
                                      <div className="text-xs space-y-1">
                                        <div>📧 E-mails abertos: {contactDetail.history.filter(e => e.type === 'email_open').length} × {scoreConfig.weights.emailOpens} pts</div>
                                        <div>🔗 Cliques: {contactDetail.history.filter(e => e.type === 'link_click').length} × {scoreConfig.weights.linkClicks} pts</div>
                                        <div>🛍️ Compras: {contactDetail.purchases.length} × {scoreConfig.weights.purchases} pts</div>
                                        <div>💰 LTV: R$ {contactDetail.ltv.toFixed(2)} ÷ {scoreConfig.weights.ltvDivisor}</div>
                                      </div>
                                      <div className="pt-2 border-t border-border">
                                        <div className="font-bold">Score Total: {score}/100</div>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <div className="text-muted-foreground text-sm">N/A</div>
                            )}
                          </td>
                          <td className="py-4 px-2">
                            <div>
                              <div className="text-sm">{contact.phone}</div>
                              <div className="text-sm text-muted-foreground">{contact.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <Badge variant="outline">{contact.group}</Badge>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(contact.status)}`}></div>
                              <span className="text-sm">{contact.status}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{contact.city}, {contact.state}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setSelectedContactId(contact.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Ações do Contato</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-2">
                                    <Button 
                                      variant="ghost" 
                                      className="justify-start"
                                      onClick={() => {
                                        setSelectedContactId(contact.id);
                                      }}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      Visualizar Perfil
                                    </Button>
                                    <Button variant="ghost" className="justify-start">
                                      <Edit className="w-4 h-4 mr-2" />
                                      Editar Contato
                                    </Button>
                                    <Button variant="ghost" className="justify-start text-destructive">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Excluir Contato
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Grupos de Contatos</h3>
                <Button>
                  <Tag className="w-4 h-4 mr-2" />
                  Novo Grupo
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <Card key={group} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{group}</h4>
                        <p className="text-sm text-muted-foreground">
                          1.247 contatos
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tags">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Etiquetas</h3>
                <Button>
                  <Tag className="w-4 h-4 mr-2" />
                  Nova Etiqueta
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-muted">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="webhook">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Captação via Webhook</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <Input 
                    id="webhook-url"
                    value="https://api.nucleo.com/webhook/capture"
                    readOnly
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Use esta URL para integrar com formulários externos
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Exemplo de Payload</h4>
                  <pre className="text-sm text-muted-foreground">
{`{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "group": "Novos",
  "tags": ["Landing Page", "Newsletter"]
}`}
                  </pre>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="score-config">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuração do Sistema de Score
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ajuste os pesos utilizados no cálculo automático do score dos leads. 
                    A fórmula aplicada é: <code className="bg-muted px-2 py-1 rounded text-xs">
                      Score = (E-mails × peso) + (Cliques × peso) + (Compras × peso) + (LTV ÷ divisor)
                    </code>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Configuração de Pesos */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Pesos por Ação
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="grid gap-2">
                        <Label htmlFor="email-weight" className="text-sm">
                          📧 E-mails Abertos (peso por abertura)
                        </Label>
                        <Input
                          id="email-weight"
                          type="number"
                          min="0"
                          step="0.5"
                          value={tempWeights.emailOpens}
                          onChange={(e) => setTempWeights({ ...tempWeights, emailOpens: parseFloat(e.target.value) || 0 })}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Atual: {scoreConfig.weights.emailOpens} pontos por e-mail aberto
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="click-weight" className="text-sm">
                          🔗 Cliques em Links (peso por clique)
                        </Label>
                        <Input
                          id="click-weight"
                          type="number"
                          min="0"
                          step="0.5"
                          value={tempWeights.linkClicks}
                          onChange={(e) => setTempWeights({ ...tempWeights, linkClicks: parseFloat(e.target.value) || 0 })}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Atual: {scoreConfig.weights.linkClicks} pontos por clique
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="purchase-weight" className="text-sm">
                          🛍️ Compras Realizadas (peso por compra)
                        </Label>
                        <Input
                          id="purchase-weight"
                          type="number"
                          min="0"
                          step="1"
                          value={tempWeights.purchases}
                          onChange={(e) => setTempWeights({ ...tempWeights, purchases: parseFloat(e.target.value) || 0 })}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Atual: {scoreConfig.weights.purchases} pontos por compra
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="ltv-divisor" className="text-sm">
                          💰 Divisor de LTV (valor total gasto)
                        </Label>
                        <Input
                          id="ltv-divisor"
                          type="number"
                          min="1"
                          step="1"
                          value={tempWeights.ltvDivisor}
                          onChange={(e) => setTempWeights({ ...tempWeights, ltvDivisor: parseFloat(e.target.value) || 1 })}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Atual: LTV dividido por {scoreConfig.weights.ltvDivisor} = pontos
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Preview do Cálculo */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Exemplo de Cálculo
                    </h4>
                    
                    <Card className="p-4 bg-muted/50">
                      <div className="space-y-3 text-sm">
                        <div className="font-semibold border-b border-border pb-2">
                          Lead Exemplo:
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>📧 5 e-mails abertos × {tempWeights.emailOpens}</span>
                            <span className="font-medium">{5 * tempWeights.emailOpens} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🔗 3 cliques × {tempWeights.linkClicks}</span>
                            <span className="font-medium">{3 * tempWeights.linkClicks} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🛍️ 2 compras × {tempWeights.purchases}</span>
                            <span className="font-medium">{2 * tempWeights.purchases} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>💰 R$ 500,00 ÷ {tempWeights.ltvDivisor}</span>
                            <span className="font-medium">{Math.round(500 / tempWeights.ltvDivisor)} pts</span>
                          </div>
                        </div>
                        <div className="border-t border-border pt-3 flex justify-between items-center">
                          <span className="font-bold">Score Total:</span>
                          <span className="text-2xl font-bold text-primary">
                            {Math.min(100, Math.round(
                              (5 * tempWeights.emailOpens) + 
                              (3 * tempWeights.linkClicks) + 
                              (2 * tempWeights.purchases) + 
                              (500 / tempWeights.ltvDivisor)
                            ))}/100
                          </span>
                        </div>
                      </div>
                    </Card>

                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <h5 className="font-semibold mb-2 text-sm">💡 Dica de Configuração</h5>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Aumente o peso de compras para valorizar conversões</li>
                        <li>• Aumente o peso de cliques para valorizar engajamento</li>
                        <li>• Diminua o divisor de LTV para dar mais peso ao valor gasto</li>
                        <li>• Score máximo sempre será limitado a 100 pontos</li>
                      </ul>
                    </div>

                    {scoreConfig.lastUpdated && (
                      <p className="text-xs text-muted-foreground">
                        Última atualização: {new Date(scoreConfig.lastUpdated).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      resetToDefaults();
                      setTempWeights({ emailOpens: 2, linkClicks: 3, purchases: 10, ltvDivisor: 10 });
                    }}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restaurar Padrões
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      updateWeights(tempWeights);
                      // Aqui seria feita a persistência no banco quando o backend estiver ativo
                    }}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Configuração
                  </Button>
                </div>

                {/* Aviso sobre persistência */}
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    ⚠️ <strong>Nota:</strong> As configurações estão sendo salvas localmente no navegador. 
                    Para persistir no banco de dados e compartilhar entre usuários, conecte o Lovable Cloud.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Novo Contato */}
      <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Contato</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Digite o nome completo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="group">Grupo</Label>
                <Select 
                  value={newContact.group} 
                  onValueChange={(value) => setNewContact({ ...newContact, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newContact.status} 
                  onValueChange={(value) => setNewContact({ ...newContact, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Etiquetas</Label>
              <Select 
                value={newContact.tags[0] || ''} 
                onValueChange={(value) => {
                  if (!newContact.tags.includes(value)) {
                    setNewContact({ ...newContact, tags: [...newContact.tags, value] });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione etiquetas" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newContact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {newContact.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setNewContact({ 
                        ...newContact, 
                        tags: newContact.tags.filter(t => t !== tag) 
                      })}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="state">Estado</Label>
                <Select 
                  value={newContact.state} 
                  onValueChange={(value) => setNewContact({ ...newContact, state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={newContact.city}
                  onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                  placeholder="Digite a cidade"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsNewContactOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveContact}>
              Salvar Contato
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Exportar */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Contatos</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              Baixe todos os seus contatos em formato CSV (planilha).
            </p>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium">contatos.csv</p>
                <p className="text-sm text-muted-foreground">{contacts.length} contatos</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsExportOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Baixar Planilha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Importar */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Contatos</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-muted-foreground">
              Faça upload de uma planilha CSV com seus contatos.
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">Arraste e solte seu arquivo aqui</p>
              <p className="text-sm text-muted-foreground mb-4">ou</p>
              <Button variant="outline">
                Selecionar Arquivo
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Formatos aceitos: CSV (até 5MB)
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2 text-sm">Formato esperado do CSV:</p>
              <p className="text-xs text-muted-foreground font-mono">
                Nome,Telefone,Email,Grupo,Status,Etiquetas,Estado,Cidade
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancelar
            </Button>
            <Button>
              Importar Contatos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar à Campanha */}
      <Dialog open={isBulkCampaignOpen} onOpenChange={setIsBulkCampaignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Leads à Campanha</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Leads selecionados:</p>
              <div className="flex flex-wrap gap-2">
                {contacts
                  .filter(c => selectedContacts.has(c.id))
                  .map(contact => (
                    <Badge key={contact.id} variant="secondary">
                      {contact.name}
                    </Badge>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Total: {selectedContacts.size} {selectedContacts.size === 1 ? 'lead' : 'leads'}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="campaign-select">Selecione a Campanha</Label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger id="campaign-select">
                  <SelectValue placeholder="Escolha uma campanha" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign} value={campaign}>
                      {campaign}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Os leads selecionados serão adicionados à campanha escolhida e poderão receber mensagens conforme configuração da campanha.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsBulkCampaignOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBulkAddToCampaign} disabled={!selectedCampaign}>
              <Send className="w-4 h-4 mr-2" />
              Adicionar à Campanha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sheet Detalhes do Contato com LTV */}
      <Sheet open={selectedContactId !== null} onOpenChange={(open) => !open && setSelectedContactId(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          {selectedContactId && (
            <>
              <SheetHeader>
                <SheetTitle>Perfil Completo do Lead</SheetTitle>
                <SheetDescription>
                  {contacts.find(c => c.id === selectedContactId)?.name}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Informações Básicas */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Informações de Contato
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{contacts.find(c => c.id === selectedContactId)?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium">{contacts.find(c => c.id === selectedContactId)?.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Localização:</span>
                      <span className="font-medium">
                        {contacts.find(c => c.id === selectedContactId)?.city}, 
                        {contacts.find(c => c.id === selectedContactId)?.state}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Score e LTV */}
                {contactDetails[selectedContactId] && (
                  <>
                    {(() => {
                      const currentScore = calculateScore(contactDetails[selectedContactId]);
                      const scoreColors = getScoreColor(currentScore);
                      
                      return (
                        <Card className={`p-4 ${scoreColors.bgLight} border-${scoreColors.border.replace('border-', '')} shadow-score animate-fade-in`}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold flex items-center gap-2">
                              <Activity className={`w-4 h-4 ${scoreColors.text}`} />
                              Score do Lead
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`text-lg px-3 py-1 ${scoreColors.border} ${scoreColors.text} bg-white dark:bg-card`}
                            >
                              {currentScore}/100
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-16 h-16 rounded-xl ${scoreColors.bg} flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105`}>
                              {React.createElement(scoreColors.icon, { className: "w-8 h-8" })}
                            </div>
                            <div>
                              <div className="text-2xl font-bold">
                                {scoreColors.label}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Classificação automática
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                              <span className="text-muted-foreground">📧 E-mails abertos × {scoreConfig.weights.emailOpens}pts</span>
                              <span className="font-medium">{contactDetails[selectedContactId].history.filter(e => e.type === 'email_open').length * scoreConfig.weights.emailOpens} pts</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                              <span className="text-muted-foreground">🔗 Cliques em links × {scoreConfig.weights.linkClicks}pts</span>
                              <span className="font-medium">{contactDetails[selectedContactId].history.filter(e => e.type === 'link_click').length * scoreConfig.weights.linkClicks} pts</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                              <span className="text-muted-foreground">🛍️ Compras × {scoreConfig.weights.purchases}pts</span>
                              <span className="font-medium">{contactDetails[selectedContactId].purchases.length * scoreConfig.weights.purchases} pts</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                              <span className="text-muted-foreground">💰 LTV ÷ {scoreConfig.weights.ltvDivisor}</span>
                              <span className="font-medium">{Math.round(contactDetails[selectedContactId].ltv / scoreConfig.weights.ltvDivisor)} pts</span>
                            </div>
                          </div>
                        </Card>
                      );
                    })()}

                    {/* LTV Total */}
                    <Card className="p-4 bg-ltv-bg border-ltv shadow-score animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-ltv" />
                          LTV Total
                        </h3>
                        <Badge variant="default" className="text-lg px-3 py-1 bg-ltv text-white">
                          R$ {contactDetails[selectedContactId].ltv.toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Valor total gerado pelo cliente
                      </p>
                    </Card>

                    {/* Forma de Pagamento */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Forma de Pagamento
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          {contactDetails[selectedContactId].paymentMethod}
                        </Badge>
                      </div>
                    </Card>

                    {/* Campanha de Origem */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Campanha de Origem
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm">
                          {contactDetails[selectedContactId].sourceCampaign}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Primeira interação com a marca
                      </p>
                    </Card>

                    {/* Histórico de Compras */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Histórico de Compras
                      </h3>
                      <div className="space-y-3">
                        {contactDetails[selectedContactId].purchases.map((purchase) => (
                          <div 
                            key={purchase.id} 
                            className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">{purchase.product}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(purchase.date).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <div className="font-semibold text-sm text-primary">
                              R$ {purchase.value.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total de Compras:</span>
                          <span className="text-lg font-bold text-primary">
                            {contactDetails[selectedContactId].purchases.length}
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* Histórico Completo - Timeline */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Histórico Completo
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        Linha do tempo com todas as interações do lead
                      </p>
                      <div className="relative space-y-4">
                        {/* Timeline line */}
                        <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-border"></div>
                        
                        {contactDetails[selectedContactId].history
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((event) => {
                            const getEventIcon = () => {
                              switch (event.type) {
                                case 'purchase':
                                  return <ShoppingCart className="w-4 h-4 text-white" />;
                                case 'email_open':
                                  return <Mail className="w-4 h-4 text-white" />;
                                case 'link_click':
                                  return <MousePointerClick className="w-4 h-4 text-white" />;
                                case 'campaign_participation':
                                  return <Target className="w-4 h-4 text-white" />;
                                default:
                                  return <Activity className="w-4 h-4 text-white" />;
                              }
                            };

                            const getEventColor = () => {
                              switch (event.type) {
                                case 'purchase':
                                  return 'bg-green-500';
                                case 'email_open':
                                  return 'bg-blue-500';
                                case 'link_click':
                                  return 'bg-purple-500';
                                case 'campaign_participation':
                                  return 'bg-orange-500';
                                default:
                                  return 'bg-gray-500';
                              }
                            };

                            const getEventLabel = () => {
                              switch (event.type) {
                                case 'purchase':
                                  return 'Compra';
                                case 'email_open':
                                  return 'E-mail Aberto';
                                case 'link_click':
                                  return 'Link Clicado';
                                case 'campaign_participation':
                                  return 'Campanha';
                                default:
                                  return 'Atividade';
                              }
                            };

                            return (
                              <div key={event.id} className="relative flex gap-3 pl-1">
                                {/* Icon circle */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getEventColor()} flex items-center justify-center shadow-md z-10`}>
                                  {getEventIcon()}
                                </div>
                                
                                {/* Event content */}
                                <div className="flex-1 pb-4">
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {getEventLabel()}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(event.date).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="text-sm font-medium mb-1">
                                    {event.description}
                                  </div>
                                  
                                  {event.metadata && (
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      {event.metadata.product && (
                                        <div>Produto: <span className="font-medium">{event.metadata.product}</span></div>
                                      )}
                                      {event.metadata.value && (
                                        <div>Valor: <span className="font-medium text-green-500">R$ {event.metadata.value.toFixed(2)}</span></div>
                                      )}
                                      {event.metadata.campaign && (
                                        <div>Campanha: <span className="font-medium">{event.metadata.campaign}</span></div>
                                      )}
                                      {event.metadata.subject && (
                                        <div>Assunto: <span className="font-medium">{event.metadata.subject}</span></div>
                                      )}
                                      {event.metadata.link && (
                                        <div>Link: <span className="font-medium">{event.metadata.link}</span></div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </Card>
                  </>
                )}

                {!contactDetails[selectedContactId] && (
                  <Card className="p-6 text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      Nenhuma compra registrada ainda
                    </p>
                  </Card>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}