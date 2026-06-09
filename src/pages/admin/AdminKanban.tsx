import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Plus, GripVertical, Pencil, Trash2, Settings2 } from 'lucide-react';
import { api, KanbanColumnDto, KanbanCardDto } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminKanban() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [columns, setColumns] = useState<KanbanColumnDto[]>([]);
    const [cardsByColumn, setCardsByColumn] = useState<Record<number, KanbanCardDto[]>>({});

    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<KanbanColumnDto | null>(null);
    const [columnForm, setColumnForm] = useState({ name: '', description: '', active: true });

    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<KanbanCardDto | null>(null);
    const [cardForm, setCardForm] = useState({ columnId: 0, title: '', description: '', metadata: '' });

    const [columnToDelete, setColumnToDelete] = useState<KanbanColumnDto | null>(null);
    const [cardToDelete, setCardToDelete] = useState<KanbanCardDto | null>(null);

    const [draggedCardId, setDraggedCardId] = useState<number | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = useState<number | null>(null);

    const { isLoading: isLoadingColumns, refetch: refetchColumns } = useQuery({
        queryKey: ['kanban-columns'],
        queryFn: () => api.getKanbanColumns().then((r) => r.columns),
        onSuccess: (data) => setColumns(data || []),
    });

    const { isLoading: isLoadingCards, refetch: refetchCards } = useQuery({
        queryKey: ['kanban-cards'],
        queryFn: () => api.getKanbanCards().then((r) => r.cards),
        onSuccess: (data) => {
            const grouped: Record<number, KanbanCardDto[]> = {};
            (data || []).forEach((card) => {
                if (!grouped[card.columnId]) grouped[card.columnId] = [];
                grouped[card.columnId].push(card);
            });
            Object.keys(grouped).forEach((key) => {
                grouped[Number(key)].sort((a, b) => a.order - b.order);
            });
            setCardsByColumn(grouped);
        },
    });

    const reloadData = useCallback(async () => {
        await Promise.all([refetchColumns(), refetchCards()]);
    }, [refetchColumns, refetchCards]);

    const createColumnMutation = useMutation({
        mutationFn: (data: { name: string; description?: string }) => api.createKanbanColumn(data),
        onSuccess: () => { reloadData(); setIsColumnModalOpen(false); resetColumnForm(); toast({ title: 'Sucesso', description: 'Coluna criada' }); },
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const updateColumnMutation = useMutation({
        mutationFn: ({ columnId, data }: { columnId: number; data: any }) => api.updateKanbanColumn(columnId, data),
        onSuccess: () => { reloadData(); setIsColumnModalOpen(false); resetColumnForm(); toast({ title: 'Sucesso', description: 'Coluna atualizada' }); },
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const deleteColumnMutation = useMutation({
        mutationFn: (columnId: number) => api.deleteKanbanColumn(columnId),
        onSuccess: () => { reloadData(); setColumnToDelete(null); toast({ title: 'Sucesso', description: 'Coluna removida' }); },
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const createCardMutation = useMutation({
        mutationFn: (data: { columnId: number; title: string; description?: string; metadata?: Record<string, any> }) => api.createKanbanCard(data),
        onSuccess: () => { reloadData(); setIsCardModalOpen(false); resetCardForm(); toast({ title: 'Sucesso', description: 'Card criado' }); },
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const updateCardMutation = useMutation({
        mutationFn: ({ cardId, data }: { cardId: number; data: any }) => api.updateKanbanCard(cardId, data),
        onSuccess: () => { reloadData(); setIsCardModalOpen(false); resetCardForm(); setEditingCard(null); toast({ title: 'Sucesso', description: 'Card atualizado' }); },
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const deleteCardMutation = useMutation({
        mutationFn: (cardId: number) => api.deleteKanbanCard(cardId),
        onSuccess: () => { reloadData(); setCardToDelete(null); setEditingCard(null); toast({ title: 'Sucesso', description: 'Card removido' }); },
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const moveCardMutation = useMutation({
        mutationFn: ({ cardId, toColumnId, order }: { cardId: number; toColumnId: number; order?: number }) => api.moveKanbanCard(cardId, toColumnId, order),
        onSuccess: () => reloadData(),
        onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    });

    const reorderColumnsMutation = useMutation({
        mutationFn: (updates: { columnId: number; order: number }[]) => api.reorderKanbanColumns({ updates }),
        onSuccess: () => reloadData(),
    });

    const reorderCardsMutation = useMutation({
        mutationFn: (updates: { cardId: number; columnId: number; order: number }[]) => api.reorderKanbanCards({ updates }),
        onSuccess: () => reloadData(),
    });

    function resetColumnForm() {
        setColumnForm({ name: '', description: '', active: true });
        setEditingColumn(null);
    }

    function resetCardForm() {
        setCardForm({ columnId: 0, title: '', description: '', metadata: '' });
        setEditingCard(null);
    }

    const handleCreateColumn = () => { setEditingColumn(null); setColumnForm({ name: '', description: '', active: true }); setIsColumnModalOpen(true); };

    const handleEditColumn = (column: KanbanColumnDto) => {
        setEditingColumn(column);
        setColumnForm({ name: column.name, description: column.description || '', active: column.active });
        setIsColumnModalOpen(true);
    };

    const handleSubmitColumn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!columnForm.name.trim()) { toast({ title: 'Aviso', description: 'Nome obrigatório', variant: 'destructive' }); return; }
        if (editingColumn) updateColumnMutation.mutate({ columnId: editingColumn.id, data: columnForm });
        else createColumnMutation.mutate(columnForm);
    };

    const handleCreateCard = (columnId: number) => {
        setEditingCard(null);
        setCardForm({ columnId, title: '', description: '', metadata: '' });
        setIsCardModalOpen(true);
    };

    const handleEditCard = (card: KanbanCardDto) => {
        setEditingCard(card);
        setCardForm({ columnId: card.columnId, title: card.title, description: card.description || '', metadata: card.metadata ? JSON.stringify(card.metadata, null, 2) : '' });
        setIsCardModalOpen(true);
    };

    const handleSubmitCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardForm.title.trim()) { toast({ title: 'Aviso', description: 'Título obrigatório', variant: 'destructive' }); return; }
        const payload: any = { columnId: cardForm.columnId, title: cardForm.title.trim(), description: cardForm.description.trim() || undefined };
        if (cardForm.metadata.trim()) {
            try { payload.metadata = JSON.parse(cardForm.metadata); }
            catch { toast({ title: 'Erro', description: 'Metadados com JSON inválido', variant: 'destructive' }); return; }
        }
        if (editingCard) updateCardMutation.mutate({ cardId: editingCard.id, data: payload });
        else createCardMutation.mutate(payload);
    };

    const handleDragStart = (e: React.DragEvent, card: KanbanCardDto, columnId: number) => {
        setDraggedCardId(card.id);
        e.dataTransfer.setData('application/json', JSON.stringify({ cardId: card.id, sourceColumnId: columnId }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (_e: React.DragEvent, columnId: number) => { setDragOverColumnId(columnId); };

    const handleDragLeave = () => setDragOverColumnId(null);

    const handleDrop = (e: React.DragEvent, targetColumnId: number) => {
        e.preventDefault();
        setDragOverColumnId(null);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json')) as { cardId: number; sourceColumnId: number };
            if (data.cardId && data.sourceColumnId !== targetColumnId) {
                const targetCards = cardsByColumn[targetColumnId] || [];
                const newOrder = targetCards.length;
                setCardsByColumn((prev) => {
                    const next = { ...prev };
                    next[data.sourceColumnId] = (next[data.sourceColumnId] || []).filter((c) => c.id !== data.cardId);
                    const moved = { ...(prev[data.sourceColumnId] || []).find((c) => c.id === data.cardId)! };
                    moved.columnId = targetColumnId;
                    moved.order = newOrder;
                    next[targetColumnId] = [...(next[targetColumnId] || []), moved];
                    return next;
                });
                moveCardMutation.mutate({ cardId: data.cardId, toColumnId: targetColumnId, order: newOrder });
            }
        } catch { /* ignore */ }
        setDraggedCardId(null);
    };

    const handleDragEnd = () => { setDraggedCardId(null); setDragOverColumnId(null); };

    if (isLoadingColumns) {
        return (
            <AdminLayout title="Kanban (Beta)" subtitle="Carregando quadro...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Quadro Kanban" subtitle="Gerencie cards e colunas. Status: Beta" actions={
            <Button onClick={handleCreateColumn} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Nova Coluna</Button>
        }>
            <div className="flex gap-6 overflow-x-auto pb-6 min-h-[calc(100vh-200px)]">
                {columns.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <LayoutGrid className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600">Nenhuma coluna criada</h3>
                        <p className="text-sm text-slate-400 mt-2 mb-6 max-w-sm">Comece criando colunas para o seu quadro Kanban.</p>
                        <Button onClick={handleCreateColumn} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Criar Primeira Coluna</Button>
                    </div>
                )}

                {columns.map((column) => {
                    const columnCards = cardsByColumn[column.id] || [];
                    const isDragOver = dragOverColumnId === column.id;
                    return (
                        <div key={column.id} className={cn('flex-shrink-0 w-80 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200', isDragOver && 'ring-2 ring-primary/50 bg-primary/5 dark:bg-primary/10')}
                            onDragOver={(e) => handleDragOver(e, column.id)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, column.id)}>
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{column.name}</h3>
                                        {column.description && <p className="text-xs text-slate-400 truncate">{column.description}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{columnCards.length}</Badge>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditColumn(column)}><Pencil className="w-3.5 h-3.5 text-slate-500" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setColumnToDelete(column)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-3 space-y-2 min-h-[150px] max-h-[60vh]">
                                {columnCards.map((card) => (
                                    <Card key={card.id} draggable onDragStart={(e) => handleDragStart(e, card, column.id)} onDragEnd={handleDragEnd}
                                        onClick={() => handleEditCard(card)}
                                        className={cn('p-3 cursor-grab active:cursor-grabbing transition-all duration-150 hover:shadow-md group border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800', draggedCardId === card.id && 'opacity-50 scale-95 shadow-lg')}>
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{card.title}</h4>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleEditCard(card); }}>
                                                <Pencil className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        {card.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{card.description}</p>}
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] text-slate-400">{new Date(card.createdAt).toLocaleDateString('pt-BR')}</span>
                                            {card.metadata && Object.keys(card.metadata).length > 0 && <Badge variant="outline" className="text-[9px] h-4 px-1">+meta</Badge>}
                                        </div>
                                    </Card>
                                ))}
                                {columnCards.length === 0 && (
                                    <div className="text-center py-8 text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">Arraste cards para cá</div>
                                )}
                            </ScrollArea>
                            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                                <Button variant="outline" size="sm" className="w-full justify-center gap-1.5 text-xs" onClick={() => handleCreateCard(column.id)}>
                                    <Plus className="w-3.5 h-3.5" /> Adicionar Card
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Settings2 className="w-4 h-4" />{editingColumn ? 'Editar Coluna' : 'Nova Coluna'}</DialogTitle>
                        <DialogDescription>{editingColumn ? 'Altere os dados da coluna' : 'Preencha os dados para criar uma nova coluna'}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitColumn} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="column-name">Nome *</Label>
                            <Input id="column-name" value={columnForm.name} onChange={(e) => setColumnForm({ ...columnForm, name: e.target.value })} placeholder="Ex: A Fazer, Em Progresso, Concluído" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="column-description">Descrição</Label>
                            <Textarea id="column-description" value={columnForm.description} onChange={(e) => setColumnForm({ ...columnForm, description: e.target.value })} placeholder="Descrição opcional" rows={2} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="column-active">Status</Label>
                            <select id="column-active" value={columnForm.active ? 'true' : 'false'} onChange={(e) => setColumnForm({ ...columnForm, active: e.target.value === 'true' })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                                <option value="true">Ativa</option>
                                <option value="false">Inativa</option>
                            </select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsColumnModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={createColumnMutation.isPending || updateColumnMutation.isPending}>
                                {(createColumnMutation.isPending || updateColumnMutation.isPending) && <span className="animate-spin mr-2">⟳</span>}
                                {editingColumn ? 'Salvar Alterações' : 'Criar Coluna'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><LayoutGrid className="w-4 h-4" />{editingCard ? 'Editar Card' : 'Novo Card'}</DialogTitle>
                        <DialogDescription>{editingCard ? 'Altere os dados do card' : 'Preencha os dados para criar um novo card'}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitCard} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="card-title">Título *</Label>
                            <Input id="card-title" value={cardForm.title} onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })} placeholder="Título do card" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="card-description">Descrição</Label>
                            <Textarea id="card-description" value={cardForm.description} onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })} placeholder="Descrição detalhada" rows={3} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="card-metadata">Metadados (JSON opcional)</Label>
                            <Textarea id="card-metadata" value={cardForm.metadata} onChange={(e) => setCardForm({ ...cardForm, metadata: e.target.value })} placeholder='{"priority": "high"}' rows={3} className="font-mono text-xs" />
                            <p className="text-[11px] text-slate-400">Informações estruturadas do card.</p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCardModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={createCardMutation.isPending || updateCardMutation.isPending}>
                                {(createCardMutation.isPending || updateCardMutation.isPending) && <span className="animate-spin mr-2">⟳</span>}
                                {editingCard ? 'Salvar Alterações' : 'Criar Card'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!columnToDelete} onOpenChange={(open) => !open && setColumnToDelete(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>Tem certeza que deseja remover a coluna "{columnToDelete?.name}"? Todos os cards dentro dela também serão removidos.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setColumnToDelete(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={() => columnToDelete && deleteColumnMutation.mutate(columnToDelete.id)} disabled={deleteColumnMutation.isPending}>
                            {deleteColumnMutation.isPending ? 'Removendo...' : 'Remover Coluna'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!cardToDelete} onOpenChange={(open) => !open && setCardToDelete(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>Tem certeza que deseja remover o card "{cardToDelete?.title}"?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCardToDelete(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={() => cardToDelete && deleteCardMutation.mutate(cardToDelete.id)} disabled={deleteCardMutation.isPending}>
                            {deleteCardMutation.isPending ? 'Removendo...' : 'Remover Card'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
