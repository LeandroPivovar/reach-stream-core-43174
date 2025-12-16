import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { api, Contact as ApiContact } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
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
  DialogDescription,
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
import { SegmentationPicker } from '@/components/campaigns/SegmentationPicker';
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
  SlidersHorizontal,
  Cake,
  UserX,
  Ticket,
  DollarSign,
  MousePointer,
  Undo2,
  User2,
  Loader2
} from 'lucide-react';
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
import { LtvHistory } from '@/components/contacts/LtvHistory';
import { ManualSaleDialog } from '@/components/contacts/ManualSaleDialog';

// Interface para compatibilidade com a estrutura existente do frontend
interface ContactFrontend {
  id: number;
  name: string;
  phone: string;
  email: string;
  group: string;
  status: string;
  tags: string[];
  state: string;
  city: string;
  segmentations: string[];
  lastInteraction: string;
}

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
  const { config: scoreConfig, updateWeights, resetToDefaults, isLoading: isLoadingScoreConfig } = useScoreConfig();
  const { toast } = useToast();
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [tempWeights, setTempWeights] = useState(scoreConfig.weights);
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [isBulkCampaignOpen, setIsBulkCampaignOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [isManualSaleOpen, setIsManualSaleOpen] = useState(false);
  const [selectedContactForSale, setSelectedContactForSale] = useState<{ id: number; name: string } | null>(null);
  const [selectedSegmentationView, setSelectedSegmentationView] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    color: '#667eea',
  });
  const [isNewTagOpen, setIsNewTagOpen] = useState(false);
  const [isEditTagOpen, setIsEditTagOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [newTag, setNewTag] = useState({
    name: '',
    color: '#667eea',
  });
  
  // Estados de Filtro
  const [filters, setFilters] = useState({
    name: '',
    campaign: '',
    scoreMin: 0,
    scoreMax: 100,
    ltvMin: 0,
    ltvMax: 10000,
    purchaseCount: 'all', // por número de compras
    birthday: false, // aniversariantes
    inactive: false, // clientes inativos
    hasCoupon: false, // com cupom ativo
    highTicket: false, // maior ticket médio
    purchaseValueMin: 0, // valor de compra mínimo
    leadCaptured: false, // lead capturado por formulário
    cartRecovered: false, // carrinho recuperado
    daysWithoutPurchase: 0, // dias sem comprar
    gender: 'all', // masculino, feminino, todos
    state: 'all', // estado
    segmentations: [] as string[], // segmentações
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    group: '', // Nome do grupo (para exibição)
    groupId: null as number | null, // ID do grupo (para envio)
    status: 'Ativo',
    tags: [] as string[], // Nomes das tags (para exibição)
    tagIds: [] as number[], // IDs das tags (para envio)
    state: '',
    city: '',
    segmentations: [] as string[]
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

  const [contacts, setContacts] = useState<ContactFrontend[]>([]);

  // Converter contato da API para formato do frontend
  const convertApiContactToFrontend = useCallback((apiContact: ApiContact): ContactFrontend => {
    return {
      id: apiContact.id,
      name: apiContact.name,
      phone: apiContact.phone || '',
      email: apiContact.email || '',
      group: apiContact.group?.name || apiContact.company || 'Regular',
      status: apiContact.status || 'Ativo',
      tags: apiContact.contactTags?.map(ct => ct.tag.name) || [],
      state: apiContact.state || '',
      city: apiContact.city || '',
      segmentations: apiContact.contactSegmentations?.map(cs => cs.segmentationId) || [],
      lastInteraction: apiContact.updatedAt || apiContact.createdAt
    };
  }, []);

  // Carregar contatos do backend
  useEffect(() => {
    const loadContacts = async () => {
      setIsLoading(true);
      try {
        const apiContacts = await api.getContacts();
        const frontendContacts = apiContacts.map(convertApiContactToFrontend);
        setContacts(frontendContacts);
      } catch (error) {
        console.error('Erro ao carregar contatos:', error);
        toast({
          title: 'Erro ao carregar contatos',
          description: error instanceof Error ? error.message : 'Não foi possível carregar os contatos',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();
  }, [toast]);

  const [groups, setGroups] = useState<Array<{ id: number; name: string; description?: string; color?: string }>>([]);

  // Carregar grupos do backend
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const apiGroups = await api.getGroups();
        setGroups(apiGroups);
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
        toast({
          title: 'Erro ao carregar grupos',
          description: error instanceof Error ? error.message : 'Não foi possível carregar os grupos',
          variant: 'destructive',
        });
      }
    };

    loadGroups();
  }, [toast]);

  const [tags, setTags] = useState<Array<{ id: number; name: string; color?: string }>>([]);

  // Carregar etiquetas do backend
  useEffect(() => {
    const loadTags = async () => {
      try {
        const apiTags = await api.getTags();
        setTags(apiTags);
      } catch (error) {
        console.error('Erro ao carregar etiquetas:', error);
        toast({
          title: 'Erro ao carregar etiquetas',
          description: error instanceof Error ? error.message : 'Não foi possível carregar as etiquetas',
          variant: 'destructive',
        });
      }
    };

    loadTags();
  }, [toast]);

  // Sincronizar tempWeights quando a configuração for carregada do backend
  useEffect(() => {
    if (!isLoadingScoreConfig && scoreConfig.weights) {
      setTempWeights(scoreConfig.weights);
    }
  }, [scoreConfig.weights, isLoadingScoreConfig]);

  const [states] = useState(['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE']);
  const [statuses] = useState(['Ativo', 'Inativo', 'Bloqueado', 'Aguardando']);
  const [campaigns] = useState(['Black Friday 2025', 'Newsletter Semanal', 'Campanha Fidelidade', 'Promoção Verão', 'Lançamento Produto']);

  // Estado para armazenar compras e LTV dos contatos
  const [contactPurchases, setContactPurchases] = useState<Record<number, { purchases: Purchase[]; ltv: number }>>({});

  // Carregar compras de todos os contatos
  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const allPurchases = await api.getContactPurchases();
        
        // Agrupar compras por contato e calcular LTV
        const purchasesByContact: Record<number, { purchases: Purchase[]; ltv: number }> = {};
        
        allPurchases.forEach((purchase) => {
          const contactId = purchase.contactId;
          if (!purchasesByContact[contactId]) {
            purchasesByContact[contactId] = { purchases: [], ltv: 0 };
          }
          
          const purchaseValue = typeof purchase.value === 'string' 
            ? parseFloat(purchase.value) 
            : purchase.value;
          
          purchasesByContact[contactId].purchases.push({
            id: purchase.id,
            date: purchase.purchaseDate,
            value: purchaseValue,
            product: purchase.productName || purchase.product?.name || 'Produto',
          });
          
          purchasesByContact[contactId].ltv += purchaseValue;
        });
        
        setContactPurchases(purchasesByContact);
      } catch (error) {
        console.error('Erro ao carregar compras:', error);
      }
    };

    if (contacts.length > 0) {
      loadPurchases();
    }
  }, [contacts]);

  // Funções de cálculo (devem vir antes de filteredContacts)
  const calculateScore = (contactId: number) => {
    const purchaseData = contactPurchases[contactId];
    if (!purchaseData) return 0;
    
    // Por enquanto, considerar apenas vendas (compras e LTV)
    const purchases = purchaseData.purchases.length || 0;
    const ltv = purchaseData.ltv || 0;
    
    const { purchases: purchaseWeight, ltvDivisor } = scoreConfig.weights;
    
    const ltvDivisorValue = ltvDivisor || 10; // Evitar divisão por zero
    
    const calculatedScore = Math.min(100, Math.round(
      (purchases * (purchaseWeight || 0)) + 
      (ltv / ltvDivisorValue)
    ));
    
    return isNaN(calculatedScore) ? 0 : calculatedScore;
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
    const score = calculateScore(contact.id);
    const safeScore = isNaN(score) ? 0 : score;
    const ltv = contactPurchases[contact.id]?.ltv || 0;
    const purchaseData = contactPurchases[contact.id];
    const campaign = ''; // Campanha não está disponível ainda

    // Filtro por nome
    if (filters.name.trim() && !contact.name.toLowerCase().includes(filters.name.toLowerCase().trim())) {
      return false;
    }

    // Filtro por campanha
    if (filters.campaign && filters.campaign.trim() && campaign !== filters.campaign) {
      return false;
    }

    // Filtro por score
    if (purchaseData && (safeScore < filters.scoreMin || safeScore > filters.scoreMax)) {
      return false;
    }

    // Filtro por LTV
    if (purchaseData && (ltv < filters.ltvMin || ltv > filters.ltvMax)) {
      return false;
    }

    // Filtro por número de compras
    if (filters.purchaseCount !== 'all' && purchaseData) {
      const purchaseCount = purchaseData.purchases.length;
      switch (filters.purchaseCount) {
        case '0':
          if (purchaseCount !== 0) return false;
          break;
        case '1':
          if (purchaseCount !== 1) return false;
          break;
        case '2-5':
          if (purchaseCount < 2 || purchaseCount > 5) return false;
          break;
        case '6-10':
          if (purchaseCount < 6 || purchaseCount > 10) return false;
          break;
        case '10+':
          if (purchaseCount <= 10) return false;
          break;
      }
    }

    // Filtro por aniversariantes (mock - verifica se o mês do nome coincide com mês atual)
    if (filters.birthday) {
      // Em produção, você teria uma data de nascimento para verificar
      // Para demonstração, vamos considerar contatos com 'a' no nome como aniversariantes
      const currentMonth = new Date().getMonth();
      // Mock: considera alguns contatos como aniversariantes
      if (!contact.name.toLowerCase().includes('a')) return false;
    }

    // Filtro por clientes inativos
    if (filters.inactive && contact.status !== 'Inativo') {
      return false;
    }

    // Filtro por cupom ativo (mock - em produção viria do backend)
    if (filters.hasCoupon) {
      // Mock: considera contatos do grupo VIP como tendo cupons
      if (contact.group !== 'VIP') return false;
    }

    // Filtro por maior ticket médio
    if (filters.highTicket && purchaseData) {
      const ticketMedio = ltv / (purchaseData.purchases.length || 1);
      if (ticketMedio < 150) return false; // Considera ticket alto acima de R$ 150
    }

    // Filtro por valor mínimo de compra
    if (filters.purchaseValueMin > 0 && purchaseData) {
      const maxPurchaseValue = Math.max(...purchaseData.purchases.map(p => p.value), 0);
      if (maxPurchaseValue < filters.purchaseValueMin) return false;
    }

    // Filtro por lead capturado (mock)
    if (filters.leadCaptured) {
      // Mock: considera contatos com tag Newsletter como leads capturados
      if (!contact.tags.includes('Newsletter')) return false;
    }

    // Filtro por carrinho recuperado (mock)
    if (filters.cartRecovered) {
      // Mock: considera contatos com tag 'Carrinho Abandonado' como recuperados
      if (!contact.tags.includes('Carrinho Abandonado')) return false;
    }

    // Filtro por dias sem comprar
    if (filters.daysWithoutPurchase > 0 && purchaseData) {
      const lastPurchaseDate = purchaseData.purchases.length > 0 
        ? new Date(purchaseData.purchases[purchaseData.purchases.length - 1].date)
        : null;
      
      if (lastPurchaseDate) {
        const daysSinceLastPurchase = Math.floor((new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastPurchase < filters.daysWithoutPurchase) return false;
      }
    }

    // Filtro por sexo (mock - em produção viria do backend)
    if (filters.gender !== 'all') {
      // Mock: nomes terminados em 'a' são femininos, outros masculinos
      const isFemale = contact.name.endsWith('a');
      if (filters.gender === 'female' && !isFemale) return false;
      if (filters.gender === 'male' && isFemale) return false;
    }

    // Filtro por estado
    if (filters.state !== 'all' && contact.state !== filters.state) {
      return false;
    }

    // Filtro por segmentações
    if (filters.segmentations.length > 0) {
      const hasMatchingSegmentation = filters.segmentations.some(seg => 
        contact.segmentations.includes(seg)
      );
      if (!hasMatchingSegmentation) return false;
    }

    return true;
  });

  const hasActiveFilters = filters.name !== '' || 
    filters.campaign !== '' || 
    filters.scoreMin > 0 || 
    filters.scoreMax < 100 || 
    filters.ltvMin > 0 || 
    filters.ltvMax < 10000 ||
    filters.purchaseCount !== 'all' ||
    filters.birthday ||
    filters.inactive ||
    filters.hasCoupon ||
    filters.highTicket ||
    filters.purchaseValueMin > 0 ||
    filters.leadCaptured ||
    filters.cartRecovered ||
    filters.daysWithoutPurchase > 0 ||
    filters.gender !== 'all' ||
    filters.state !== 'all' ||
    filters.segmentations.length > 0;

  const clearFilters = () => {
    setFilters({
      name: '',
      campaign: '',
      scoreMin: 0,
      scoreMax: 100,
      ltvMin: 0,
      ltvMax: 10000,
      purchaseCount: 'all',
      birthday: false,
      inactive: false,
      hasCoupon: false,
      highTicket: false,
      purchaseValueMin: 0,
      leadCaptured: false,
      cartRecovered: false,
      daysWithoutPurchase: 0,
      gender: 'all',
      state: 'all',
      segmentations: [],
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

  const handleBulkRemove = async () => {
    if (!window.confirm(`Tem certeza que deseja remover ${selectedContacts.size} contatos?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const deletePromises = Array.from(selectedContacts).map(id => api.deleteContact(id));
      await Promise.all(deletePromises);
      setContacts(contacts.filter(c => !selectedContacts.has(c.id)));
      clearSelection();
      toast({
        title: 'Contatos excluídos!',
        description: `${selectedContacts.size} contato(s) foram excluídos com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao excluir contatos:', error);
      toast({
        title: 'Erro ao excluir contatos',
        description: error instanceof Error ? error.message : 'Não foi possível excluir os contatos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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


  const handleSaveContact = async () => {
    if (!newContact.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, preencha o nome do contato',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Converter nome do grupo para groupId
      const selectedGroup = groups.find(g => g.name === newContact.group);
      const groupId = selectedGroup ? selectedGroup.id : (newContact.groupId || undefined);

      // Converter nomes das tags para tagIds
      const tagIds = newContact.tags && newContact.tags.length > 0
        ? newContact.tags
            .map(tagName => tags.find(t => t.name === tagName)?.id)
            .filter((id): id is number => id !== undefined)
        : (newContact.tagIds && newContact.tagIds.length > 0 ? newContact.tagIds : []);

      if (editingContactId) {
        // Editar contato existente
        const apiContact = await api.updateContact(editingContactId, {
          name: newContact.name,
          lastName: newContact.name.split(' ').slice(1).join(' ') || undefined,
          email: newContact.email || undefined,
          phone: newContact.phone || undefined,
          status: newContact.status || undefined,
          state: newContact.state || undefined,
          city: newContact.city || undefined,
          groupId: groupId || null,
          tagIds: tagIds.length > 0 ? tagIds : [],
          segmentationIds: newContact.segmentations && newContact.segmentations.length > 0 ? newContact.segmentations : [],
        });
        const updatedContact = convertApiContactToFrontend(apiContact);
        setContacts(contacts.map(c => c.id === editingContactId ? updatedContact : c));
        toast({
          title: 'Contato atualizado!',
          description: 'O contato foi atualizado com sucesso',
        });
        setEditingContactId(null);
      } else {
        // Criar novo contato
        const apiContact = await api.createContact({
          name: newContact.name,
          lastName: newContact.name.split(' ').slice(1).join(' ') || undefined,
          email: newContact.email || undefined,
          phone: newContact.phone || undefined,
          status: newContact.status || undefined,
          state: newContact.state || undefined,
          city: newContact.city || undefined,
          groupId: groupId,
          tagIds: tagIds.length > 0 ? tagIds : undefined,
          segmentationIds: newContact.segmentations && newContact.segmentations.length > 0 ? newContact.segmentations : undefined,
        });
        const newContactFrontend = convertApiContactToFrontend(apiContact);
        setContacts([...contacts, newContactFrontend]);
        toast({
          title: 'Contato criado!',
          description: 'O contato foi criado com sucesso',
        });
      }
      
      setIsNewContactOpen(false);
      setNewContact({
        name: '',
        phone: '',
        email: '',
        group: '',
        groupId: null,
        status: 'Ativo',
        tags: [],
        tagIds: [],
        state: '',
        city: '',
        segmentations: []
      });
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      toast({
        title: 'Erro ao salvar contato',
        description: error instanceof Error ? error.message : 'Não foi possível salvar o contato',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: number, contactName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o contato "${contactName}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await api.deleteContact(contactId);
      setContacts(contacts.filter(c => c.id !== contactId));
      toast({
        title: 'Contato excluído!',
        description: 'O contato foi excluído com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir contato:', error);
      toast({
        title: 'Erro ao excluir contato',
        description: error instanceof Error ? error.message : 'Não foi possível excluir o contato',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditContact = (contact: ContactFrontend) => {
    setEditingContactId(contact.id);
    // Encontrar o ID do grupo pelo nome
    const groupId = groups.find(g => g.name === contact.group)?.id || null;
    // Encontrar os IDs das tags pelos nomes
    const tagIds = contact.tags
      .map(tagName => tags.find(t => t.name === tagName)?.id)
      .filter((id): id is number => id !== undefined);
    
    setNewContact({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      group: contact.group,
      groupId: groupId,
      status: contact.status,
      tags: contact.tags,
      tagIds: tagIds,
      state: contact.state,
      city: contact.city,
      segmentations: contact.segmentations
    });
    setIsNewContactOpen(true);
  };

  // Funções para gerenciar grupos
  const handleSaveGroup = async () => {
    if (!newGroup.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, preencha o nome do grupo',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editingGroupId) {
        // Editar grupo existente
        const updatedGroup = await api.updateGroup(editingGroupId, {
          name: newGroup.name,
          description: newGroup.description || undefined,
          color: newGroup.color || undefined,
        });
        setGroups(groups.map(g => g.id === editingGroupId ? updatedGroup : g));
        toast({
          title: 'Grupo atualizado!',
          description: 'O grupo foi atualizado com sucesso',
        });
        setEditingGroupId(null);
      } else {
        // Criar novo grupo
        const createdGroup = await api.createGroup({
          name: newGroup.name,
          description: newGroup.description || undefined,
          color: newGroup.color || undefined,
        });
        setGroups([...groups, createdGroup]);
        toast({
          title: 'Grupo criado!',
          description: 'O grupo foi criado com sucesso',
        });
      }
      
      setIsNewGroupOpen(false);
      setIsEditGroupOpen(false);
      setNewGroup({
        name: '',
        description: '',
        color: '#667eea',
      });
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      toast({
        title: 'Erro ao salvar grupo',
        description: error instanceof Error ? error.message : 'Não foi possível salvar o grupo',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o grupo "${groupName}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await api.deleteGroup(groupId);
      setGroups(groups.filter(g => g.id !== groupId));
      toast({
        title: 'Grupo excluído!',
        description: 'O grupo foi excluído com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      toast({
        title: 'Erro ao excluir grupo',
        description: error instanceof Error ? error.message : 'Não foi possível excluir o grupo',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGroup = (group: { id: number; name: string; description?: string; color?: string }) => {
    setEditingGroupId(group.id);
    setNewGroup({
      name: group.name,
      description: group.description || '',
      color: group.color || '#667eea',
    });
    setIsEditGroupOpen(true);
  };

  // Funções para gerenciar etiquetas
  const handleSaveTag = async () => {
    if (!newTag.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, preencha o nome da etiqueta',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editingTagId) {
        // Editar etiqueta existente
        const updatedTag = await api.updateTag(editingTagId, {
          name: newTag.name,
          color: newTag.color || undefined,
        });
        setTags(tags.map(t => t.id === editingTagId ? updatedTag : t));
        toast({
          title: 'Etiqueta atualizada!',
          description: 'A etiqueta foi atualizada com sucesso',
        });
        setEditingTagId(null);
      } else {
        // Criar nova etiqueta
        const createdTag = await api.createTag({
          name: newTag.name,
          color: newTag.color || undefined,
        });
        setTags([...tags, createdTag]);
        toast({
          title: 'Etiqueta criada!',
          description: 'A etiqueta foi criada com sucesso',
        });
      }
      
      setIsNewTagOpen(false);
      setIsEditTagOpen(false);
      setNewTag({
        name: '',
        color: '#667eea',
      });
    } catch (error) {
      console.error('Erro ao salvar etiqueta:', error);
      toast({
        title: 'Erro ao salvar etiqueta',
        description: error instanceof Error ? error.message : 'Não foi possível salvar a etiqueta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: number, tagName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a etiqueta "${tagName}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await api.deleteTag(tagId);
      setTags(tags.filter(t => t.id !== tagId));
      toast({
        title: 'Etiqueta excluída!',
        description: 'A etiqueta foi excluída com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir etiqueta:', error);
      toast({
        title: 'Erro ao excluir etiqueta',
        description: error instanceof Error ? error.message : 'Não foi possível excluir a etiqueta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTag = (tag: { id: number; name: string; color?: string }) => {
    setEditingTagId(tag.id);
    setNewTag({
      name: tag.name,
      color: tag.color || '#667eea',
    });
    setIsEditTagOpen(true);
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
                    <PopoverContent className="w-80 max-h-[600px] overflow-y-auto" align="end">
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

                          {/* Segmentação de Clientes */}
                          <div className="pt-3 border-t space-y-3">
                            <h5 className="font-semibold text-sm">Segmentação de Clientes</h5>
                            
                            {/* Número de Compras */}
                            <div className="space-y-2">
                              <Label htmlFor="filter-purchase-count" className="text-xs font-medium">
                                <ShoppingCart className="w-3 h-3 inline mr-1" />
                                Por Número de Compras
                              </Label>
                              <Select 
                                value={filters.purchaseCount} 
                                onValueChange={(value) => setFilters({ ...filters, purchaseCount: value })}
                              >
                                <SelectTrigger id="filter-purchase-count" className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                  <SelectItem value="all">Todos</SelectItem>
                                  <SelectItem value="0">Nenhuma compra</SelectItem>
                                  <SelectItem value="1">1 compra</SelectItem>
                                  <SelectItem value="2-5">2-5 compras</SelectItem>
                                  <SelectItem value="6-10">6-10 compras</SelectItem>
                                  <SelectItem value="10+">Mais de 10 compras</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Aniversariantes */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="filter-birthday"
                                checked={filters.birthday}
                                onCheckedChange={(checked) => setFilters({ ...filters, birthday: checked as boolean })}
                              />
                              <Label htmlFor="filter-birthday" className="text-xs font-medium cursor-pointer">
                                <Cake className="w-3 h-3 inline mr-1" />
                                Aniversariantes do mês
                              </Label>
                            </div>

                            {/* Clientes Inativos */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="filter-inactive"
                                checked={filters.inactive}
                                onCheckedChange={(checked) => setFilters({ ...filters, inactive: checked as boolean })}
                              />
                              <Label htmlFor="filter-inactive" className="text-xs font-medium cursor-pointer">
                                <UserX className="w-3 h-3 inline mr-1" />
                                Clientes inativos
                              </Label>
                            </div>

                            {/* Com Cupom Ativo */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="filter-coupon"
                                checked={filters.hasCoupon}
                                onCheckedChange={(checked) => setFilters({ ...filters, hasCoupon: checked as boolean })}
                              />
                              <Label htmlFor="filter-coupon" className="text-xs font-medium cursor-pointer">
                                <Ticket className="w-3 h-3 inline mr-1" />
                                Com cupom ativo
                              </Label>
                            </div>

                            {/* Maior Ticket Médio */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="filter-high-ticket"
                                checked={filters.highTicket}
                                onCheckedChange={(checked) => setFilters({ ...filters, highTicket: checked as boolean })}
                              />
                              <Label htmlFor="filter-high-ticket" className="text-xs font-medium cursor-pointer">
                                <TrendingUp className="w-3 h-3 inline mr-1" />
                                Maior ticket médio
                              </Label>
                            </div>

                            {/* Valor Mínimo de Compra */}
                            <div className="space-y-2">
                              <Label htmlFor="filter-purchase-value" className="text-xs font-medium">
                                <DollarSign className="w-3 h-3 inline mr-1" />
                                Valor Mínimo de Compra (R$)
                              </Label>
                              <Input
                                id="filter-purchase-value"
                                type="number"
                                min="0"
                                step="10"
                                value={filters.purchaseValueMin}
                                onChange={(e) => setFilters({ ...filters, purchaseValueMin: parseFloat(e.target.value) || 0 })}
                                className="h-9"
                                placeholder="0"
                              />
                            </div>

                            {/* Lead Capturado */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="filter-lead-captured"
                                checked={filters.leadCaptured}
                                onCheckedChange={(checked) => setFilters({ ...filters, leadCaptured: checked as boolean })}
                              />
                              <Label htmlFor="filter-lead-captured" className="text-xs font-medium cursor-pointer">
                                <MousePointer className="w-3 h-3 inline mr-1" />
                                Lead capturado (formulário)
                              </Label>
                            </div>

                            {/* Carrinho Recuperado */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="filter-cart-recovered"
                                checked={filters.cartRecovered}
                                onCheckedChange={(checked) => setFilters({ ...filters, cartRecovered: checked as boolean })}
                              />
                              <Label htmlFor="filter-cart-recovered" className="text-xs font-medium cursor-pointer">
                                <Undo2 className="w-3 h-3 inline mr-1" />
                                Carrinho recuperado
                              </Label>
                            </div>

                            {/* Dias sem Comprar */}
                            <div className="space-y-2">
                              <Label htmlFor="filter-days-without-purchase" className="text-xs font-medium">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Sem compras há (dias)
                              </Label>
                              <Input
                                id="filter-days-without-purchase"
                                type="number"
                                min="0"
                                value={filters.daysWithoutPurchase}
                                onChange={(e) => setFilters({ ...filters, daysWithoutPurchase: parseInt(e.target.value) || 0 })}
                                className="h-9"
                                placeholder="0"
                              />
                            </div>

                            {/* Sexo */}
                            <div className="space-y-2">
                              <Label htmlFor="filter-gender" className="text-xs font-medium">
                                <User2 className="w-3 h-3 inline mr-1" />
                                Sexo
                              </Label>
                              <Select 
                                value={filters.gender} 
                                onValueChange={(value) => setFilters({ ...filters, gender: value })}
                              >
                                <SelectTrigger id="filter-gender" className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                  <SelectItem value="all">Todos</SelectItem>
                                  <SelectItem value="male">Masculino</SelectItem>
                                  <SelectItem value="female">Feminino</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Estado */}
                            <div className="space-y-2">
                              <Label htmlFor="filter-state" className="text-xs font-medium">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                Estado
                              </Label>
                              <Select 
                                value={filters.state} 
                                onValueChange={(value) => setFilters({ ...filters, state: value })}
                              >
                                <SelectTrigger id="filter-state" className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                  <SelectItem value="all">Todos os estados</SelectItem>
                                  {states.map((state) => (
                                    <SelectItem key={state} value={state}>
                                      {state}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Segmentações */}
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                <Target className="w-3 h-3 inline mr-1" />
                                Segmentações
                              </Label>
                              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                                {[
                                  { id: 'by_purchase_count', label: 'Por número de compras' },
                                  { id: 'birthday', label: 'Aniversariantes' },
                                  { id: 'inactive_customers', label: 'Clientes inativos' },
                                  { id: 'active_coupon', label: 'Com cupom ativo' },
                                  { id: 'high_ticket', label: 'Maior ticket médio' },
                                  { id: 'purchase_value_x', label: 'Valor de compra X' },
                                  { id: 'lead_captured', label: 'Lead capturado' },
                                  { id: 'cart_recovered_customer', label: 'Carrinho recuperado' },
                                  { id: 'no_purchase_x_days', label: 'Sem compra há X dias' },
                                  { id: 'gender_male', label: 'Sexo: Masculino' },
                                  { id: 'gender_female', label: 'Sexo: Feminino' },
                                  { id: 'by_state', label: 'Por estado' },
                                ].map((seg) => (
                                  <div key={seg.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`seg-${seg.id}`}
                                      checked={filters.segmentations.includes(seg.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setFilters({ ...filters, segmentations: [...filters.segmentations, seg.id] });
                                        } else {
                                          setFilters({ ...filters, segmentations: filters.segmentations.filter(s => s !== seg.id) });
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`seg-${seg.id}`} className="text-xs cursor-pointer">
                                      {seg.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                              {filters.segmentations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {filters.segmentations.map((segId) => {
                                    const seg = [
                                      { id: 'by_purchase_count', label: 'Por número de compras' },
                                      { id: 'birthday', label: 'Aniversariantes' },
                                      { id: 'inactive_customers', label: 'Clientes inativos' },
                                      { id: 'active_coupon', label: 'Com cupom ativo' },
                                      { id: 'high_ticket', label: 'Maior ticket médio' },
                                      { id: 'purchase_value_x', label: 'Valor de compra X' },
                                      { id: 'lead_captured', label: 'Lead capturado' },
                                      { id: 'cart_recovered_customer', label: 'Carrinho recuperado' },
                                      { id: 'no_purchase_x_days', label: 'Sem compra há X dias' },
                                      { id: 'gender_male', label: 'Sexo: Masculino' },
                                      { id: 'gender_female', label: 'Sexo: Feminino' },
                                      { id: 'by_state', label: 'Por estado' },
                                    ].find(s => s.id === segId);
                                    return seg ? (
                                      <Badge key={segId} variant="secondary" className="text-xs">
                                        {seg.label}
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              )}
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
                <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
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
                  {contacts.filter(c => calculateScore(c.id) >= 70).length}
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
                    const score = calculateScore(c.id);
                    return score >= 40 && score < 70;
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
                  {contacts.filter(c => calculateScore(c.id) < 40).length}
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
                  {(() => {
                    const contactsWithPurchases = contacts.filter(c => contactPurchases[c.id]);
                    if (contactsWithPurchases.length === 0) return 0;
                    const avgScore = contactsWithPurchases.reduce((acc, c) => acc + calculateScore(c.id), 0) / contactsWithPurchases.length;
                    return Math.round(avgScore) || 0;
                  })()}
                </p>
              </div>
              <div className="w-10 h-10 bg-ltv-bg rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-ltv" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        {/* Barra de Ações Flutuante - Aparece quando há contatos selecionados */}
        {selectedContacts.size > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
            <Card className="p-4 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {selectedContacts.size}
                  </div>
                  <span className="text-sm font-medium">
                    {selectedContacts.size} {selectedContacts.size === 1 ? 'contato selecionado' : 'contatos selecionados'}
                  </span>
                </div>
                
                <div className="h-8 w-px bg-border" />
                
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsBulkCampaignOpen(true)}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Adicionar à Campanha
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
                    variant="ghost"
                    size="sm"
                    onClick={handleBulkRemove}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remover
                  </Button>
                  
                  <div className="h-8 w-px bg-border" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="tags">Etiquetas</TabsTrigger>
            <TabsTrigger value="segmentations">
              <Filter className="w-4 h-4 mr-2" />
              Segmentações
            </TabsTrigger>
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
                      const contactLtv = contactPurchases[contact.id]?.ltv || 0;
                      const ltvColors = getLtvColor(contactLtv);
                      const score = calculateScore(contact.id);
                      const safeScore = isNaN(score) ? 0 : score;
                      const scoreColors = getScoreColor(safeScore);
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
                            {contactPurchases[contact.id] ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 cursor-pointer">
                                      <div className={`w-12 h-12 rounded-lg ${scoreColors.bg} flex items-center justify-center text-white shadow-score transition-transform hover:scale-105`}>
                                        <ScoreIcon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <div className="text-2xl font-bold">{safeScore}</div>
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
                                        <div>🛍️ Compras: {contactPurchases[contact.id].purchases.length || 0} × {scoreConfig.weights.purchases || 0} pts</div>
                                        <div>💰 LTV: R$ {(contactPurchases[contact.id].ltv || 0).toFixed(2)} ÷ {scoreConfig.weights.ltvDivisor || 10}</div>
                                      </div>
                                      <div className="pt-2 border-t border-border">
                                        <div className="font-bold">Score Total: {safeScore}/100</div>
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
                              {contact.city && contact.state ? (
                                <>
                                  <MapPin className="w-3 h-3" />
                                  <span>{contact.city}, {contact.state}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground/50">Não informado</span>
                              )}
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
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedContactForSale({ id: contact.id, name: contact.name });
                                  setIsManualSaleOpen(true);
                                }}
                              >
                                <ShoppingCart className="w-4 h-4" />
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
                                    <Button 
                                      variant="ghost"
                                      className="justify-start"
                                      onClick={() => handleEditContact(contact)}
                                      disabled={isLoading}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Editar Contato
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      className="justify-start"
                                      onClick={() => {
                                        setSelectedContactForSale({ id: contact.id, name: contact.name });
                                        setIsManualSaleOpen(true);
                                      }}
                                    >
                                      <ShoppingCart className="w-4 h-4 mr-2" />
                                      Cadastrar Venda
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      className="justify-start text-destructive"
                                      onClick={() => handleDeleteContact(contact.id, contact.name)}
                                      disabled={isLoading}
                                    >
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
                <Button onClick={() => {
                  setEditingGroupId(null);
                  setNewGroup({ name: '', description: '', color: '#667eea' });
                  setIsNewGroupOpen(true);
                }}>
                  <Tag className="w-4 h-4 mr-2" />
                  Novo Grupo
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum grupo criado ainda</p>
                    <p className="text-sm text-muted-foreground mt-2">Crie seu primeiro grupo para organizar seus contatos</p>
                  </div>
                ) : (
                  groups.map((group) => {
                    const contactsInGroup = contacts.filter(c => c.group === group.name).length;
                    return (
                      <Card key={group.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {group.color && (
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: group.color }}
                                />
                              )}
                              <h4 className="font-medium">{group.name}</h4>
                            </div>
                            {group.description && (
                              <p className="text-xs text-muted-foreground mb-1">{group.description}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {contactsInGroup} {contactsInGroup === 1 ? 'contato' : 'contatos'}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditGroup(group)}
                              disabled={isLoading}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteGroup(group.id, group.name)}
                              disabled={isLoading}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tags">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Etiquetas</h3>
                <Button onClick={() => {
                  setEditingTagId(null);
                  setNewTag({ name: '', color: '#667eea' });
                  setIsNewTagOpen(true);
                }}>
                  <Tag className="w-4 h-4 mr-2" />
                  Nova Etiqueta
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <div className="w-full text-center py-12">
                    <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma etiqueta criada ainda</p>
                    <p className="text-sm text-muted-foreground mt-2">Crie sua primeira etiqueta para organizar seus contatos</p>
                  </div>
                ) : (
                  tags.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-muted flex items-center gap-2 pr-1"
                      style={{ borderColor: tag.color || undefined }}
                    >
                      {tag.color && (
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      <span>{tag.name}</span>
                      <div className="flex gap-1 ml-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-muted-foreground/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTag(tag);
                          }}
                          disabled={isLoading}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-destructive/20 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTag(tag.id, tag.name);
                          }}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </Badge>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="segmentations">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Clique em uma segmentação para visualizar os contatos que pertencem a ela.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: 'by_purchase_count', label: 'Clientes por número de compras', description: 'Segmentar por quantidade de compras' },
                    { id: 'birthday', label: 'Aniversário', description: 'Clientes que fazem aniversário' },
                    { id: 'inactive_customers', label: 'Clientes inativos', description: 'Sem compras por período prolongado' },
                    { id: 'active_coupon', label: 'Clientes com cupom ativo', description: 'Possuem cupons válidos não utilizados' },
                    { id: 'high_ticket', label: 'Clientes com maior ticket médio', description: 'Alto valor por compra' },
                    { id: 'purchase_value_x', label: 'Valor de compra X', description: 'Compras acima de valor específico' },
                    { id: 'lead_captured', label: 'Lead capturado', description: 'Lead obtido por formulário' },
                    { id: 'cart_recovered_customer', label: 'Carrinho recuperado', description: 'Cliente que recuperou carrinho' },
                    { id: 'no_purchase_x_days', label: 'Clientes que não compram há X dias', description: 'Inativos por período específico' },
                    { id: 'gender_male', label: 'Sexo: Masculino', description: 'Clientes do sexo masculino' },
                    { id: 'gender_female', label: 'Sexo: Feminino', description: 'Clientes do sexo feminino' },
                    { id: 'by_state', label: 'Estado', description: 'Segmentar por localização geográfica' },
                  ].map((segment) => {
                    const contactsInSegment = contacts.filter(c => c.segmentations.includes(segment.id));
                    const isSelected = selectedSegmentationView === segment.id;
                    
                    return (
                      <Card
                        key={segment.id}
                        className={`p-4 cursor-pointer hover:border-primary transition-all ${
                          isSelected ? 'border-primary bg-primary/5 shadow-md' : ''
                        }`}
                        onClick={() => setSelectedSegmentationView(isSelected ? null : segment.id)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{segment.label}</h4>
                            <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                              {contactsInSegment.length}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{segment.description}</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Lista de Contatos da Segmentação Selecionada */}
                {selectedSegmentationView && (
                  <Card className="p-6 animate-fade-in">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {[
                              { id: 'by_purchase_count', label: 'Clientes por número de compras' },
                              { id: 'birthday', label: 'Aniversariantes' },
                              { id: 'inactive_customers', label: 'Clientes inativos' },
                              { id: 'active_coupon', label: 'Com cupom ativo' },
                              { id: 'high_ticket', label: 'Maior ticket médio' },
                              { id: 'purchase_value_x', label: 'Valor de compra X' },
                              { id: 'lead_captured', label: 'Lead capturado' },
                              { id: 'cart_recovered_customer', label: 'Carrinho recuperado' },
                              { id: 'no_purchase_x_days', label: 'Sem compra há X dias' },
                              { id: 'gender_male', label: 'Sexo: Masculino' },
                              { id: 'gender_female', label: 'Sexo: Feminino' },
                              { id: 'by_state', label: 'Por estado' },
                            ].find(s => s.id === selectedSegmentationView)?.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {contacts.filter(c => c.segmentations.includes(selectedSegmentationView)).length} contatos
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSegmentationView(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-2 font-semibold text-sm">Nome</th>
                              <th className="text-left py-3 px-2 font-semibold text-sm">Email</th>
                              <th className="text-left py-3 px-2 font-semibold text-sm">Telefone</th>
                              <th className="text-left py-3 px-2 font-semibold text-sm">Grupo</th>
                              <th className="text-left py-3 px-2 font-semibold text-sm">Status</th>
                              <th className="text-left py-3 px-2 font-semibold text-sm">Localização</th>
                              <th className="text-right py-3 px-2 font-semibold text-sm">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contacts
                              .filter(c => c.segmentations.includes(selectedSegmentationView))
                              .map((contact) => {
                                const score = calculateScore(contact.id);
                                const scoreInfo = getScoreColor(score);

                                return (
                                  <tr key={contact.id} className="border-b hover:bg-muted/50">
                                    <td className="py-4 px-2">
                                      <div className="font-medium">{contact.name}</div>
                                    </td>
                                    <td className="py-4 px-2">
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="w-3 h-3" />
                                        {contact.email}
                                      </div>
                                    </td>
                                    <td className="py-4 px-2 text-sm text-muted-foreground">
                                      {contact.phone}
                                    </td>
                                    <td className="py-4 px-2">
                                      <Badge variant="outline">{contact.group}</Badge>
                                    </td>
                                    <td className="py-4 px-2">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(contact.status)}`} />
                                        <span className="text-sm">{contact.status}</span>
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
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          onClick={() => {
                                            setSelectedContactForSale({ id: contact.id, name: contact.name });
                                            setIsManualSaleOpen(true);
                                          }}
                                        >
                                          <ShoppingCart className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Card>
                )}
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
                            <span className="font-medium">{(5 * (tempWeights.emailOpens || 0)) || 0} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🔗 3 cliques × {tempWeights.linkClicks || 0}</span>
                            <span className="font-medium">{(3 * (tempWeights.linkClicks || 0)) || 0} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🛍️ 2 compras × {tempWeights.purchases || 0}</span>
                            <span className="font-medium">{(2 * (tempWeights.purchases || 0)) || 0} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>💰 R$ 500,00 ÷ {tempWeights.ltvDivisor || 10}</span>
                            <span className="font-medium">{Math.round(500 / (tempWeights.ltvDivisor || 10)) || 0} pts</span>
                          </div>
                        </div>
                        <div className="border-t border-border pt-3 flex justify-between items-center">
                          <span className="font-bold">Score Total:</span>
                          <span className="text-2xl font-bold text-primary">
                            {Math.min(100, Math.round(
                              (5 * (tempWeights.emailOpens || 0)) + 
                              (3 * (tempWeights.linkClicks || 0)) + 
                              (2 * (tempWeights.purchases || 0)) + 
                              (500 / (tempWeights.ltvDivisor || 10))
                            )) || 0}/100
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
                    onClick={async () => {
                      try {
                        await resetToDefaults();
                        setTempWeights({ emailOpens: 2, linkClicks: 3, purchases: 10, ltvDivisor: 10 });
                        toast({
                          title: 'Configuração restaurada!',
                          description: 'Os valores padrão foram restaurados com sucesso',
                        });
                      } catch (error) {
                        toast({
                          title: 'Erro ao restaurar configuração',
                          description: error instanceof Error ? error.message : 'Não foi possível restaurar os valores padrão',
                          variant: 'destructive',
                        });
                      }
                    }}
                    className="gap-2"
                    disabled={isLoading || isLoadingScoreConfig}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restaurar Padrões
                  </Button>
                  
                  <Button 
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        await updateWeights(tempWeights);
                        toast({
                          title: 'Configuração salva!',
                          description: 'A configuração de score foi salva com sucesso',
                        });
                      } catch (error) {
                        toast({
                          title: 'Erro ao salvar configuração',
                          description: error instanceof Error ? error.message : 'Não foi possível salvar a configuração',
                          variant: 'destructive',
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="gap-2"
                    disabled={isLoading || isLoadingScoreConfig}
                  >
                    <Save className="w-4 h-4" />
                    Salvar Configuração
                  </Button>
                </div>

                {/* Informação sobre persistência */}
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary-foreground">
                    ✅ <strong>Configuração salva no banco de dados!</strong> As configurações são específicas por usuário e são aplicadas automaticamente no cálculo de score dos contatos.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Novo Contato */}
      <Dialog open={isNewContactOpen} onOpenChange={(open) => {
        setIsNewContactOpen(open);
        if (!open) {
          setEditingContactId(null);
          setNewContact({
            name: '',
            phone: '',
            email: '',
            group: '',
            groupId: null,
            status: 'Ativo',
            tags: [],
            tagIds: [],
            state: '',
            city: '',
            segmentations: []
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContactId ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
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
                      <SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>
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
                    <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
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

            <div className="grid gap-2">
              <Label>Segmentações</Label>
              <SegmentationPicker
                selectedSegments={newContact.segmentations}
                onSegmentsChange={(segments) => setNewContact({ ...newContact, segmentations: segments })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsNewContactOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveContact} disabled={isLoading}>
              {isLoading ? 'Salvando...' : editingContactId ? 'Atualizar Contato' : 'Salvar Contato'}
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
      <Dialog open={isImportOpen} onOpenChange={(open) => {
        setIsImportOpen(open);
        if (!open) {
          setImportFile(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Contatos</DialogTitle>
            <DialogDescription>
              Faça upload de uma planilha CSV com seus contatos para importá-los em massa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-muted-foreground">
              Faça upload de uma planilha CSV com seus contatos.
            </p>
            
            {/* Download do exemplo */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm mb-1">📥 Baixar arquivo de exemplo</p>
                  <p className="text-xs text-muted-foreground">
                    Use este modelo para criar sua planilha
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csvContent = [
                      'Nome,Telefone,Email,Grupo,Status,Etiquetas,Estado,Cidade,Segmentações',
                      'João Silva,(11) 98765-4321,joao@exemplo.com,VIP,Ativo,Cliente Premium;Fidelidade,SP,São Paulo,by_purchase_count;high_ticket',
                      'Maria Santos,(21) 91234-5678,maria@exemplo.com,Regular,Ativo,Newsletter,RJ,Rio de Janeiro,birthday',
                      'Pedro Oliveira,(31) 99876-5432,pedro@exemplo.com,,Ativo,,MG,Belo Horizonte,',
                    ].join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'exemplo-contatos.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Exemplo
                </Button>
              </div>
            </div>

            {/* Área de upload */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                id="csv-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: 'Arquivo muito grande',
                        description: 'O arquivo deve ter no máximo 5MB',
                        variant: 'destructive',
                      });
                      return;
                    }
                    setImportFile(file);
                  }
                }}
              />
              {!importFile ? (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-2">Arraste e solte seu arquivo aqui</p>
                  <p className="text-sm text-muted-foreground mb-4">ou</p>
                  <Button 
                    variant="outline"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                  >
                    Selecionar Arquivo
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <p className="font-medium">{importFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(importFile.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImportFile(null);
                      const input = document.getElementById('csv-upload') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                Formatos aceitos: CSV (até 5MB)
              </p>
            </div>

            {/* Formato esperado */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2 text-sm">Formato esperado do CSV:</p>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                Nome,Telefone,Email,Grupo,Status,Etiquetas,Estado,Cidade,Segmentações
              </p>
              <div className="text-xs text-muted-foreground space-y-1 mt-2">
                <p>• <strong>Nome</strong>: Obrigatório</p>
                <p>• <strong>Telefone, Email</strong>: Opcionais</p>
                <p>• <strong>Grupo</strong>: Nome do grupo (deve existir)</p>
                <p>• <strong>Status</strong>: Ativo, Inativo, etc.</p>
                <p>• <strong>Etiquetas</strong>: Separadas por ponto e vírgula (;)</p>
                <p>• <strong>Estado, Cidade</strong>: Localização</p>
                <p>• <strong>Segmentações</strong>: IDs separados por ponto e vírgula (;)</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsImportOpen(false);
                setImportFile(null);
              }}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={async () => {
                if (!importFile) {
                  toast({
                    title: 'Selecione um arquivo',
                    description: 'Por favor, selecione um arquivo CSV para importar',
                    variant: 'destructive',
                  });
                  return;
                }

                setIsImporting(true);
                try {
                  const result = await api.importContacts(importFile);
                  
                  toast({
                    title: 'Importação concluída!',
                    description: `${result.created} contato(s) importado(s) com sucesso${result.errors.length > 0 ? `. ${result.errors.length} erro(s) encontrado(s).` : '.'}`,
                  });

                  if (result.errors.length > 0) {
                    console.warn('Erros na importação:', result.errors);
                  }

                  // Recarregar contatos
                  const apiContacts = await api.getContacts();
                  const frontendContacts = apiContacts.map(convertApiContactToFrontend);
                  setContacts(frontendContacts);

                  setIsImportOpen(false);
                  setImportFile(null);
                } catch (error) {
                  console.error('Erro ao importar contatos:', error);
                  toast({
                    title: 'Erro ao importar contatos',
                    description: error instanceof Error ? error.message : 'Não foi possível importar os contatos',
                    variant: 'destructive',
                  });
                } finally {
                  setIsImporting(false);
                }
              }}
              disabled={!importFile || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Contatos
                </>
              )}
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

      {/* Dialog Detalhes do Contato com LTV */}
      <Dialog open={selectedContactId !== null} onOpenChange={(open) => !open && setSelectedContactId(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedContactId && (
            <>
              <DialogHeader>
                <DialogTitle>Perfil Completo do Lead</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {contacts.find(c => c.id === selectedContactId)?.name}
                </p>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Coluna 1: Informações Básicas, Pagamento e Campanha */}
                <div className="space-y-6">
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

                  {/* Informações básicas do contato */}
                </div>

                {/* Coluna 2: Score */}
                {selectedContactId && (() => {
                  const purchaseData = contactPurchases[selectedContactId];
                  const currentScore = calculateScore(selectedContactId);
                  const scoreColors = getScoreColor(currentScore);
                  const purchases = purchaseData?.purchases || [];
                  const ltv = purchaseData?.ltv || 0;
                  
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
                          <span className="text-muted-foreground">🛍️ Compras × {scoreConfig.weights.purchases || 0}pts</span>
                          <span className="font-medium">{(purchases.length * (scoreConfig.weights.purchases || 0)) || 0} pts</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                          <span className="text-muted-foreground">💰 LTV ÷ {scoreConfig.weights.ltvDivisor || 10}</span>
                          <span className="font-medium">{Math.round(ltv / (scoreConfig.weights.ltvDivisor || 10)) || 0} pts</span>
                        </div>
                      </div>
                    </Card>
                  );
                })()}

                {/* Coluna 3: LTV Total */}
                {selectedContactId && contactPurchases[selectedContactId] && (
                  <Card className="p-4 bg-ltv-bg border-ltv shadow-score animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-ltv" />
                        LTV Total
                      </h3>
                      <Badge variant="default" className="text-lg px-3 py-1 bg-ltv text-white">
                        R$ {contactPurchases[selectedContactId].ltv.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Valor total gerado pelo cliente
                    </p>
                  </Card>
                )}
              </div>

              {/* Seção Completa: Histórico de LTV */}
              {selectedContactId && contactPurchases[selectedContactId] && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Histórico de LTV
                  </h3>
                  <LtvHistory 
                    purchases={contactPurchases[selectedContactId].purchases}
                    totalLtv={contactPurchases[selectedContactId].ltv}
                  />
                </div>
              )}

              {/* Histórico Completo - Timeline */}
              {selectedContactId && contactPurchases[selectedContactId] && (
                <div>
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
                        
                        {contactPurchases[selectedContactId].purchases
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((purchase) => {
                            const event = {
                              id: purchase.id,
                              type: 'purchase' as const,
                              date: purchase.date,
                              description: `Compra realizada: ${purchase.product}`,
                              metadata: { value: purchase.value, product: purchase.product }
                            };
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
                  </div>
                )}

                {selectedContactId && !contactPurchases[selectedContactId] && (
                  <Card className="p-6 text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      Nenhuma compra registrada ainda
                    </p>
                  </Card>
                )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Novo/Editar Grupo */}
      <Dialog open={isNewGroupOpen || isEditGroupOpen} onOpenChange={(open) => {
        if (!open) {
          setIsNewGroupOpen(false);
          setIsEditGroupOpen(false);
          setEditingGroupId(null);
          setNewGroup({ name: '', description: '', color: '#667eea' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroupId ? 'Editar Grupo' : 'Novo Grupo'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="group-name">Nome *</Label>
              <Input
                id="group-name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="Ex: VIP, Clientes Premium, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group-description">Descrição</Label>
              <Textarea
                id="group-description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="Descrição do grupo (opcional)"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group-color">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="group-color"
                  type="color"
                  value={newGroup.color}
                  onChange={(e) => setNewGroup({ ...newGroup, color: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={newGroup.color}
                  onChange={(e) => setNewGroup({ ...newGroup, color: e.target.value })}
                  placeholder="#667eea"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsNewGroupOpen(false);
                setIsEditGroupOpen(false);
                setEditingGroupId(null);
                setNewGroup({ name: '', description: '', color: '#667eea' });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveGroup} disabled={isLoading}>
              {isLoading ? 'Salvando...' : editingGroupId ? 'Atualizar Grupo' : 'Criar Grupo'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Novo/Editar Etiqueta */}
      <Dialog open={isNewTagOpen || isEditTagOpen} onOpenChange={(open) => {
        if (!open) {
          setIsNewTagOpen(false);
          setIsEditTagOpen(false);
          setEditingTagId(null);
          setNewTag({ name: '', color: '#667eea' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTagId ? 'Editar Etiqueta' : 'Nova Etiqueta'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Nome *</Label>
              <Input
                id="tag-name"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                placeholder="Ex: Black Friday, Newsletter, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag-color">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tag-color"
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={newTag.color}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                  placeholder="#667eea"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsNewTagOpen(false);
                setIsEditTagOpen(false);
                setEditingTagId(null);
                setNewTag({ name: '', color: '#667eea' });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveTag} disabled={isLoading}>
              {isLoading ? 'Salvando...' : editingTagId ? 'Atualizar Etiqueta' : 'Criar Etiqueta'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Sale Dialog */}
      <ManualSaleDialog
        open={isManualSaleOpen}
        onOpenChange={setIsManualSaleOpen}
        contactName={selectedContactForSale?.name || ''}
        contactId={selectedContactForSale?.id || 0}
        onPurchaseCreated={() => {
          // Recarregar contatos para atualizar dados
          const loadContacts = async () => {
            try {
              const apiContacts = await api.getContacts();
              const frontendContacts = apiContacts.map(convertApiContactToFrontend);
              setContacts(frontendContacts);
            } catch (error) {
              console.error('Erro ao recarregar contatos:', error);
            }
          };
          loadContacts();
        }}
      />
    </Layout>
  );
}