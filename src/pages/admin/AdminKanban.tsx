import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Plus, GripVertical, Pencil, Trash2, Zap, User as UserIcon, Mail, Phone, Users, Send } from 'lucide-react';
import { api, Campaign, Contact, Group, KanbanColumnDto, KanbanCardDto, KanbanCondition, KanbanEntryType, SegmentationParam } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ContactDetailsModal } from '@/components/contacts/ContactDetailsModal';
import { useScoreConfig } from '@/hooks/use-score-config';
import { useSegmentationStats } from '@/hooks/use-segmentation-stats';
import { SegmentationPicker } from '@/components/campaigns/SegmentationPicker';

const ENTRY_TYPE_LABELS: Record<KanbanEntryType, string> = {
    capture_page: 'Página de captura',
    form: 'Formulário',
    product_purchase: 'Compra de produto',
    ecommerce_event: 'Evento e-commerce',
    manual: 'Manual',
};

const CONDITION_TYPE_LABELS: Record<KanbanCondition['type'], string> = {
    has_purchased_product: 'Comprou produto (ID)',
    has_tag: 'Possui tag (ID)',
    has_segmentation: 'Possui segmentação',
    min_order_count: 'Nº mínimo de pedidos',
    min_ltv: 'LTV mínimo (R$)',
};

// Status de campanha que aceitam adição de contatos via gatilho do Kanban
const TRIGGERABLE_STATUSES = ['ativa', 'finalizada', 'agendada'];

interface ColumnFormState {
    name: string;
    description: string;
    isOrigin: boolean;
    entryType: KanbanEntryType | '';
    campaignId: string;
    conditions: KanbanCondition[];
}

interface CardFormState {
    columnId: number;
    title: string;
    description: string;
    contactIds: Set<number>;
    groupIds: Set<number>;
    segmentations: (string | SegmentationParam)[];
    campaignId: string;
}

const defaultColumnForm = (): ColumnFormState => ({
    name: '',
    description: '',
    isOrigin: false,
    entryType: '',
    campaignId: '',
    conditions: [],
});

const defaultCardForm = (columnId = 0): CardFormState => ({
    columnId,
    title: '',
    description: '',
    contactIds: new Set(),
    groupIds: new Set(),
    segmentations: [],
    campaignId: '',
});

interface AdminKanbanProps {
    layout?: 'admin' | 'app';
}

export default function AdminKanban({ layout = 'admin' }: AdminKanbanProps = {}) {
    const PageLayout = layout === 'admin' ? AdminLayout : Layout;
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { config: scoreConfig } = useScoreConfig();

    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<KanbanColumnDto | null>(null);
    const [columnForm, setColumnForm] = useState<ColumnFormState>(defaultColumnForm());
    const [newCondition, setNewCondition] = useState<{ type: KanbanCondition['type']; value: string }>({
        type: 'has_purchased_product',
        value: '',
    });

    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<KanbanCardDto | null>(null);
    const [cardForm, setCardForm] = useState<CardFormState>(defaultCardForm());
    const [selectedProfileContactId, setSelectedProfileContactId] = useState<number | null>(null);

    const [columnToDelete, setColumnToDelete] = useState<KanbanColumnDto | null>(null);
    const [cardToDelete, setCardToDelete] = useState<KanbanCardDto | null>(null);

    const [draggedCardId, setDraggedCardId] = useState<number | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = useState<number | null>(null);

    // Adicionar contatos/grupos a uma campanha manualmente
    const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
    const [addCampaignId, setAddCampaignId] = useState('');
    const [addTab, setAddTab] = useState<'contacts' | 'groups'>('contacts');
    const [selectedContactIds, setSelectedContactIds] = useState<Set<number>>(new Set());
    const [selectedGroupIds, setSelectedGroupIds] = useState<Set<number>>(new Set());

    // --- Queries ---

    const { data: columnsData, isLoading: isLoadingColumns, isError, error } = useQuery({
        queryKey: ['kanban-columns'],
        queryFn: async () => {
            const response = await api.getKanbanColumns();
            return response?.columns ?? [];
        },
    });

    const { data: cardsData, isLoading: isLoadingCards } = useQuery({
        queryKey: ['kanban-cards'],
        queryFn: async () => {
            const response = await api.getKanbanCards();
            return response?.cards ?? [];
        },
    });

    const { data: campaignsData } = useQuery({
        queryKey: ['campaigns-for-kanban'],
        queryFn: () => api.getCampaigns({}),
        staleTime: 60_000,
    });

    const { data: contactsData } = useQuery({
        queryKey: ['contacts-for-kanban'],
        queryFn: () => api.getContacts(),
        staleTime: 60_000,
    });

    const { data: groupsData } = useQuery({
        queryKey: ['groups-for-kanban'],
        queryFn: () => api.getGroups(),
        staleTime: 60_000,
    });

    const { data: contactPurchasesData } = useQuery({
        queryKey: ['contact-purchases-for-kanban'],
        queryFn: () => api.getContactPurchases(),
        staleTime: 60_000,
    });

    const campaigns: Campaign[] = campaignsData ?? [];
    const contactsList: Contact[] = contactsData ?? [];
    const groupsList: Group[] = groupsData ?? [];
    const columns: KanbanColumnDto[] = columnsData ?? [];
    const contactPurchases = (contactPurchasesData ?? []).reduce<Record<number, { purchases: any[]; ltv: number }>>((acc, purchase: any) => {
        if (!purchase.contactId) return acc;
        if (!acc[purchase.contactId]) acc[purchase.contactId] = { purchases: [], ltv: 0 };
        const value = Number(purchase.value ?? purchase.totalValue ?? 0);
        acc[purchase.contactId].purchases.push({
            id: purchase.id,
            date: purchase.purchaseDate ?? purchase.createdAt,
            value,
            product: purchase.productName ?? purchase.product?.name ?? 'Compra',
        });
        acc[purchase.contactId].ltv += value;
        return acc;
    }, {});

    const contactsForDetails = contactsList.map((contact) => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone ?? '',
        email: contact.email ?? '',
        group: contact.group?.name ?? groupsList.find((g) => g.id === contact.groupId)?.name ?? '',
        status: contact.status ?? '',
        tags: contact.contactTags?.map((ct) => ct.tag?.name).filter(Boolean) ?? [],
        state: contact.state ?? '',
        city: contact.city ?? '',
        birthDate: contact.birthDate ?? '',
        gender: contact.gender ?? '',
        segmentations: contact.contactSegmentations?.map((cs) => cs.segmentationId).filter(Boolean) ?? [],
        lastInteraction: contact.updatedAt ?? contact.createdAt,
        sales: contact.sales ?? [],
    }));
    const segmentationStats = useSegmentationStats(contactsList, contactPurchases, cardForm.segmentations);

    const cardsByColumn: Record<number, KanbanCardDto[]> = {};
    (cardsData ?? []).forEach((card) => {
        if (!cardsByColumn[card.columnId]) cardsByColumn[card.columnId] = [];
        cardsByColumn[card.columnId].push(card);
    });
    Object.keys(cardsByColumn).forEach((key) => {
        cardsByColumn[Number(key)].sort((a, b) => a.order - b.order);
    });

    // --- Mutations ---

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['kanban-columns'] });
        queryClient.invalidateQueries({ queryKey: ['kanban-cards'] });
    };

    const buildColumnPayload = (form: ColumnFormState) => ({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        isOrigin: form.isOrigin,
        entryType: (form.entryType || undefined) as KanbanEntryType | undefined,
        campaignId: form.campaignId ? parseInt(form.campaignId) : undefined,
        conditions: form.conditions.length > 0 ? form.conditions : undefined,
    });

    const createColumnMutation = useMutation({
        mutationFn: (form: ColumnFormState) => api.createKanbanColumn(buildColumnPayload(form)),
        onSuccess: () => {
            invalidate();
            setIsColumnModalOpen(false);
            setColumnForm(defaultColumnForm());
            toast({ title: 'Coluna criada' });
        },
        onError: (err: any) => toast({ title: 'Erro ao criar coluna', description: err.message, variant: 'destructive' }),
    });

    const updateColumnMutation = useMutation({
        mutationFn: ({ columnId, form }: { columnId: number; form: ColumnFormState }) =>
            api.updateKanbanColumn(columnId, buildColumnPayload(form)),
        onSuccess: () => {
            invalidate();
            setIsColumnModalOpen(false);
            setEditingColumn(null);
            setColumnForm(defaultColumnForm());
            toast({ title: 'Coluna atualizada' });
        },
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const deleteColumnMutation = useMutation({
        mutationFn: (columnId: number) => api.deleteKanbanColumn(columnId),
        onSuccess: () => {
            invalidate();
            setColumnToDelete(null);
            toast({ title: 'Coluna removida' });
        },
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const hasAudienceSelection = (form = cardForm) =>
        form.contactIds.size > 0 || form.groupIds.size > 0 || form.segmentations.length > 0;

    const getCardSelectedContacts = async (form = cardForm) => {
        const uniqueById = new Map<number, Contact>();

        if (form.segmentations.length > 0 || form.groupIds.size > 0) {
            const segmentContacts = await api.getContactsBySegments(form.segmentations, Array.from(form.groupIds));
            segmentContacts.forEach((contact) => uniqueById.set(contact.id, contact));
        }

        contactsList
            .filter((contact) => form.contactIds.has(contact.id))
            .forEach((contact) => uniqueById.set(contact.id, contact));

        return Array.from(uniqueById.values());
    };

    const createCardMutation = useMutation({
        mutationFn: async ({ form, card }: { form: CardFormState; card?: KanbanCardDto | null }) => {
            const selectedContacts = await getCardSelectedContacts(form);
            const campaign = campaigns.find((c) => String(c.id) === form.campaignId);
            const description = form.description.trim() || undefined;
            const customTitle = form.title.trim();
            const firstContact = selectedContacts[0];

            if (!card && selectedContacts.length === 0) {
                throw new Error('Selecione ao menos um contato, grupo ou segmentação.');
            }

            if (card) {
                const updatedCard = await api.updateKanbanCard(card.id, {
                    columnId: form.columnId,
                    title: customTitle || firstContact?.name || card.title,
                    description,
                    contactId: firstContact?.id ?? card.contactId ?? null,
                    metadata: {
                        ...(card.metadata ?? {}),
                        campaignId: campaign?.id,
                        campaignName: campaign?.name,
                        selectedSegmentations: form.segmentations,
                        selectedGroups: Array.from(form.groupIds),
                        selectedContacts: Array.from(form.contactIds),
                    },
                });

                const additionalContacts = selectedContacts.slice(1);
                const additionalCards = await Promise.all(additionalContacts.map((contact) => api.createKanbanCard({
                    columnId: form.columnId,
                    title: customTitle || contact.name,
                    description,
                    contactId: contact.id,
                    metadata: {
                        campaignId: campaign?.id,
                        campaignName: campaign?.name,
                        selectedSegmentations: form.segmentations,
                        selectedGroups: Array.from(form.groupIds),
                        selectedContacts: Array.from(form.contactIds),
                        createdFrom: 'kanban_card_edit',
                    },
                })));

                if (campaign && selectedContacts.length > 0) {
                    await api.addContactsToCampaign(campaign.id, selectedContacts.map((contact) => contact.id));
                }

                return [updatedCard, ...additionalCards];
            }

            const createdCards = await Promise.all(selectedContacts.map((contact) => api.createKanbanCard({
                columnId: form.columnId,
                title: customTitle || contact.name,
                description,
                contactId: contact.id,
                metadata: {
                    campaignId: campaign?.id,
                    campaignName: campaign?.name,
                    selectedSegmentations: form.segmentations,
                    selectedGroups: Array.from(form.groupIds),
                    selectedContacts: Array.from(form.contactIds),
                    createdFrom: 'kanban_audience_selection',
                },
            })));

            if (campaign) {
                await api.addContactsToCampaign(campaign.id, selectedContacts.map((contact) => contact.id));
            }

            return createdCards;
        },
        onSuccess: (_res, variables) => {
            invalidate();
            setIsCardModalOpen(false);
            setEditingCard(null);
            setCardForm(defaultCardForm());
            toast({
                title: variables.card ? 'Card atualizado' : 'Card criado',
                description: variables.form.campaignId
                    ? 'Contatos adicionados ao Kanban e encaminhados para a campanha.'
                    : 'Card atualizado no Kanban.',
            });
        },
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const deleteCardMutation = useMutation({
        mutationFn: (cardId: number) => api.deleteKanbanCard(cardId),
        onSuccess: () => {
            invalidate();
            setCardToDelete(null);
            setEditingCard(null);
            toast({ title: 'Card removido' });
        },
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const moveCardMutation = useMutation({
        mutationFn: ({ cardId, toColumnId, order }: { cardId: number; toColumnId: number; order?: number }) =>
            api.moveKanbanCard(cardId, toColumnId, order),
        onSuccess: () => invalidate(),
        onError: (err: any) => toast({ title: 'Erro ao mover card', description: err.message, variant: 'destructive' }),
    });

    const addToCampaignMutation = useMutation({
        mutationFn: async () => {
            const id = parseInt(addCampaignId);
            if (addTab === 'contacts') {
                return api.addContactsToCampaign(id, Array.from(selectedContactIds));
            }
            return api.addGroupsToCampaign(id, Array.from(selectedGroupIds));
        },
        onSuccess: (res: any) => {
            setIsAddCampaignOpen(false);
            setSelectedContactIds(new Set());
            setSelectedGroupIds(new Set());
            setAddCampaignId('');
            toast({ title: 'Adicionado à campanha', description: res?.message });
        },
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const toggleId = (set: Set<number>, setter: (s: Set<number>) => void, id: number) => {
        const next = new Set(set);
        next.has(id) ? next.delete(id) : next.add(id);
        setter(next);
    };

    const handleSubmitAddCampaign = () => {
        if (!addCampaignId) { toast({ title: 'Selecione a campanha', variant: 'destructive' }); return; }
        const count = addTab === 'contacts' ? selectedContactIds.size : selectedGroupIds.size;
        if (count === 0) { toast({ title: 'Selecione ao menos um item', variant: 'destructive' }); return; }
        addToCampaignMutation.mutate();
    };

    // --- Handlers ---

    const handleOpenCreateColumn = () => {
        setEditingColumn(null);
        setColumnForm(defaultColumnForm());
        setIsColumnModalOpen(true);
    };

    const handleOpenEditColumn = (column: KanbanColumnDto) => {
        setEditingColumn(column);
        setColumnForm({
            name: column.name,
            description: column.description ?? '',
            isOrigin: column.isOrigin,
            entryType: column.entryType ?? '',
            campaignId: column.campaignId ? String(column.campaignId) : '',
            conditions: column.conditions ?? [],
        });
        setIsColumnModalOpen(true);
    };

    const handleSubmitColumn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!columnForm.name.trim()) {
            toast({ title: 'Nome obrigatório', variant: 'destructive' });
            return;
        }
        if (editingColumn) {
            updateColumnMutation.mutate({ columnId: editingColumn.id, form: columnForm });
        } else {
            createColumnMutation.mutate(columnForm);
        }
    };

    const handleAddCondition = () => {
        if (!newCondition.value.trim()) return;
        setColumnForm((f) => ({
            ...f,
            conditions: [...f.conditions, { type: newCondition.type, value: newCondition.value }],
        }));
        setNewCondition({ type: 'has_purchased_product', value: '' });
    };

    const handleRemoveCondition = (index: number) => {
        setColumnForm((f) => ({ ...f, conditions: f.conditions.filter((_, i) => i !== index) }));
    };

    const handleOpenCreateCard = (columnId: number) => {
        setEditingCard(null);
        setCardForm(defaultCardForm(columnId));
        setIsCardModalOpen(true);
    };

    const handleOpenEditCard = (card: KanbanCardDto) => {
        setEditingCard(card);
        setCardForm({
            ...defaultCardForm(card.columnId),
            title: card.title,
            description: card.description || '',
            contactIds: new Set([
                ...(card.contactId ? [card.contactId] : []),
                ...((card.metadata?.selectedContacts as number[] | undefined) ?? []),
            ]),
            groupIds: new Set((card.metadata?.selectedGroups as number[] | undefined) ?? []),
            segmentations: (card.metadata?.selectedSegmentations as (string | SegmentationParam)[] | undefined) ?? [],
            campaignId: card.metadata?.campaignId ? String(card.metadata.campaignId) : '',
        });
        setIsCardModalOpen(true);
    };

    const handleSubmitCard = (e: React.FormEvent) => {
        e.preventDefault();

        if (!cardForm.columnId) {
            toast({ title: 'Selecione a coluna', variant: 'destructive' });
            return;
        }

        if (!editingCard) {
            if (!cardForm.campaignId) {
                toast({ title: 'Selecione a campanha', variant: 'destructive' });
                return;
            }

            if (!hasAudienceSelection()) {
                toast({ title: 'Selecione ao menos um contato, grupo ou segmentação', variant: 'destructive' });
                return;
            }
        }

        createCardMutation.mutate({ form: cardForm, card: editingCard });
    };

    const handleOpenContactProfile = (contactId?: number | null) => {
        if (!contactId) return;
        setSelectedProfileContactId(contactId);
    };

    const handleDragStart = (e: React.DragEvent, card: KanbanCardDto) => {
        setDraggedCardId(card.id);
        e.dataTransfer.setData('application/json', JSON.stringify({ cardId: card.id, sourceColumnId: card.columnId }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, columnId: number) => {
        e.preventDefault();
        setDragOverColumnId(columnId);
    };

    const handleDrop = (e: React.DragEvent, targetColumnId: number) => {
        e.preventDefault();
        setDragOverColumnId(null);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json')) as { cardId: number; sourceColumnId: number };
            if (data.cardId && data.sourceColumnId !== targetColumnId) {
                const newOrder = (cardsByColumn[targetColumnId] ?? []).length;
                moveCardMutation.mutate({ cardId: data.cardId, toColumnId: targetColumnId, order: newOrder });
            }
        } catch { /* ignore */ }
        setDraggedCardId(null);
    };

    // --- Render ---

    if (isLoadingColumns || isLoadingCards) {
        return (
            <PageLayout title="Kanban" subtitle="Carregando quadro...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            </PageLayout>
        );
    }

    if (isError) {
        return (
            <PageLayout title="Kanban" subtitle="Erro ao carregar">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-red-500 mb-2">Erro ao carregar dados</h3>
                        <p className="text-sm text-slate-400">{(error as any)?.message}</p>
                        <Button className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ['kanban-columns'] })}>Tentar novamente</Button>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Quadro Kanban"
            subtitle={`${columns.length} coluna${columns.length !== 1 ? 's' : ''}`}
            actions={
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsAddCampaignOpen(true)} className="flex items-center gap-2">
                        <Send className="w-4 h-4" /> Adicionar à campanha
                    </Button>
                    <Button onClick={handleOpenCreateColumn} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Nova Coluna
                    </Button>
                </div>
            }
        >
            <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-200px)] items-start">
                {columns.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <LayoutGrid className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600">Nenhuma coluna criada</h3>
                        <p className="text-sm text-slate-400 mt-2 mb-6 max-w-sm">Crie colunas para organizar seu pipeline.</p>
                        <Button onClick={handleOpenCreateColumn} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Criar Primeira Coluna
                        </Button>
                    </div>
                )}

                {columns.map((column) => {
                    const columnCards = cardsByColumn[column.id] ?? [];
                    const isDragOver = dragOverColumnId === column.id;

                    return (
                        <div
                            key={column.id}
                            className={cn(
                                'flex-shrink-0 w-72 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200',
                                isDragOver && 'ring-2 ring-primary/50 bg-primary/5'
                            )}
                            onDragOver={(e) => handleDragOver(e, column.id)}
                            onDragLeave={() => setDragOverColumnId(null)}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            {/* Cabeçalho da coluna */}
                            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{column.name}</h3>
                                        {column.entryType && (
                                            <p className="text-[10px] text-slate-400 truncate">{ENTRY_TYPE_LABELS[column.entryType]}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {column.campaignId && (
                                        <Zap className="w-3.5 h-3.5 text-amber-500" title={`Campanha: ${column.campaign?.name ?? column.campaignId}`} />
                                    )}
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{columnCards.length}</Badge>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditColumn(column)}>
                                        <Pencil className="w-3.5 h-3.5 text-slate-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setColumnToDelete(column)}>
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </Button>
                                </div>
                            </div>

                            {/* Cards */}
                            <ScrollArea className="flex-1 p-2 min-h-[100px] max-h-[60vh]">
                                <div className="space-y-2">
                                    {columnCards.map((card) => (
                                        <Card
                                            key={card.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, card)}
                                            onDragEnd={() => { setDraggedCardId(null); setDragOverColumnId(null); }}
                                            onClick={() => handleOpenEditCard(card)}
                                            className={cn(
                                                'p-3 cursor-pointer hover:shadow-md transition-all duration-150 group border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
                                                draggedCardId === card.id && 'opacity-40 scale-95'
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div
                                                    className={cn(
                                                        'flex items-start gap-2 min-w-0',
                                                        card.contact && 'cursor-pointer rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                    )}
                                                    onClick={(e) => {
                                                        if (!card.contactId) return;
                                                        e.stopPropagation();
                                                        handleOpenContactProfile(card.contactId);
                                                    }}
                                                    title={card.contact ? 'Ver perfil do contato' : undefined}
                                                >
                                                    {card.contact ? (
                                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                                            <UserIcon className="w-3 h-3 text-primary" />
                                                        </div>
                                                    ) : null}
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight truncate">
                                                            {card.contact?.name ?? card.title}
                                                        </h4>
                                                        {card.contact?.email && (
                                                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                                                <Mail className="w-2.5 h-2.5 shrink-0" />
                                                                {card.contact.email}
                                                            </p>
                                                        )}
                                                        {card.contact?.phone && (
                                                            <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                                                                <Phone className="w-2.5 h-2.5 shrink-0" />
                                                                {card.contact.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                    onClick={(e) => { e.stopPropagation(); setCardToDelete(card); }}
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-400" />
                                                </Button>
                                            </div>
                                            {!card.contact && card.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{card.description}</p>
                                            )}
                                            <p className="text-[10px] text-slate-400 mt-2">{new Date(card.createdAt).toLocaleDateString('pt-BR')}</p>
                                        </Card>
                                    ))}

                                    {columnCards.length === 0 && (
                                        <div className="text-center py-6 text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                            Arraste cards para cá
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Botão adicionar card */}
                            <div className="p-2 border-t border-slate-200 dark:border-slate-800">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start gap-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                                    onClick={() => handleOpenCreateCard(column.id)}
                                >
                                    <Plus className="w-3.5 h-3.5" /> Adicionar card
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal — Coluna */}
            <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingColumn ? 'Editar Coluna' : 'Nova Coluna'}</DialogTitle>
                        <DialogDescription>Configure o comportamento desta etapa do pipeline.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitColumn} className="space-y-4">
                        {/* Nome */}
                        <div className="space-y-1.5">
                            <Label htmlFor="col-name">Nome</Label>
                            <Input
                                id="col-name"
                                value={columnForm.name}
                                onChange={(e) => setColumnForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="Ex: Recuperação de carrinho"
                            />
                        </div>

                        {/* Coluna de origem */}
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                            <div>
                                <p className="text-sm font-medium">Coluna de origem</p>
                                <p className="text-xs text-slate-500">Leads entram automaticamente nesta coluna</p>
                            </div>
                            <Switch
                                checked={columnForm.isOrigin}
                                onCheckedChange={(v) => setColumnForm((f) => ({ ...f, isOrigin: v }))}
                            />
                        </div>

                        {/* Tipo de entrada (só se for origem) */}
                        {columnForm.isOrigin && (
                            <div className="space-y-1.5">
                                <Label>Tipo de entrada</Label>
                                <Select
                                    value={columnForm.entryType}
                                    onValueChange={(v) => setColumnForm((f) => ({ ...f, entryType: v as KanbanEntryType }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a origem" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(ENTRY_TYPE_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Campanha vinculada */}
                        <div className="space-y-1.5">
                            <Label>Campanha disparada ao entrar nesta coluna</Label>
                            <Select
                                value={columnForm.campaignId}
                                onValueChange={(v) => setColumnForm((f) => ({ ...f, campaignId: v === '__none__' ? '' : v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Nenhuma campanha" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Nenhuma campanha</SelectItem>
                                    {campaigns.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name} ({c.channel}) · {c.status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {columnForm.campaignId && (() => {
                                const selected = campaigns.find((c) => String(c.id) === columnForm.campaignId);
                                const triggerable = selected ? TRIGGERABLE_STATUSES.includes(selected.status) : true;
                                return triggerable ? (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <Zap className="w-3 h-3" /> O lead será inserido nesta campanha ao chegar nesta etapa
                                    </p>
                                ) : (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <Zap className="w-3 h-3" /> Campanha "{selected?.status}" não aceita novos leads — ative ou agende a campanha para o gatilho funcionar
                                    </p>
                                );
                            })()}
                        </div>

                        {/* Condições */}
                        {columnForm.campaignId && (
                            <div className="space-y-2">
                                <Label>Condições para disparar a campanha</Label>
                                {columnForm.conditions.length > 0 && (
                                    <div className="space-y-1.5">
                                        {columnForm.conditions.map((cond, i) => (
                                            <div key={i} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs">
                                                <span className="text-slate-600 dark:text-slate-300">
                                                    <strong>{CONDITION_TYPE_LABELS[cond.type]}:</strong> {cond.value}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5"
                                                    onClick={() => handleRemoveCondition(i)}
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-400" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Select
                                        value={newCondition.type}
                                        onValueChange={(v) => setNewCondition((c) => ({ ...c, type: v as KanbanCondition['type'] }))}
                                    >
                                        <SelectTrigger className="w-48 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(CONDITION_TYPE_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        className="text-xs"
                                        placeholder="Valor"
                                        value={newCondition.value}
                                        onChange={(e) => setNewCondition((c) => ({ ...c, value: e.target.value }))}
                                    />
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddCondition}>
                                        <Plus className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                                {columnForm.conditions.length === 0 && (
                                    <p className="text-xs text-slate-400">Sem condições = campanha sempre dispara</p>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsColumnModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={createColumnMutation.isPending || updateColumnMutation.isPending}>
                                {(createColumnMutation.isPending || updateColumnMutation.isPending) ? 'Salvando...' : editingColumn ? 'Salvar' : 'Criar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal — Card */}
            <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
                <DialogContent className="w-[96vw] max-w-6xl max-h-[92vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCard ? 'Editar Card' : 'Novo Card'}</DialogTitle>
                        {!editingCard && (
                            <DialogDescription>Crie cards para contatos individuais ou grupos e encaminhe os leads para uma campanha.</DialogDescription>
                        )}
                    </DialogHeader>
                    <form onSubmit={handleSubmitCard} className="space-y-4">
                        {editingCard?.contact && (
                            <div
                                className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800 p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                                onClick={() => handleOpenContactProfile(editingCard.contactId)}
                                title="Ver perfil do contato"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{editingCard.contact.name}</p>
                                    {editingCard.contact.email && <p className="text-xs text-slate-400">{editingCard.contact.email}</p>}
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Coluna</Label>
                                <Select
                                    value={cardForm.columnId ? String(cardForm.columnId) : ''}
                                    onValueChange={(value) => setCardForm((form) => ({ ...form, columnId: Number(value) }))}
                                    disabled={!!editingCard}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a coluna" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columns.map((column) => (
                                            <SelectItem key={column.id} value={String(column.id)}>{column.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                    <Label>Campanha de destino</Label>
                                    <Select
                                        value={cardForm.campaignId}
                                        onValueChange={(value) => setCardForm((form) => ({ ...form, campaignId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a campanha" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {campaigns.map((campaign) => (
                                                <SelectItem key={campaign.id} value={String(campaign.id)}>
                                                    {campaign.name} ({campaign.channel}) Â· {campaign.status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <SegmentationPicker
                                selectedSegments={cardForm.segmentations}
                                onSegmentsChange={(segmentations) => setCardForm((form) => ({ ...form, segmentations }))}
                                availableGroups={groupsList}
                                selectedGroups={Array.from(cardForm.groupIds).map(String)}
                                onGroupsChange={(groups) => setCardForm((form) => ({
                                    ...form,
                                    groupIds: new Set(groups.map(Number).filter((id) => !Number.isNaN(id))),
                                }))}
                                selectedContactIds={Array.from(cardForm.contactIds)}
                                onSpecificContactsChange={(contactIds) => setCardForm((form) => ({
                                    ...form,
                                    contactIds: new Set(contactIds),
                                }))}
                                allContacts={contactsList}
                                onViewContact={handleOpenContactProfile}
                                stats={segmentationStats}
                            />
                            <p className="mt-3 text-xs text-slate-500">
                                Ao salvar, os contatos encontrados nas segmentações, grupos ou seleção unitária serão colocados no Kanban. Se houver campanha selecionada, eles também serão encaminhados para ela.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="card-title">Título</Label>
                            <Input
                                id="card-title"
                                value={cardForm.title}
                                onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                                placeholder="Título do card"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="card-description">Descrição</Label>
                            <Textarea
                                id="card-description"
                                value={cardForm.description}
                                onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                                placeholder="Descrição opcional"
                                rows={3}
                            />
                        </div>
                        <DialogFooter>
                            {editingCard && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="mr-auto text-red-500 hover:text-red-600"
                                    onClick={() => { setIsCardModalOpen(false); setCardToDelete(editingCard); }}
                                >
                                    Excluir
                                </Button>
                            )}
                            <Button type="button" variant="outline" onClick={() => setIsCardModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={createCardMutation.isPending}>
                                {createCardMutation.isPending ? 'Salvando...' : editingCard ? 'Salvar' : 'Criar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirmar exclusão de coluna */}
            <Dialog open={!!columnToDelete} onOpenChange={(open) => !open && setColumnToDelete(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Remover coluna</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja remover "{columnToDelete?.name}"? Todos os cards dentro dela também serão removidos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setColumnToDelete(null)}>Cancelar</Button>
                        <Button
                            variant="destructive"
                            disabled={deleteColumnMutation.isPending}
                            onClick={() => columnToDelete && deleteColumnMutation.mutate(columnToDelete.id)}
                        >
                            {deleteColumnMutation.isPending ? 'Removendo...' : 'Remover'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmar exclusão de card */}
            <Dialog open={!!cardToDelete} onOpenChange={(open) => !open && setCardToDelete(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Remover card</DialogTitle>
                        <DialogDescription>Tem certeza que deseja remover "{cardToDelete?.title}"?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCardToDelete(null)}>Cancelar</Button>
                        <Button
                            variant="destructive"
                            disabled={deleteCardMutation.isPending}
                            onClick={() => cardToDelete && deleteCardMutation.mutate(cardToDelete.id)}
                        >
                            {deleteCardMutation.isPending ? 'Removendo...' : 'Remover'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal — Adicionar contatos/grupos a campanha */}
            <Dialog open={isAddCampaignOpen} onOpenChange={setIsAddCampaignOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Adicionar à campanha</DialogTitle>
                        <DialogDescription>Insira contatos ou grupos inteiros numa campanha. A campanha precisa estar ativa, agendada ou finalizada.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Campanha */}
                        <div className="space-y-1.5">
                            <Label>Campanha</Label>
                            <Select value={addCampaignId} onValueChange={setAddCampaignId}>
                                <SelectTrigger><SelectValue placeholder="Selecione a campanha" /></SelectTrigger>
                                <SelectContent>
                                    {campaigns.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.channel}) · {c.status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Abas contatos / grupos */}
                        <div className="flex gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                            <button
                                type="button"
                                onClick={() => setAddTab('contacts')}
                                className={cn('flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-colors',
                                    addTab === 'contacts' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500')}
                            >
                                <UserIcon className="w-3.5 h-3.5" /> Contatos ({selectedContactIds.size})
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddTab('groups')}
                                className={cn('flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-colors',
                                    addTab === 'groups' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500')}
                            >
                                <Users className="w-3.5 h-3.5" /> Grupos ({selectedGroupIds.size})
                            </button>
                        </div>

                        {/* Lista selecionável */}
                        <ScrollArea className="h-56 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="p-1.5 space-y-0.5">
                                {addTab === 'contacts' && contactsList.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => toggleId(selectedContactIds, setSelectedContactIds, c.id)}
                                        className={cn('w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                                            selectedContactIds.has(c.id) ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800')}
                                    >
                                        <span className="min-w-0 truncate">{c.name}{c.email ? ` · ${c.email}` : ''}</span>
                                        {selectedContactIds.has(c.id) && <span className="text-xs shrink-0">✓</span>}
                                    </button>
                                ))}
                                {addTab === 'contacts' && contactsList.length === 0 && (
                                    <p className="text-xs text-slate-400 text-center py-6">Nenhum contato</p>
                                )}
                                {addTab === 'groups' && groupsList.map((g) => (
                                    <button
                                        key={g.id}
                                        type="button"
                                        onClick={() => toggleId(selectedGroupIds, setSelectedGroupIds, g.id)}
                                        className={cn('w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                                            selectedGroupIds.has(g.id) ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800')}
                                    >
                                        <span className="flex items-center gap-2 min-w-0 truncate">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.color || '#94a3b8' }} />
                                            {g.name}
                                        </span>
                                        {selectedGroupIds.has(g.id) && <span className="text-xs shrink-0">✓</span>}
                                    </button>
                                ))}
                                {addTab === 'groups' && groupsList.length === 0 && (
                                    <p className="text-xs text-slate-400 text-center py-6">Nenhum grupo</p>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCampaignOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSubmitAddCampaign} disabled={addToCampaignMutation.isPending}>
                            {addToCampaignMutation.isPending ? 'Enviando...' : 'Adicionar e disparar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ContactDetailsModal
                isOpen={selectedProfileContactId !== null}
                onClose={() => setSelectedProfileContactId(null)}
                contactId={selectedProfileContactId}
                contacts={contactsForDetails}
                contactPurchases={contactPurchases}
                scoreConfig={scoreConfig}
            />
        </PageLayout>
    );
}
