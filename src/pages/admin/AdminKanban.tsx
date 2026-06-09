import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Plus, GripVertical, Pencil, Trash2 } from 'lucide-react';
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

    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<KanbanColumnDto | null>(null);
    const [columnName, setColumnName] = useState('');

    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<KanbanCardDto | null>(null);
    const [cardForm, setCardForm] = useState({ columnId: 0, title: '', description: '' });

    const [columnToDelete, setColumnToDelete] = useState<KanbanColumnDto | null>(null);
    const [cardToDelete, setCardToDelete] = useState<KanbanCardDto | null>(null);

    const [draggedCardId, setDraggedCardId] = useState<number | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = useState<number | null>(null);

    // --- Queries ---

    const { data: columnsData, isLoading: isLoadingColumns, isError, error } = useQuery({
        queryKey: ['kanban-columns'],
        queryFn: async () => {
            console.log('[Kanban] Buscando colunas...');
            const response = await api.getKanbanColumns();
            console.log('[Kanban] Colunas recebidas:', response?.columns?.length ?? 0, response?.columns);
            return response?.columns ?? [];
        },
    });

    const { data: cardsData, isLoading: isLoadingCards } = useQuery({
        queryKey: ['kanban-cards'],
        queryFn: async () => {
            console.log('[Kanban] Buscando cards...');
            const response = await api.getKanbanCards();
            console.log('[Kanban] Cards recebidos:', response?.cards?.length ?? 0, response?.cards);
            return response?.cards ?? [];
        },
    });

    const columns: KanbanColumnDto[] = columnsData ?? [];

    const cardsByColumn: Record<number, KanbanCardDto[]> = {};
    (cardsData ?? []).forEach((card) => {
        if (!cardsByColumn[card.columnId]) cardsByColumn[card.columnId] = [];
        cardsByColumn[card.columnId].push(card);
    });
    Object.keys(cardsByColumn).forEach((key) => {
        cardsByColumn[Number(key)].sort((a, b) => a.order - b.order);
    });

    console.log('[Kanban] Render — colunas:', columns.length, '| cards agrupados por coluna:', Object.keys(cardsByColumn).length);

    // --- Mutations ---

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['kanban-columns'] });
        queryClient.invalidateQueries({ queryKey: ['kanban-cards'] });
    };

    const createColumnMutation = useMutation({
        mutationFn: (name: string) => {
            console.log('[Kanban] Criando coluna:', name);
            return api.createKanbanColumn({ name });
        },
        onSuccess: (data) => {
            console.log('[Kanban] Coluna criada com sucesso:', data);
            invalidate();
            setIsColumnModalOpen(false);
            setColumnName('');
            toast({ title: 'Coluna criada' });
        },
        onError: (err: any) => {
            console.error('[Kanban] Erro ao criar coluna:', err);
            toast({ title: 'Erro ao criar coluna', description: err.message, variant: 'destructive' });
        },
    });

    const updateColumnMutation = useMutation({
        mutationFn: ({ columnId, name }: { columnId: number; name: string }) => {
            console.log('[Kanban] Atualizando coluna', columnId, '→', name);
            return api.updateKanbanColumn(columnId, { name });
        },
        onSuccess: (data) => {
            console.log('[Kanban] Coluna atualizada:', data);
            invalidate();
            setIsColumnModalOpen(false);
            setEditingColumn(null);
            setColumnName('');
            toast({ title: 'Coluna atualizada' });
        },
        onError: (err: any) => {
            console.error('[Kanban] Erro ao atualizar coluna:', err);
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        },
    });

    const deleteColumnMutation = useMutation({
        mutationFn: (columnId: number) => {
            console.log('[Kanban] Removendo coluna', columnId);
            return api.deleteKanbanColumn(columnId);
        },
        onSuccess: () => {
            console.log('[Kanban] Coluna removida');
            invalidate();
            setColumnToDelete(null);
            toast({ title: 'Coluna removida' });
        },
        onError: (err: any) => {
            console.error('[Kanban] Erro ao remover coluna:', err);
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        },
    });

    const createCardMutation = useMutation({
        mutationFn: (data: { columnId: number; title: string; description?: string }) => {
            console.log('[Kanban] Criando card:', data);
            return api.createKanbanCard(data);
        },
        onSuccess: (data) => {
            console.log('[Kanban] Card criado:', data);
            invalidate();
            setIsCardModalOpen(false);
            setCardForm({ columnId: 0, title: '', description: '' });
            toast({ title: 'Card criado' });
        },
        onError: (err: any) => {
            console.error('[Kanban] Erro ao criar card:', err);
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        },
    });

    const updateCardMutation = useMutation({
        mutationFn: ({ cardId, data }: { cardId: number; data: any }) => {
            console.log('[Kanban] Atualizando card', cardId, data);
            return api.updateKanbanCard(cardId, data);
        },
        onSuccess: (data) => {
            console.log('[Kanban] Card atualizado:', data);
            invalidate();
            setIsCardModalOpen(false);
            setEditingCard(null);
            toast({ title: 'Card atualizado' });
        },
        onError: (err: any) => {
            console.error('[Kanban] Erro ao atualizar card:', err);
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        },
    });

    const deleteCardMutation = useMutation({
        mutationFn: (cardId: number) => {
            console.log('[Kanban] Removendo card', cardId);
            return api.deleteKanbanCard(cardId);
        },
        onSuccess: () => {
            console.log('[Kanban] Card removido');
            invalidate();
            setCardToDelete(null);
            setEditingCard(null);
            toast({ title: 'Card removido' });
        },
        onError: (err: any) => {
            console.error('[Kanban] Erro ao remover card:', err);
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        },
    });

    const moveCardMutation = useMutation({
        mutationFn: ({ cardId, toColumnId, order }: { cardId: number; toColumnId: number; order?: number }) => {
            console.log('[Kanban] Movendo card', cardId, '→ coluna', toColumnId, 'order', order);
            return api.moveKanbanCard(cardId, toColumnId, order);
        },
        onSuccess: () => {
            console.log('[Kanban] Card movido');
            invalidate();
        },
        onError: (err: any) => {
            console.error('[Kanban] Erro ao mover card:', err);
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        },
    });

    // --- Handlers ---

    const handleOpenCreateColumn = () => {
        setEditingColumn(null);
        setColumnName('');
        setIsColumnModalOpen(true);
    };

    const handleOpenEditColumn = (column: KanbanColumnDto) => {
        setEditingColumn(column);
        setColumnName(column.name);
        setIsColumnModalOpen(true);
    };

    const handleSubmitColumn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!columnName.trim()) {
            toast({ title: 'Nome obrigatório', variant: 'destructive' });
            return;
        }
        if (editingColumn) {
            updateColumnMutation.mutate({ columnId: editingColumn.id, name: columnName.trim() });
        } else {
            createColumnMutation.mutate(columnName.trim());
        }
    };

    const handleOpenCreateCard = (columnId: number) => {
        setEditingCard(null);
        setCardForm({ columnId, title: '', description: '' });
        setIsCardModalOpen(true);
    };

    const handleOpenEditCard = (card: KanbanCardDto) => {
        setEditingCard(card);
        setCardForm({ columnId: card.columnId, title: card.title, description: card.description || '' });
        setIsCardModalOpen(true);
    };

    const handleSubmitCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardForm.title.trim()) {
            toast({ title: 'Título obrigatório', variant: 'destructive' });
            return;
        }
        const payload = { columnId: cardForm.columnId, title: cardForm.title.trim(), description: cardForm.description.trim() || undefined };
        if (editingCard) {
            updateCardMutation.mutate({ cardId: editingCard.id, data: payload });
        } else {
            createCardMutation.mutate(payload);
        }
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
            <AdminLayout title="Kanban" subtitle="Carregando quadro...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            </AdminLayout>
        );
    }

    if (isError) {
        console.error('[Kanban] Erro na query:', error);
        return (
            <AdminLayout title="Kanban" subtitle="Erro ao carregar">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-red-500 mb-2">Erro ao carregar dados</h3>
                        <p className="text-sm text-slate-400">{(error as any)?.message || 'Verifique o console para detalhes'}</p>
                        <Button className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ['kanban-columns'] })}>Tentar novamente</Button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Quadro Kanban"
            subtitle={`${columns.length} coluna${columns.length !== 1 ? 's' : ''}`}
            actions={
                <Button onClick={handleOpenCreateColumn} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nova Coluna
                </Button>
            }
        >
            <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-200px)] items-start">
                {columns.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <LayoutGrid className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600">Nenhuma coluna criada</h3>
                        <p className="text-sm text-slate-400 mt-2 mb-6 max-w-sm">Crie colunas para organizar seu quadro Kanban.</p>
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
                                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{column.name}</h3>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
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
                                                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{card.title}</h4>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                    onClick={(e) => { e.stopPropagation(); setCardToDelete(card); }}
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-400" />
                                                </Button>
                                            </div>
                                            {card.description && (
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

            {/* Modal — Coluna (só nome) */}
            <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editingColumn ? 'Editar Coluna' : 'Nova Coluna'}</DialogTitle>
                        <DialogDescription>
                            {editingColumn ? 'Altere o nome da coluna.' : 'Digite o nome da nova coluna.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitColumn} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="column-name">Nome</Label>
                            <Input
                                id="column-name"
                                autoFocus
                                value={columnName}
                                onChange={(e) => setColumnName(e.target.value)}
                                placeholder="Ex: A Fazer, Em Progresso, Concluído"
                            />
                        </div>
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingCard ? 'Editar Card' : 'Novo Card'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitCard} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="card-title">Título</Label>
                            <Input
                                id="card-title"
                                autoFocus
                                value={cardForm.title}
                                onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                                placeholder="Título do card"
                            />
                        </div>
                        <div className="space-y-2">
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
                            <Button type="submit" disabled={createCardMutation.isPending || updateCardMutation.isPending}>
                                {(createCardMutation.isPending || updateCardMutation.isPending) ? 'Salvando...' : editingCard ? 'Salvar' : 'Criar'}
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
        </AdminLayout>
    );
}
