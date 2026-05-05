import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useInternalAnalytics } from '@/hooks/use-internal-analytics';
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
  DialogDescription,
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
import { api, Campaign, Contact, Group, SegmentationParam } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useScoreConfig } from '@/hooks/use-score-config';
import { useSegmentationStats, evaluateSegmentation } from '@/hooks/use-segmentation-stats';
import { ContactDetailsModal } from '@/components/contacts/ContactDetailsModal';
import { TemplateRequestModal } from '@/components/campaigns/TemplateRequestModal';
import { BuyCreditsModal } from '@/components/subscriptions/BuyCreditsModal';
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
  Phone,
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
  Plus,
  BarChart2,
  Zap,
  Tag,
  Gift,
  DollarSign,
  Upload,
  X,
  Image,
  Filter,
  Library,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Settings,
  Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  birthDate: string;
  gender: string;
  groupId?: number;
  segmentations: string[];
  lastInteraction: string;
  sales: any[];
  hasActiveCoupon?: boolean;
  hasClickedCampaign?: boolean;
}

export default function Campanhas() {
  const navigate = useNavigate();
  const { trackAction } = useInternalAnalytics();
  const { toast } = useToast();
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);
  const [campaignForStatusUpdate, setCampaignForStatusUpdate] = useState<Campaign | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const contactsPerPage = 10;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newCampaign, setNewCampaign] = useLocalStorage('campanhas_newCampaign', {
    campaignComplexity: '' as 'simple' | 'advanced' | '',
    name: '',
    groups: [] as string[],
    segmentations: [] as (string | import('@/lib/api').SegmentationParam)[],
    specificContacts: [] as number[],
    channel: '' as 'email' | 'sms' | 'whatsapp' | '',
    campaignType: '' as 'dispatch' | 'coupon' | 'giftback' | '',
    campaignConfig: {
      enableCoupon: false,
      enableGiftback: false,
      enableShippingCoupon: false,
      coupon: {
        couponName: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: '',
        validityDate: undefined as Date | undefined
      },
      giftback: {
        couponName: '',
        giftValue: '',
        maxRedemptions: '',
        validityDate: undefined as Date | undefined
      },
      shippingCoupon: {
        code: '',
        minPurchaseValue: '',
        expirationDays: '30'
      }
    },
    email: {
      subject: '',
      content: '',
      mode: 'text' as 'text' | 'html',
      media: [] as { url: string; type: 'image' | 'video'; name: string }[]
    },
    workflow: { nodes: [], edges: [] } as any,
    tracking: {
      type: '' as 'utm' | 'pixel' | 'shortlink' | '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      destinationUrl: ''
    },
    scheduleType: 'now' as 'now' | 'schedule',
    scheduleDate: '',
    scheduleTime: ''
  });

  const [filters, setFilters] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    minSends: '',
    maxSends: '',
    channel: 'all',
    minRevenue: '',
    maxRevenue: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const [contacts, setContacts] = useState<ContactFrontend[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [subscriptionStats, setSubscriptionStats] = useState<any>(null);
  const [twilioConfigured, setTwilioConfigured] = useState(false);
  const { config: scoreConfig } = useScoreConfig();

  // Estado para armazenar compras e LTV dos contatos (necessário para o modal)
  const [contactPurchases, setContactPurchases] = useState<Record<number, { purchases: any[]; ltv: number }>>({});

  const [twilioTemplates, setTwilioTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [adminTemplates, setAdminTemplates] = useState<any[]>([]);
  const [isLoadingAdminTemplates, setIsLoadingAdminTemplates] = useState(false);

  useEffect(() => {
    if (newCampaign.campaignComplexity === 'simple' && currentStep === 5 && newCampaign.channel === 'whatsapp' && twilioTemplates.length === 0) {
      setIsLoadingTemplates(true);
      api.getTwilioTemplates()
        .then(res => setTwilioTemplates(res || []))
        .catch(console.error)
        .finally(() => setIsLoadingTemplates(false));
    }
  }, [newCampaign.campaignComplexity, currentStep, newCampaign.channel, twilioTemplates.length]);

  const dynamicStats = useSegmentationStats(
    contacts,
    contactPurchases,
    newCampaign.segmentations || []
  );


  const convertApiContactToFrontend = (apiContact: Contact): ContactFrontend => {
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
      birthDate: apiContact.birthDate || '',
      gender: apiContact.gender || 'all',
      groupId: apiContact.groupId,
      segmentations: apiContact.contactSegmentations?.map(cs => cs.segmentationId) || [],
      lastInteraction: apiContact.updatedAt || apiContact.createdAt,
      sales: apiContact.sales || [],
      hasActiveCoupon: !!apiContact.hasActiveCoupon,
      hasClickedCampaign: !!apiContact.hasClickedCampaign
    };
  };

  useEffect(() => {
    loadCampaigns();
    loadExternalData();
  }, [filters]);

  // Carregar contatos para o modal de detalhes
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await api.getContacts();
        setContacts(data.map(convertApiContactToFrontend));
      } catch (error) {
        console.error('Erro ao carregar contatos em Campanhas:', error);
      }
    };
    loadContacts();
  }, []);

  useEffect(() => {
    const processPurchases = () => {
      const purchasesByContact: Record<number, { purchases: any[]; ltv: number }> = {};
      contacts.forEach((contact) => {
        if (!purchasesByContact[contact.id]) {
          purchasesByContact[contact.id] = { purchases: [], ltv: 0 };
        }
        (contact.sales || []).forEach((sale: any) => {
          const purchaseValue = typeof sale.totalValue === 'string'
            ? parseFloat(sale.totalValue)
            : sale.totalValue;

          purchasesByContact[contact.id].purchases.push({
            id: sale.id,
            date: sale.createdAt,
            value: purchaseValue,
            product: sale.product?.name || 'Produto',
          });
          purchasesByContact[contact.id].ltv += purchaseValue;
        });
      });
      setContactPurchases(purchasesByContact);
    };

    if (contacts.length > 0) {
      processPurchases();
    }
  }, [contacts]);

  const loadExternalData = async () => {
    try {
      const [contactsData, groupsData, statsData, subStats, twilioData] = await Promise.all([
        api.getContacts(),
        api.getGroups(),
        api.getContactSegmentationStats(),
        api.getSubscriptionStats(),
        api.getTwilioConfig().catch(() => ({ configured: false })),
      ]);
      setContacts(contactsData.map(convertApiContactToFrontend));
      setAvailableGroups(groupsData);
      setSubscriptionStats(subStats);
      setTwilioConfigured(!!twilioData?.configured);
    } catch (error) {
      console.error('Erro ao carregar dados externos:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await api.getCampaigns({
        startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined,
        endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined,
        minSends: filters.minSends ? parseInt(filters.minSends) : undefined,
        maxSends: filters.maxSends ? parseInt(filters.maxSends) : undefined,
        channel: filters.channel !== 'all' ? filters.channel : undefined,
        minRevenue: filters.minRevenue ? parseFloat(filters.minRevenue) : undefined,
        maxRevenue: filters.maxRevenue ? parseFloat(filters.maxRevenue) : undefined,
      });
      setCampaigns(data);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      toast({
        title: 'Erro ao carregar campanhas',
        description: error instanceof Error ? error.message : 'Não foi possível carregar as campanhas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalContacts = () => {
    return getFilteredContacts().length;
  };

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
    switch (channel.toLowerCase()) {
      case 'whatsapp': return MessageSquare;
      case 'email':
      case 'e-mail': return Mail;
      case 'sms': return Smartphone;
      default: return MessageSquare;
    }
  };

  const getTotalSteps = () => {
    if (newCampaign.campaignComplexity === 'simple') {
      // Simple: 1. Complexity + 2. Segmentation + 3. Basic Data + 4. Channel + 5. Email/SMS/WhatsApp + 6. Coupon/Giftback + 7. Tracking/Send
      return 7;
    }
    if (newCampaign.campaignComplexity === 'predefined') {
      // Predefined: 1. Complexity + 2. Template Selection + 3. Segmentation + 4. Workflow
      return 4;
    }
    // Advanced: 1. Complexity + 2. Segmentation + 3. Name + 4. Workflow (tudo configurado lá)
    return 4;
  };

  const getFilteredContacts = () => {
    if (newCampaign.groups.length === 0 && newCampaign.segmentations.length === 0 && (!newCampaign.specificContacts || newCampaign.specificContacts.length === 0)) return [];

    const selectedGroupIds = newCampaign.groups.map(Number);

    return contacts.filter(contact => {
      // 1. Verificar se o contato está na lista de pesquisa específica
      if (newCampaign.specificContacts?.includes(contact.id)) return true;

      // 2. Verificar se o contato está em um dos grupos selecionados
      if (contact.groupId && selectedGroupIds.includes(contact.groupId)) return true;

      const purchaseData = contactPurchases[contact.id];

      // 3. Verificar se o contato tem alguma das segmentações selecionadas (avaliando dinamicamente)
      for (const seg of newCampaign.segmentations) {
        const segId = typeof seg === 'string' ? seg : seg.id;
        const params = typeof seg === 'object' ? seg.params : {};

        if (evaluateSegmentation(contact, purchaseData, segId, params)) return true;
      }

      return false;
    });
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


  const handleCreateCampaign = async () => {
    try {
      setIsSaving(true);

      const simpleWhatsapp = newCampaign.campaignComplexity === 'simple' && newCampaign.channel === 'whatsapp';
      const advancedWhatsapp = newCampaign.campaignComplexity === 'advanced' &&
        (newCampaign.workflow?.nodes || []).some((n: any) => n.type === 'whatsapp');

      // Check for WhatsApp credits before creating
      const hasWhatsapp = simpleWhatsapp || advancedWhatsapp;
      const noCredits = hasWhatsapp && subscriptionStats && (
        subscriptionStats.whatsappLimit !== true && 
        subscriptionStats.whatsappLimit !== -1 && 
        (Number(subscriptionStats.whatsappLimit) - (subscriptionStats.whatsappSent || 0)) <= 0
      );

      if (noCredits) {
        setIsBuyCreditsModalOpen(true);
        setIsSaving(false);
        return;
      }

      let finalStatus = newCampaign.scheduleType === 'schedule' ? 'agendada' : 'ativa';
      let finalScheduledAt = newCampaign.scheduleType === 'schedule'
        ? `${newCampaign.scheduleDate}T${newCampaign.scheduleTime}:00`
        : undefined;

      if (newCampaign.campaignComplexity === 'advanced' && newCampaign.workflow?.nodes) {
        const scheduleNode = newCampaign.workflow.nodes.find((n: any) => n.type === 'schedule');

        if (scheduleNode && scheduleNode.data?.scheduleDate && scheduleNode.data?.scheduleTime) {
          finalStatus = 'agendada';
          const dateObj = new Date(scheduleNode.data.scheduleDate);
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
          const dd = String(dateObj.getDate()).padStart(2, '0');
          finalScheduledAt = `${yyyy}-${mm}-${dd}T${scheduleNode.data.scheduleTime}:00`;
        } else {
          finalStatus = 'ativa';
          finalScheduledAt = undefined;
        }
      }

      const payload = {
        name: newCampaign.name,
        complexity: newCampaign.campaignComplexity,
        channel: newCampaign.channel,
        status: finalStatus,
        scheduledAt: finalScheduledAt,
        config: {
          campaignType: newCampaign.campaignType,
          campaignConfig: newCampaign.campaignConfig,
          email: newCampaign.email,
          workflow: newCampaign.workflow,
          tracking: newCampaign.tracking,
          groups: newCampaign.groups,
          segmentations: newCampaign.segmentations,
          specificContacts: newCampaign.specificContacts
        }
      };

      await api.createCampaign(payload as any);

      toast({
        title: 'Campanha criada com sucesso!',
        description: 'Sua campanha já está sendo processada.',
      });

      trackAction('Criar Campanha', { 
        name: newCampaign.name, 
        complexity: newCampaign.campaignComplexity,
        channel: newCampaign.channel 
      });

      setIsNewCampaignOpen(false);
      setCurrentStep(1);
      setNewCampaign({
        campaignComplexity: '',
        name: '',
        groups: [],
        segmentations: [] as (string | import('@/lib/api').SegmentationParam)[],
        specificContacts: [] as number[],
        channel: '',
        campaignType: '',
        campaignConfig: {
          enableCoupon: false,
          enableGiftback: false,
          coupon: {
            couponName: '',
            discountType: 'percentage',
            discountValue: '',
            validityDate: undefined
          },
          giftback: {
            couponName: '',
            giftValue: '',
            maxRedemptions: '',
            validityDate: undefined
          },
          enableShippingCoupon: false,
          shippingCoupon: {
            code: '',
            minPurchaseValue: '',
            expirationDays: '30'
          }
        },
        email: {
          subject: '',
          content: '',
          mode: 'text',
          media: []
        },
        workflow: { nodes: [], edges: [] },
        tracking: {
          type: '',
          utmSource: '',
          utmMedium: '',
          utmCampaign: '',
          destinationUrl: ''
        },
        scheduleType: 'now',
        scheduleDate: '',
        scheduleTime: ''
      });

      loadCampaigns();
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      toast({
        title: 'Erro ao criar campanha',
        description: error instanceof Error ? error.message : 'Não foi possível criar a campanha',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    try {
      await api.deleteCampaign(id);
      toast({
        title: 'Campanha excluída',
        description: 'A campanha foi removida com sucesso.',
      });
      loadCampaigns();
    } catch (error) {
      console.error('Erro ao excluir campanha:', error);
      toast({
        title: 'Erro ao excluir campanha',
        description: error instanceof Error ? error.message : 'Não foi possível excluir a campanha',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const targetCampaign = campaigns.find((campaign) => campaign.id === id);
      const reactivating = currentStatus === 'pausada';
      const usesWhatsapp = !!(
        targetCampaign?.channel === 'whatsapp' ||
        targetCampaign?.config?.workflow?.nodes?.some((node: any) => node?.type === 'whatsapp')
      );

      const newStatus = currentStatus === 'ativa' ? 'pausada' : 'ativa';
      await api.updateCampaign(id, { status: newStatus });
      toast({
        title: `Campanha ${newStatus === 'ativa' ? 'reativada' : 'pausada'}`,
        description: `O status da campanha foi atualizado com sucesso.`,
      });
      loadCampaigns();
    } catch (error) {
      console.error('Erro ao atualizar status da campanha:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível alterar o status da campanha.',
        variant: 'destructive',
      });
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    // Populate newCampaign with existing data
    setNewCampaign({
      campaignComplexity: campaign.complexity as any,
      name: campaign.name,
      groups: campaign.config?.groups || [],
      segmentations: campaign.config?.segmentations || [],
      specificContacts: campaign.config?.specificContacts || [],
      channel: campaign.channel as any,
      campaignType: campaign.config?.campaignType || '',
      campaignConfig: campaign.config?.campaignConfig || {
        enableCoupon: false,
        enableGiftback: false,
        enableShippingCoupon: false,
        coupon: { discountType: 'percentage', discountValue: '', validityDate: undefined },
        giftback: { giftValue: '', maxRedemptions: '', validityDate: undefined },
        shippingCoupon: { code: '', minPurchaseValue: '', expirationDays: '30' }
      },
      email: campaign.config?.email || { subject: '', content: '', mode: 'text', media: [] },
      workflow: campaign.config?.workflow?.nodes ? campaign.config.workflow : { nodes: [], edges: [] },
      tracking: campaign.config?.tracking || { type: '', utmSource: '', utmMedium: '', utmCampaign: '', destinationUrl: '' },
      scheduleType: campaign.scheduledAt ? 'schedule' : 'now',
      scheduleDate: campaign.scheduledAt ? campaign.scheduledAt.split('T')[0] : '',
      scheduleTime: campaign.scheduledAt ? campaign.scheduledAt.split('T')[1].substring(0, 5) : ''
    });

    // Set editing mode (this logic might need refinement if 'update' endpoint differs significantly from 'create')
    // For now, we reuse the create modal but logic needs to handle update vs create.
    // Ideally we should have an editing ID state, but for simplicity we might just open it as "New" pre-filled
    // and handle "Update" if we had an ID.
    // Given the current structure, let's just pre-fill to allow ease of "Cloning/Editing" or add an 'isEditing' state if strict editing is required.
    // The requirement says "Editar Campanha", implying modification.
    // I will add an `editingId` to the state to distinguish.
    setIsNewCampaignOpen(true);
  };

  const handleViewReport = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsReportOpen(true);
  };

  const handleExport = (format: 'csv' | 'excel') => {
    try {
      if (campaigns.length === 0) {
        toast({
          title: 'Aviso',
          description: 'Não há dados para exportar com os filtros atuais.',
          variant: 'destructive',
        });
        return;
      }

      const dataToExport = campaigns.map(c => ({
        'Nome': c.name,
        'Canais': c.channel,
        'Status': c.status,
        'Destinatários': c.recipientsCount || 0,
        'Enviados': c.sentCount || 0,
        'Recebidos': c.deliveredCount || 0,
        'Cliques': c.clicksCount || 0,
        'Faturamento': Number(c.revenue || 0),
        'Data de Criação': new Date(c.createdAt).toLocaleDateString('pt-BR'),
        'Complexidade': c.complexity
      }));

      const XLSX = (window as any).XLSX || import('xlsx');

      import('xlsx').then((XLSX) => {
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // Formacting (Excel only)
        if (format === 'excel') {
          // Add some basic column widths
          ws['!cols'] = [
            { wch: 30 }, // Nome
            { wch: 15 }, // Canais
            { wch: 15 }, // Status
            { wch: 15 }, // Destinatários
            { wch: 15 }, // Enviados
            { wch: 15 }, // Recebidos
            { wch: 15 }, // Cliques
            { wch: 15 }, // Faturamento
            { wch: 20 }, // Data
            { wch: 15 }, // Complexidade
          ];
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Campanhas');

        const fileName = `campanhas_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        XLSX.writeFile(wb, fileName, { bookType: format === 'excel' ? 'xlsx' : 'csv' });

        toast({
          title: 'Exportação concluída',
          description: `O arquivo ${fileName} foi gerado com sucesso.`,
        });
      });

    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o arquivo.',
        variant: 'destructive',
      });
    }
    setIsExportOpen(false);
  };

  const actions = (
    <>
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className={cn("w-4 h-4 mr-2", (filters.startDate || filters.channel !== 'all' || filters.minSends || filters.minRevenue) && "text-primary")} />
            Filtros
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <h4 className="font-medium leading-none mb-2">Filtrar Campanhas</h4>

            <div className="space-y-2">
              <Label>Período</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      {filters.startDate ? format(filters.startDate, 'dd/MM/yy') : "Início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => setFilters({ ...filters, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      {filters.endDate ? format(filters.endDate, 'dd/MM/yy') : "Fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => setFilters({ ...filters, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Canal</Label>
              <Select value={filters.channel} onValueChange={(val) => setFilters({ ...filters, channel: val })}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Todos os canais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os canais</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantidade de Envios</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  className="h-8 text-xs"
                  type="number"
                  value={filters.minSends}
                  onChange={(e) => setFilters({ ...filters, minSends: e.target.value })}
                />
                <Input
                  placeholder="Max"
                  className="h-8 text-xs"
                  type="number"
                  value={filters.maxSends}
                  onChange={(e) => setFilters({ ...filters, maxSends: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Faturamento (R$)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  className="h-8 text-xs"
                  type="number"
                  value={filters.minRevenue}
                  onChange={(e) => setFilters({ ...filters, minRevenue: e.target.value })}
                />
                <Input
                  placeholder="Max"
                  className="h-8 text-xs"
                  type="number"
                  value={filters.maxRevenue}
                  onChange={(e) => setFilters({ ...filters, maxRevenue: e.target.value })}
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => setFilters({
                startDate: undefined,
                endDate: undefined,
                minSends: '',
                maxSends: '',
                channel: 'all',
                minRevenue: '',
                maxRevenue: ''
              })}
            >
              <X className="w-3 h-3 mr-1" />
              Limpar Filtros
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar Campanhas</DialogTitle>
            <DialogDescription>
              Escolha o formato oficial para exportar seus dados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 space-y-2 border-2 hover:border-primary hover:bg-primary/5"
              onClick={() => handleExport('excel')}
            >
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Download className="w-6 h-6" />
              </div>
              <span>Excel (.xlsx)</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 space-y-2 border-2 hover:border-primary hover:bg-primary/5"
              onClick={() => handleExport('csv')}
            >
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Download className="w-6 h-6" />
              </div>
              <span>CSV (.csv)</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                <p className="text-2xl font-bold text-foreground">
                  {campaigns.filter(c => c.status === 'ativa').length}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {(() => {
                    return campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0).toLocaleString('pt-BR');
                  })()}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                <p className="text-2xl font-bold text-foreground">
                  {(() => {
                    const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
                    const totalDelivered = campaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
                    return totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0';
                  })()}%
                </p>
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
                  }).format(campaigns.reduce((acc, c) => acc + Number(c.revenue || 0), 0))}
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
                <p className="text-2xl font-bold text-foreground">
                  {campaigns.filter(c => c.status === 'agendada').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card className="p-0 overflow-hidden border-none shadow-none md:border md:shadow-sm md:p-6">
          <ResponsiveTable<Campaign>
            columns={[
              {
                header: "Campanha",
                cell: (campaign) => (
                  <div>
                    <div className="font-medium">{campaign.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Criada em {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    {campaign.scheduledAt && (
                      <div className="text-[10px] text-primary font-medium mt-0.5">
                        Agendada: {new Date(campaign.scheduledAt).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                )
              },
              {
                header: "Canais",
                cell: (campaign) => (
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      let channels: string[] = [];
                      if ((campaign.complexity === 'advanced' || campaign.complexity === 'predefined') && campaign.config?.workflow?.nodes) {
                        const nodes = campaign.config.workflow.nodes;
                        if (nodes.some((n: any) => n.type === 'email')) channels.push('email');
                        if (nodes.some((n: any) => n.type === 'sms')) channels.push('sms');
                        if (nodes.some((n: any) => n.type === 'whatsapp')) channels.push('whatsapp');
                      } else if (campaign.channel) {
                        channels.push(campaign.channel);
                      }
                      return channels.map((channel, index) => {
                        const Icon = getChannelIcon(channel);
                        return (
                          <div key={`${channel}-${index}`} className="flex items-center space-x-1 bg-muted/50 rounded-full px-2 py-0.5 border border-border/50">
                            <Icon className="w-2.5 h-2.5" />
                            <span className="text-[10px] uppercase font-bold">{channel}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )
              },
              {
                header: "Status",
                cell: (campaign) => (
                  <Badge
                    variant={getStatusVariant(campaign.status)}
                    className="cursor-pointer hover:opacity-80 transition-opacity text-[10px] uppercase font-bold px-2 py-0"
                    onClick={() => {
                      setCampaignForStatusUpdate(campaign);
                      setIsStatusUpdateOpen(true);
                    }}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusColor(campaign.status)}`}></div>
                    {campaign.status}
                  </Badge>
                )
              },
              {
                header: "Enviados",
                className: "text-right",
                cell: (campaign) => <span className="font-medium">{(campaign.sentCount || 0).toLocaleString()}</span>
              },
              {
                header: "Recebidos",
                className: "text-right",
                cell: (campaign) => (
                  <div className="text-right">
                    <div className="font-medium">{(campaign.deliveredCount || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {campaign.sentCount > 0 ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                )
              },
              {
                header: "Cliques",
                className: "text-right",
                cell: (campaign) => (
                  <div className="text-right">
                    <div className="font-medium">{(campaign.clicksCount || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {campaign.deliveredCount > 0 ? ((campaign.clicksCount / campaign.deliveredCount) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                )
              },
              {
                header: "Faturamento",
                className: "text-right",
                cell: (campaign) => (
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(campaign.revenue))}
                    </div>
                  </div>
                )
              },
              {
                header: "Ações",
                className: "text-right",
                cell: (campaign) => (
                  <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ações da Campanha</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-2">
                        <Button variant="ghost" className="justify-start focus:ring-0" onClick={() => handleViewReport(campaign)}>
                          <Eye className="w-4 h-4 mr-2" /> Visualizar Relatório
                        </Button>
                        <Button variant="ghost" className="justify-start focus:ring-0" onClick={() => handleEditCampaign(campaign)}>
                          <Edit className="w-4 h-4 mr-2" /> Editar Campanha
                        </Button>
                        {campaign.status === 'ativa' ? (
                          <Button variant="ghost" className="justify-start focus:ring-0" onClick={() => handleToggleStatus(campaign.id, campaign.status)}>
                            <Pause className="w-4 h-4 mr-2" /> Pausar Campanha
                          </Button>
                        ) : campaign.status === 'pausada' ? (
                          <Button variant="ghost" className="justify-start focus:ring-0" onClick={() => handleToggleStatus(campaign.id, campaign.status)}>
                            <Play className="w-4 h-4 mr-2" /> Reativar Campanha
                          </Button>
                        ) : null}
                        {campaign.status !== 'finalizada' && (
                          <Button variant="ghost" className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 focus:ring-0" onClick={() => handleDeleteCampaign(campaign.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir Campanha
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                )
              }
            ]}
            data={campaigns}
            isLoading={isLoading}
            emptyMessage="Nenhuma campanha encontrada com esses filtros."
            renderMobileCard={(campaign) => (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{campaign.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Criada em {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(campaign.status)} className="text-[9px] h-4 px-1.5 uppercase font-bold">
                    {campaign.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                      let channels: string[] = [];
                      if ((campaign.complexity === 'advanced' || campaign.complexity === 'predefined') && campaign.config?.workflow?.nodes) {
                        const nodes = campaign.config.workflow.nodes;
                        if (nodes.some((n: any) => n.type === 'email')) channels.push('email');
                        if (nodes.some((n: any) => n.type === 'sms')) channels.push('sms');
                        if (nodes.some((n: any) => n.type === 'whatsapp')) channels.push('whatsapp');
                      } else if (campaign.channel) {
                        channels.push(campaign.channel);
                      }
                      return channels.map((channel, index) => {
                        const Icon = getChannelIcon(channel);
                        return (
                          <Badge key={index} variant="secondary" className="text-[9px] h-4 flex items-center gap-1">
                            <Icon className="w-2.5 h-2.5" />
                            {channel}
                          </Badge>
                        );
                      });
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 bg-muted/50 rounded-lg border border-border/50">
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Envios</p>
                    <p className="text-sm font-semibold">{(campaign.sentCount || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">
                       Entrega: {campaign.sentCount > 0 ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="space-y-1 border-l border-border/50 pl-2">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Cliques</p>
                    <p className="text-sm font-semibold">{(campaign.clicksCount || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">
                       Taxa: {campaign.deliveredCount > 0 ? ((campaign.clicksCount / campaign.deliveredCount) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                   <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">Faturamento</p>
                      <p className="font-bold text-green-600 text-sm">
                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(campaign.revenue))}
                      </p>
                   </div>
                   <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handleViewReport(campaign)}>
                      Relatório
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ações da Campanha</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-2">
                          <Button variant="ghost" className="justify-start focus:ring-0" onClick={() => handleEditCampaign(campaign)}>
                            <Edit className="w-4 h-4 mr-2" /> Editar Campanha
                          </Button>
                          <Button variant="ghost" className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 focus:ring-0" onClick={() => handleDeleteCampaign(campaign.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir Campanha
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                   </div>
                </div>
              </div>
            )}
          />
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
            segmentations: [] as (string | import('@/lib/api').SegmentationParam)[],
            specificContacts: [] as number[],
            channel: '',
            campaignType: '',
            campaignConfig: {
              enableCoupon: false,
              enableGiftback: false,
              coupon: {
                couponName: '',
                discountType: 'percentage',
                discountValue: '',
                validityDate: undefined
              },
              giftback: {
                couponName: '',
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
            workflow: { nodes: [], edges: [] },
            tracking: {
              type: '',
              utmSource: '',
              utmMedium: '',
              utmCampaign: '',
              destinationUrl: ''
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
            <DialogDescription className="sr-only">
              Formulário passo a passo para criação de novas campanhas simples ou avançadas.
            </DialogDescription>
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
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${newCampaign.campaignComplexity === 'simple' ? 'border-primary bg-primary/5' : ''
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
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${newCampaign.campaignComplexity === 'advanced' ? 'border-primary bg-primary/5' : ''
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

                  <Card
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${newCampaign.campaignComplexity === 'predefined' ? 'border-primary bg-primary/5' : ''
                      }`}
                    onClick={() => {
                        setNewCampaign({ ...newCampaign, campaignComplexity: 'predefined' });
                        if (adminTemplates.length === 0) {
                            setIsLoadingAdminTemplates(true);
                            api.adminCampaignTemplatesApi.getPublic()
                                .then(res => setAdminTemplates(res || []))
                                .catch(console.error)
                                .finally(() => setIsLoadingAdminTemplates(false));
                        }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Library className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Campanha Pré-Definida</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Use modelos prontos criados pelo administrador
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Fluxos de trabalho comprovados</li>
                          <li>• Setup rápido e simplificado</li>
                          <li>• Totalmente editável após a seleção</li>
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

          {/* Etapa 2: Segmentação de Clientes (Simple & Advanced) */}
          {currentStep === 2 && newCampaign.campaignComplexity !== 'predefined' && (
            <div className="space-y-6 py-4">
              <SegmentationPicker
                selectedSegments={newCampaign.segmentations || []}
                stats={dynamicStats}
                availableGroups={availableGroups}
                selectedGroups={newCampaign.groups}
                onGroupsChange={(groups) => setNewCampaign({ ...newCampaign, groups })}
                selectedContactIds={newCampaign.specificContacts || []}
                onSpecificContactsChange={(specificContacts) => setNewCampaign({ ...newCampaign, specificContacts })}
                allContacts={contacts}
                onSegmentsChange={(segments) => {
                  setNewCampaign({ ...newCampaign, segmentations: segments });
                  setCurrentPage(1); // Reset pagination when segmentation changes
                }}
                onViewContact={setSelectedContactId}
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={
                    newCampaign.segmentations.length === 0 && 
                    newCampaign.groups.length === 0 && 
                    (!newCampaign.specificContacts || newCampaign.specificContacts.length === 0)
                  }
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 2: Seleção de Template (apenas para predefined) */}
          {currentStep === 2 && newCampaign.campaignComplexity === 'predefined' && (
            <div className="space-y-6 py-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Selecione um dos modelos abaixo para começar
                </p>
              </div>

              {isLoadingAdminTemplates ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-muted-foreground">Carregando modelos...</p>
                </div>
              ) : adminTemplates.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Library className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum modelo publicado no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className="p-4 hover:border-primary cursor-pointer transition-all hover:shadow-md group"
                      onClick={() => {
                        setNewCampaign({
                          ...newCampaign,
                          name: template.name,
                          workflow: template.workflow
                        });
                        handleNextStep();
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <Library className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{template.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {template.description || 'Sem descrição.'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-start">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 3: Segmentação de Clientes (apenas para predefined) */}
          {currentStep === 3 && newCampaign.campaignComplexity === 'predefined' && (
            <div className="space-y-6 py-4">
              <SegmentationPicker
                selectedSegments={newCampaign.segmentations || []}
                stats={dynamicStats}
                availableGroups={availableGroups}
                selectedGroups={newCampaign.groups}
                onGroupsChange={(groups) => setNewCampaign({ ...newCampaign, groups })}
                selectedContactIds={newCampaign.specificContacts || []}
                onSpecificContactsChange={(specificContacts) => setNewCampaign({ ...newCampaign, specificContacts })}
                allContacts={contacts}
                onSegmentsChange={(segments) => {
                  setNewCampaign({ ...newCampaign, segmentations: segments });
                  setCurrentPage(1); // Reset pagination when segmentation changes
                }}
                onViewContact={setSelectedContactId}
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={
                    newCampaign.segmentations.length === 0 && 
                    newCampaign.groups.length === 0 && 
                    (!newCampaign.specificContacts || newCampaign.specificContacts.length === 0)
                  }
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
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${newCampaign.channel === 'email' ? 'border-primary bg-primary/5' : ''
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
                    className={`p-6 cursor-pointer hover:border-primary transition-colors ${newCampaign.channel === 'sms' ? 'border-primary bg-primary/5' : ''
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

                  {(() => {
                    const isLoading = !subscriptionStats;
                    const hasWhatsappCredits = !isLoading && (
                      subscriptionStats.whatsappLimit === true || 
                      subscriptionStats.whatsappLimit === -1 || 
                      (Number(subscriptionStats.whatsappLimit) === -1) ||
                      (Number(subscriptionStats.whatsappLimit) - (subscriptionStats.whatsappSent || 0)) > 0
                    );

                    // Permite selecionar se tiver créditos, mesmo sem configurar (conforme solicitado pelo usuário)
                    const hasWhatsapp = hasWhatsappCredits;

                    return (
                      <Card
                        className={`p-6 transition-colors relative ${
                          isLoading 
                            ? 'opacity-50 cursor-wait'
                            : !hasWhatsapp
                              ? 'opacity-60 cursor-not-allowed border-dashed'
                              : 'cursor-pointer hover:border-primary ' + (newCampaign.channel === 'whatsapp' ? 'border-primary bg-primary/5' : '')
                        }`}
                        onClick={() => {
                          if (hasWhatsapp) {
                            setNewCampaign({ ...newCampaign, channel: 'whatsapp' });
                          }
                        }}
                      >
                        {subscriptionStats && !hasWhatsappCredits && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 rounded-lg z-10 p-4 font-bold">
                            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-center shadow-sm">
                              <p className="text-xs font-bold text-destructive flex items-center justify-center gap-1.5 mb-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> Sem Créditos de WhatsApp
                              </p>
                              <p className="text-[10px] text-muted-foreground mb-3 font-medium">Você atingiu o limite do seu plano.</p>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-7 text-[10px] font-bold px-4"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsBuyCreditsModalOpen(true);
                                }}
                              >
                                <Zap className="w-3 h-3 mr-1" /> Comprar Créditos
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {subscriptionStats && hasWhatsappCredits && !twilioConfigured && (
                          <div className="absolute top-2 right-2 z-10">
                            <Popover>
                              <PopoverTrigger asChild>
                                <div className="bg-orange-500 rounded-full p-1 cursor-help animate-pulse">
                                  <Settings className="w-3 h-3 text-white" />
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-3 translate-x-[-10px]">
                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-orange-600 flex items-center gap-1">
                                    <Settings className="w-3.5 h-3.5" /> Atenção: Não Configurado
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    Você pode preparar a campanha agora, mas o envio só funcionará após configurar sua conta Twilio.
                                  </p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full h-7 text-[10px] border-orange-200 text-orange-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/conexoes');
                                    }}
                                  >
                                    Configurar em Conexões
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
                        <p className="text-sm text-muted-foreground">
                          Mensagens via WhatsApp Business com suporte a mídia e botões interativos.
                        </p>
                        {subscriptionStats && subscriptionStats.whatsappLimit !== -1 && (
                          <p className="text-xs mt-2 font-medium text-green-700">
                            {subscriptionStats.whatsappLimit > 0
                                ? `✅ ${subscriptionStats.whatsappLimit.toLocaleString('pt-BR')} créditos disponíveis`
                                : '❌ Nenhum crédito disponível'}
                          </p>
                        )}
                      </div>
                    </div>
                      </Card>
                    );
                  })()}
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

                      <div className="space-y-4 rounded border p-4 bg-primary/5">
                        <div className="grid gap-2">
                          <Label htmlFor="twilio-content-sid">Template Aprovado (Content API)</Label>
                          <Select 
                            value={(newCampaign.email as any).contentSid || 'none'} 
                            onValueChange={(val) => {
                              const contentSid = val === 'none' ? undefined : val;
                              const tpl = twilioTemplates.find(t => t.sid === val);
                              let newVars: Record<string, string> = {};
                              let bodyText = newCampaign.email.content;

                              if (tpl && val !== 'none') {
                                // 1. Usar metadados de variáveis (mais confiável para todos os tipos)
                                if (tpl.variables && Object.keys(tpl.variables).length > 0) {
                                  Object.keys(tpl.variables).forEach(k => {
                                    newVars[k] = '';
                                  });
                                }

                                // 2. Tentar encontrar o body em qualquer um dos tipos (text, media, list-picker, etc)
                                const typeKeys = Object.keys(tpl.types || {});
                                for (const type of typeKeys) {
                                  const typeData = tpl.types[type];
                                  if (typeData.body) {
                                    bodyText = typeData.body;
                                    
                                    // Se variáveis não vierem preenchidas pelos metadados, tenta Regex no body
                                    if (Object.keys(newVars).length === 0) {
                                      const matches = bodyText.match(/{{[^{}]+}}/g);
                                      if (matches) {
                                        matches.forEach(match => {
                                          const varName = match.replace(/[{}]/g, '');
                                          newVars[varName] = '';
                                        });
                                      }
                                    }
                                    break;
                                  }
                                }
                              }
                              
                              setNewCampaign({
                                ...newCampaign,
                                email: {
                                  ...newCampaign.email,
                                  ...( { contentSid } as any ),
                                  ...({ templateVariables: newVars } as any),
                                  content: bodyText
                                }
                              });
                            }}
                          >
                            <SelectTrigger id="twilio-content-sid">
                              <SelectValue placeholder={isLoadingTemplates ? "Carregando templates..." : "Selecione um template..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingTemplates && <SelectItem value="loading" disabled>Carregando templates...</SelectItem>}
                              {twilioTemplates.map(t => {
                                const type = Object.keys(t.types || {})[0]?.split('/').pop() || 'unknown';
                                return (
                                  <SelectItem key={t.sid} value={t.sid}>
                                    <div className="flex items-center gap-2">
                                      <span>{t.friendlyName}</span>
                                      <span className={`text-[10px] px-1 rounded border font-mono ${
                                        type === 'list-picker' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                      }`}>
                                        {type.toUpperCase()}
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[12px] text-muted-foreground mr-4">
                              Selecione um modelo previamente aprovado na Meta para iniciar as conversas.
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-8 text-primary border-primary/30 hover:bg-primary/5 flex items-center justify-center white-space-nowrap"
                              onClick={() => setIsTemplateModalOpen(true)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Solicitar Novo Template
                            </Button>
                          </div>
                        </div>

                        {(newCampaign.email as any).contentSid && (
                          <div className="mt-4 space-y-4">
                            <div className="p-4 bg-muted/20 rounded-lg border border-primary/10">
                              <Label className="text-[10px] uppercase font-bold text-primary mb-2 block">Conteúdo do Modelo</Label>
                              <div className="text-sm p-3 bg-background rounded border whitespace-pre-wrap">
                                {newCampaign.email.content || 'O conteúdo será exibido aqui...'}
                              </div>
                            </div>
                          </div>
                        )}

                        {(newCampaign.email as any).contentSid && (() => {
                          const selectedWhatsappTemplate = twilioTemplates.find(t => t.sid === (newCampaign.email as any).contentSid);
                          const mediaVariables: string[] = [];
                          if (selectedWhatsappTemplate) {
                            Object.values(selectedWhatsappTemplate.types || {}).forEach((typeData: any) => {
                              if (typeData.media) {
                                // Pode ser string ou array de strings
                                const mediaFields = Array.isArray(typeData.media) ? typeData.media : [typeData.media];
                                mediaFields.forEach((field: any) => {
                                  if (typeof field === 'string') {
                                    const matches = field.match(/{{[^{}]+}}/g);
                                    if (matches) {
                                      matches.forEach(m => mediaVariables.push(m.replace(/[{}]/g, '')));
                                    }
                                  }
                                });
                              }
                            });
                          }

                          const listPickerData = selectedWhatsappTemplate?.types?.['twilio/list-picker'];
                          const variablesToShow = Object.keys((newCampaign.email as any).templateVariables || {}).filter(key => !mediaVariables.includes(key));

                          if (variablesToShow.length === 0 && !listPickerData) return null;

                          return (
                            <div className="space-y-3 pt-3 border-t border-primary/20">
                              <div className="flex items-center justify-between">
                                <Label className="font-semibold text-primary">Configurar Conteúdo do Template</Label>
                                <div className="flex gap-1">
                                  {[
                                    { label: 'Cupom', value: '{{cupom_nome}}' },
                                    { label: 'Valor', value: '{{cupom_valor}}' },
                                    { label: 'Validade', value: '{{cupom_validade}}' },
                                    { label: 'Link', value: '{{link_rastreio}}' },
                                    { label: 'Nome', value: '{{nome}}' }
                                  ].map(v => (
                                    <Badge 
                                      key={v.value} 
                                      variant="outline" 
                                      className="cursor-help text-[9px] px-1.5 py-0 hover:bg-primary/10 transition-colors"
                                      title={`Use ${v.value} para substituir pelo valor dinâmico`}
                                    >
                                      {v.label}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {variablesToShow.length > 0 && (
                                <div className="grid gap-3">
                                  {variablesToShow.map(key => (
                                    <div key={key} className="grid grid-cols-[80px_1fr] items-center gap-2 bg-background p-2 rounded border group">
                                      <Label className="text-xs font-mono text-muted-foreground bg-muted p-1 rounded text-center">
                                        {"{{" + key + "}}"}
                                      </Label>
                                      <div className="relative">
                                        <Input 
                                          value={(newCampaign.email as any).templateVariables[key] || ''}
                                          onChange={e => {
                                            const vars = { ...((newCampaign.email as any).templateVariables || {}) };
                                            vars[key] = e.target.value;
                                            setNewCampaign({
                                              ...newCampaign,
                                              email: {
                                                ...newCampaign.email,
                                                ...({ templateVariables: vars } as any)
                                              }
                                            });
                                          }}
                                          placeholder={`Ex: {{nome}} ou texto fixo`}
                                          className="h-8 text-sm pr-20"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {listPickerData && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                                  <Label className="text-[10px] uppercase font-bold text-amber-700 flex items-center gap-1">
                                    <Library className="w-3 h-3" /> Opções da Lista (Preview)
                                  </Label>
                                  <div className="space-y-1">
                                    {listPickerData.items?.map((item: any, idx: number) => (
                                      <div key={idx} className="text-xs p-2 bg-white rounded border border-amber-100 flex items-center justify-between">
                                        <span className="font-medium text-amber-900">{item.item}</span>
                                        {item.description && <span className="text-[10px] text-muted-foreground">{item.description}</span>}
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-[10px] text-amber-600 italic">
                                    Estas são as opções que aparecerão no menu para o cliente.
                                  </p>
                                </div>
                              )}

                              <p className="text-[10px] text-muted-foreground italic">
                                Dica: Você pode usar variáveis do sistema como <strong>{"{{cupom_nome}}"}</strong>, <strong>{"{{link_rastreio}}"}</strong> ou <strong>{"{{nome}}"}</strong>.
                              </p>
                            </div>
                          );
                        })()}

                        
                        {!(newCampaign.email as any).contentSid && (
                          <div className="grid gap-2 pt-2 border-t border-primary/10">
                            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                              ⚠️ <strong>Atenção:</strong> O envio de texto livre via Twilio só funciona caso a janela de 24 horas no WhatsApp já esteja aberta. Para campanhas (contato proativo fora da janela de 24h), é OBRIGATÓRIO usar um Template.
                            </p>
                          </div>
                        )}
                      </div>

                    <div className="grid gap-2">
                      <Label htmlFor="whatsapp-content">Mensagem WhatsApp {(newCampaign.email as any).contentSid ? '(Fallback)' : '*'}</Label>
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

                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-4">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Link de Redirecionamento</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp-dest-url" className="text-xs">URL de Destino</Label>
                        <Input
                          id="whatsapp-dest-url"
                          placeholder="https://seusite.com.br/promo"
                          value={newCampaign.tracking.destinationUrl}
                          onChange={(e) => setNewCampaign({
                            ...newCampaign,
                            tracking: { ...newCampaign.tracking, destinationUrl: e.target.value }
                          })}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          setNewCampaign({
                            ...newCampaign,
                            email: {
                              ...newCampaign.email,
                              content: newCampaign.email.content + ' {{link_rastreio}}'
                            }
                          });
                        }}
                      >
                        <Plus className="w-3 h-3 mr-2" />
                        Inserir Variável de Link
                      </Button>
                    </div>

                    {(() => {
                      const selectedWhatsappTemplate = twilioTemplates.find(t => t.sid === (newCampaign.email as any).contentSid);
                      const isWhatsappMediaTemplate = selectedWhatsappTemplate && Object.keys(selectedWhatsappTemplate.types || {}).some(type => type.toLowerCase().includes('media'));
                      
                      if (!isWhatsappMediaTemplate) return null;

                      return (
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
                      );
                    })()}

                  </div>

                  {/* WhatsApp Preview */}
                  <div className="flex-1 space-y-4">
                    <WhatsappPreview
                      content={newCampaign.email.content}
                      media={newCampaign.email.media}
                    />
                    <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                      💡 <strong>Dica:</strong> Você pode usar as variáveis <strong>{"{{cupom_nome}}"}</strong>, <strong>{"{{cupom_valor}}"}</strong> e <strong>{"{{cupom_validade}}"}</strong> no texto. Elas serão substituídas automaticamente pelos dados do cupom/giftback selecionado no passo seguinte.
                    </p>
                  </div>
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
                        <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                          💡 <strong>Variáveis disponíveis:</strong> <code>{"{{cupom_nome}}"}</code>, <code>{"{{cupom_valor}}"}</code> e <code>{"{{cupom_validade}}"}</code>. Use-as para personalizar sua mensagem com os dados do benefício que será configurado adiante.
                        </p>
                      </div>

                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-4">
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Link de Redirecionamento</span>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email-dest-url" className="text-xs">URL de Destino</Label>
                          <Input
                            id="email-dest-url"
                            placeholder="https://seusite.com.br/promo"
                            value={newCampaign.tracking.destinationUrl}
                            onChange={(e) => setNewCampaign({
                              ...newCampaign,
                              tracking: { ...newCampaign.tracking, destinationUrl: e.target.value }
                            })}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setNewCampaign({
                              ...newCampaign,
                              email: {
                                ...newCampaign.email,
                                content: newCampaign.email.content + ' {{link_rastreio}}'
                              }
                            });
                          }}
                        >
                          <Plus className="w-3 h-3 mr-2" />
                          Inserir Variável de Link
                        </Button>
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
                        <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10 mt-2">
                          💡 <strong>Variáveis:</strong> <code>{"{{cupom_nome}}"}</code>, <code>{"{{cupom_valor}}"}</code> e <code>{"{{cupom_validade}}"}</code>. <br />
                          Caso não utilize as variáveis, os dados do cupom serão adicionados automaticamente ao final do SMS.
                        </p>
                      </div>

                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Link de Redirecionamento</span>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sms-dest-url" className="text-xs">URL de Destino</Label>
                          <Input
                            id="sms-dest-url"
                            placeholder="https://seusite.com.br/promo"
                            value={newCampaign.tracking.destinationUrl}
                            onChange={(e) => setNewCampaign({
                              ...newCampaign,
                              tracking: { ...newCampaign.tracking, destinationUrl: e.target.value }
                            })}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setNewCampaign({
                              ...newCampaign,
                              email: {
                                ...newCampaign.email,
                                content: newCampaign.email.content + ' {{link_rastreio}}'
                              }
                            });
                          }}
                        >
                          <Plus className="w-3 h-3 mr-2" />
                          Inserir Variável de Link
                        </Button>
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
                      : newCampaign.channel === 'whatsapp'
                        ? !(newCampaign.email as any).contentSid
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

          {/* Workflow Step (advanced or predefined) */}
          {((newCampaign.campaignComplexity === 'advanced' && currentStep === 4) || (newCampaign.campaignComplexity === 'predefined' && currentStep === 4)) && (
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
                twilioConfigured={twilioConfigured}
                whatsappLimit={subscriptionStats?.whatsappLimit}
                whatsappSent={subscriptionStats?.whatsappSent}
                onBuyCredits={() => setIsBuyCreditsModalOpen(true)}
                onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
              />

              {/* Resumo da Campanha - Só mostra se houver pelo menos um nó de disparo */}
              {(() => {
                const emailNodesCount = newCampaign.workflow?.nodes?.filter((n: any) => n.type === 'email').length || 0;
                const smsNodesCount = newCampaign.workflow?.nodes?.filter((n: any) => n.type === 'sms').length || 0;
                const whatsappNodesCount = newCampaign.workflow?.nodes?.filter((n: any) => n.type === 'whatsapp').length || 0;
                const hasDispatchNodes = emailNodesCount > 0 || smsNodesCount > 0 || whatsappNodesCount > 0;

                if (!hasDispatchNodes) return null;

                // Fallback para exibir pelo menos algum número se o filtro local falhar mas houver stats
                const hasSelection = newCampaign.groups.length > 0 || newCampaign.segmentations.length > 0 || newCampaign.specificContacts.length > 0;
                const totalContacts = filteredContacts.length;

                return (
                  <div className="space-y-4 mt-6">
                    {!hasSelection && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-yellow-700 font-medium">
                          <strong>Atenção:</strong> Você ainda não selecionou um público-alvo na Etapa 2. Os números abaixo refletem 0 contatos.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="p-4 border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="text-sm font-medium text-muted-foreground">Contatos impactados</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {totalContacts.toLocaleString('pt-BR')}
                        </p>
                      </Card>

                      <Card className="p-4 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-medium text-muted-foreground">E-mails a enviar</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-foreground">
                            {(totalContacts * emailNodesCount).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-blue-600/80 font-medium">
                            LIMITE: {subscriptionStats ? (subscriptionStats.emailsLimit - subscriptionStats.emailsSent).toLocaleString('pt-BR') : '...'}
                          </p>
                        </div>
                      </Card>

                      <Card className="p-4 border-green-500/20 bg-green-500/5">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-muted-foreground">SMS a enviar</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-foreground">
                            {(totalContacts * smsNodesCount).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-green-600/80 font-medium">
                            LIMITE: {subscriptionStats ? (subscriptionStats.smsLimit - subscriptionStats.smsSent).toLocaleString('pt-BR') : '...'}
                          </p>
                        </div>
                      </Card>

                      <Card className="p-4 border-indigo-500/20 bg-indigo-500/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-5 h-5 text-indigo-500" />
                          <span className="text-sm font-medium text-muted-foreground">WhatsApp a enviar</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-foreground">
                            {(totalContacts * whatsappNodesCount).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-indigo-600/80 font-medium">
                            LIMITE: {subscriptionStats ? (subscriptionStats.whatsappLimit - (subscriptionStats.whatsappSent || 0)).toLocaleString('pt-BR') : '...'}
                          </p>
                        </div>
                      </Card>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleCreateCampaign}
                >
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
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-700">
                    ℹ️ <strong>Informação:</strong> Se você não utilizou as variáveis no texto da mensagem no passo anterior, o sistema adicionará automaticamente os detalhes do benefício ao final da mensagem.
                  </p>
                </div>
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
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable-shipping"
                      checked={newCampaign.campaignConfig.enableShippingCoupon}
                      onCheckedChange={(checked) => setNewCampaign({
                        ...newCampaign,
                        campaignConfig: {
                          ...newCampaign.campaignConfig,
                          enableShippingCoupon: checked as boolean
                        }
                      })}
                    />
                    <label htmlFor="enable-shipping" className="text-sm font-medium cursor-pointer">
                      Frete Grátis
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
                    {/* Nome do Cupom */}
                    <div className="grid gap-2">
                      <Label htmlFor="simple-coupon-name">Nome do Cupom *</Label>
                      <Input
                        id="simple-coupon-name"
                        value={newCampaign.campaignConfig.coupon.couponName}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          campaignConfig: {
                            ...newCampaign.campaignConfig,
                            coupon: {
                              ...newCampaign.campaignConfig.coupon,
                              couponName: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: PROMO10"
                      />
                    </div>
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
                    {/* Nome do Giftback */}
                    <div className="grid gap-2">
                      <Label htmlFor="simple-giftback-name">Nome do Giftback *</Label>
                      <Input
                        id="simple-giftback-name"
                        value={newCampaign.campaignConfig.giftback.couponName}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          campaignConfig: {
                            ...newCampaign.campaignConfig,
                            giftback: {
                              ...newCampaign.campaignConfig.giftback,
                              couponName: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: CASH20"
                      />
                    </div>
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

              {/* Frete Grátis */}
              {newCampaign.campaignConfig.enableShippingCoupon && (
                <Card className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Frete Grátis</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure o cupom de frete grátis
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="shipping-code">Prefixo/Código do Cupom</Label>
                      <Input
                        id="shipping-code"
                        value={newCampaign.campaignConfig.shippingCoupon?.code || ''}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          campaignConfig: {
                            ...newCampaign.campaignConfig,
                            shippingCoupon: {
                              ...(newCampaign.campaignConfig.shippingCoupon || {
                                minPurchaseValue: '',
                                expirationDays: '30'
                              }),
                              code: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: FRETEGRATIS"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="shipping-min-purchase">Valor Mínimo de Compra (R$)</Label>
                      <Input
                        id="shipping-min-purchase"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ex: 100.00"
                        value={newCampaign.campaignConfig.shippingCoupon?.minPurchaseValue || ''}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          campaignConfig: {
                            ...newCampaign.campaignConfig,
                            shippingCoupon: {
                              ...(newCampaign.campaignConfig.shippingCoupon || {
                                code: '',
                                expirationDays: '30'
                              }),
                              minPurchaseValue: e.target.value
                            }
                          }
                        })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="shipping-expiration">Dias para Expirar</Label>
                      <Input
                        id="shipping-expiration"
                        type="number"
                        min="1"
                        placeholder="Ex: 30"
                        value={newCampaign.campaignConfig.shippingCoupon?.expirationDays || '30'}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          campaignConfig: {
                            ...newCampaign.campaignConfig,
                            shippingCoupon: {
                              ...(newCampaign.campaignConfig.shippingCoupon || {
                                code: '',
                                minPurchaseValue: ''
                              }),
                              expirationDays: e.target.value
                            }
                          }
                        })}
                      />
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
                    {filteredContacts.length.toLocaleString('pt-BR')}
                  </p>
                </Card>

                <Card className="p-4 border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-muted-foreground">Envios a serem feitos</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredContacts.length.toLocaleString('pt-BR')}
                  </p>
                </Card>

                {(() => {
                  const channel = newCampaign.channel;
                  let remaining = 0;
                  let isWhatsapp = channel === 'whatsapp';

                  if (subscriptionStats) {
                    if (channel === 'email') remaining = Math.max(0, subscriptionStats.emailsLimit - subscriptionStats.emailsSent);
                    else if (channel === 'sms') remaining = Math.max(0, subscriptionStats.smsLimit - subscriptionStats.smsSent);
                    else if (channel === 'whatsapp') remaining = Math.max(0, subscriptionStats.whatsappLimit - (subscriptionStats.whatsappSent || 0));
                  }

                  const willExceed = subscriptionStats && filteredContacts.length > remaining;

                  return (
                    <Card className={`p-4 ${
                      isWhatsapp && willExceed
                        ? 'border-destructive/50 bg-destructive/5'
                        : 'border-green-500/20 bg-green-500/5'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className={`w-5 h-5 ${isWhatsapp && willExceed ? 'text-destructive' : 'text-green-500'}`} />
                        <span className="text-sm font-medium text-muted-foreground">
                          {isWhatsapp ? 'Créditos WhatsApp restantes' : 'Envios restantes'}
                        </span>
                      </div>
                      <p className={`text-2xl font-bold ${
                        isWhatsapp && willExceed ? 'text-destructive' : 'text-foreground'
                      }`}>
                        {subscriptionStats ? remaining.toLocaleString('pt-BR') : '...'}
                      </p>
                      {isWhatsapp && subscriptionStats && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          Serão consumidos: <strong>{Math.min(filteredContacts.length, remaining).toLocaleString('pt-BR')}</strong>
                        </p>
                      )}
                    </Card>
                  );
                })()}
              </div>

              {/* Warning: insufficient WhatsApp credits */}
              {newCampaign.channel === 'whatsapp' && subscriptionStats && (
                subscriptionStats.whatsappLimit === 0 ? (
                  <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4 mt-4">
                    <MessageSquare className="w-5 h-5 text-destructive flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-destructive">Sem créditos WhatsApp</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Você não possui créditos WhatsApp disponíveis. Compre um pacote adicional antes de criar a campanha.</p>
                    </div>
                  </div>
                ) : filteredContacts.length > (subscriptionStats.whatsappLimit - (subscriptionStats.whatsappSent || 0)) ? (
                  <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
                    <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-amber-700">⚠️ Créditos insuficientes</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Você tem {Math.max(0, subscriptionStats.whatsappLimit - (subscriptionStats.whatsappSent || 0)).toLocaleString('pt-BR')} créditos, mas a campanha precisa de {filteredContacts.length.toLocaleString('pt-BR')}. Apenas os primeiros {Math.max(0, subscriptionStats.whatsappLimit - (subscriptionStats.whatsappSent || 0)).toLocaleString('pt-BR')} serão enviados.
                      </p>
                    </div>
                  </div>
                ) : null
              )}

              <div className="grid gap-4 mt-6">
                <Label>Quando enviar a campanha?</Label>

                <Card
                  className={`p-4 cursor-pointer hover:border-primary transition-colors ${newCampaign.scheduleType === 'now' ? 'border-primary bg-primary/5' : ''
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
                  className={`p-4 cursor-pointer hover:border-primary transition-colors ${newCampaign.scheduleType === 'schedule' ? 'border-primary bg-primary/5' : ''
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
            <DialogDescription className="sr-only">
              Escolha o formato de arquivo desejado para exportar os dados das suas campanhas.
            </DialogDescription>
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
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Dados incluídos:</strong> Nome da campanha, canais, status,
                destinatários, métricas de envio, recebidos e cliques.
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

      {/* Modal Relatório */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório da Campanha: {selectedCampaign?.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Visualização detalhada das métricas de desempenho da campanha selecionada.
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Enviados</span>
                    <span className="text-2xl font-bold">{(selectedCampaign.sentCount || 0).toLocaleString()}</span>
                    <div className="mt-2 text-xs text-muted-foreground">Total de envios realizados</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Recebidos</span>
                    <span className="text-2xl font-bold text-blue-500">
                      {(selectedCampaign.deliveredCount || 0).toLocaleString()}
                    </span>
                    <div className="mt-2 text-xs text-muted-foreground">Total de mensagens entregues</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Taxa de Cliques</span>
                    <span className="text-2xl font-bold text-green-500">
                      {selectedCampaign.deliveredCount > 0
                        ? ((selectedCampaign.clicksCount / selectedCampaign.deliveredCount) * 100).toFixed(1)
                        : 0}%
                    </span>
                    <div className="mt-2 text-xs text-muted-foreground">{(selectedCampaign.clicksCount || 0).toLocaleString()} cliques</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Receita Gerada</span>
                    <span className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(Number(selectedCampaign.revenue || 0))}
                    </span>
                    <div className="mt-2 text-xs text-muted-foreground">
                      ROI: {selectedCampaign.sentCount > 0 ? (Number(selectedCampaign.revenue || 0) / selectedCampaign.sentCount).toFixed(2) : 0} / envio
                    </div>
                  </div>
                </Card>
              </div>

              {/* Detalhes e Gráficos poderiam ser adicionados aqui */}
              <div className="bg-muted/50 p-6 rounded-lg text-center">
                <BarChart2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium text-muted-foreground">Gráficos detalhados em breve</h3>
                <p className="text-sm text-muted-foreground">
                  Estamos trabalhando para trazer análises mais profundas sobre o desempenho da sua campanha.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIsReportOpen(false)}>Fechar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Alteração de Status */}
      <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Alterar Status da Campanha</DialogTitle>
            <DialogDescription className="sr-only">
              Confirme a alteração de status (pausar ou reativar) para a campanha selecionada.
            </DialogDescription>
          </DialogHeader>
          {campaignForStatusUpdate && (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Status Atual:</span>
                <Badge variant={getStatusVariant(campaignForStatusUpdate.status)}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(campaignForStatusUpdate.status)}`}></div>
                  {campaignForStatusUpdate.status.charAt(0).toUpperCase() + campaignForStatusUpdate.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Deseja {campaignForStatusUpdate.status === 'ativa' ? 'pausar' : 'reativar'} a campanha <strong>{campaignForStatusUpdate.name}</strong>?
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {campaignForStatusUpdate.status === 'ativa' && (
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={() => {
                      handleToggleStatus(campaignForStatusUpdate.id, 'ativa');
                      setIsStatusUpdateOpen(false);
                    }}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar Campanha
                  </Button>
                )}
                {campaignForStatusUpdate.status === 'pausada' && (
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    disabled={
                      !twilioConfigured &&
                      (
                        campaignForStatusUpdate.channel === 'whatsapp' ||
                        campaignForStatusUpdate.config?.workflow?.nodes?.some((node: any) => node?.type === 'whatsapp')
                      )
                    }
                    onClick={() => {
                      handleToggleStatus(campaignForStatusUpdate.id, 'pausada');
                      setIsStatusUpdateOpen(false);
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Reativar Campanha
                  </Button>
                )}
                {campaignForStatusUpdate.status === 'pausada' &&
                  !twilioConfigured &&
                  (
                    campaignForStatusUpdate.channel === 'whatsapp' ||
                    campaignForStatusUpdate.config?.workflow?.nodes?.some((node: any) => node?.type === 'whatsapp')
                  ) && (
                    <p className="text-xs text-destructive text-center">
                      Configure a Twilio em Conexões para reativar esta campanha.
                    </p>
                  )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsStatusUpdateOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ContactDetailsModal
        isOpen={selectedContactId !== null}
        onClose={() => setSelectedContactId(null)}
        contactId={selectedContactId}
        contacts={contacts as any}
        contactPurchases={contactPurchases as any}
        scoreConfig={scoreConfig}
      />

      <TemplateRequestModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSuccess={() => {
          loadExternalData();
        }}
      />

      <BuyCreditsModal
        isOpen={isBuyCreditsModalOpen}
        onClose={() => setIsBuyCreditsModalOpen(false)}
        onSuccess={() => {
          loadExternalData();
        }}
      />

    </Layout >
  );
}