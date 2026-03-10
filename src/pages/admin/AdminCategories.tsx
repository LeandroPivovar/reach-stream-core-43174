import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tags, MoreVertical, Edit, Trash, Plus, CheckCircle, XCircle } from 'lucide-react';
import { api, Category } from '@/lib/api';
import { AdminLayout } from '@/components/layout/AdminLayout';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

export default function AdminCategories() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Queries
    const { data: categories, isLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: () => api.getCategories(),
    });

    // State
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form State
    const [form, setForm] = useState({ name: '', description: '', active: true });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: any) => api.createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            toast({ title: 'Sucesso', description: 'Categoria criada com sucesso.' });
            setIsCreateModalOpen(false);
            setForm({ name: '', description: '', active: true });
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao criar categoria.', variant: 'destructive' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Category>) => {
            if (!selectedCategory) throw new Error('No category selected');
            return api.updateCategory(selectedCategory.id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            toast({ title: 'Sucesso', description: 'Categoria atualizada com sucesso.' });
            setIsEditModalOpen(false);
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao atualizar categoria.', variant: 'destructive' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => {
            if (!selectedCategory) throw new Error('No category selected');
            return api.deleteCategory(selectedCategory.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            toast({ title: 'Sucesso', description: 'Categoria removida com sucesso.' });
            setIsDeleteModalOpen(false);
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Falha ao remover categoria.', variant: 'destructive' });
        }
    });

    // Handlers
    const handleOpenCreate = () => {
        setForm({ name: '', description: '', active: true });
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (category: Category) => {
        setSelectedCategory(category);
        setForm({ name: category.name, description: category.description || '', active: category.active });
        setIsEditModalOpen(true);
    };

    const handleOpenDelete = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleToggleActive = (category: Category) => {
        setSelectedCategory(category);
        updateMutation.mutate({ active: !category.active });
    };

    const submitCreate = () => {
        createMutation.mutate(form);
    };

    const submitEdit = () => {
        updateMutation.mutate(form);
    };

    const submitDelete = () => {
        deleteMutation.mutate();
    };

    return (
        <AdminLayout
            title="Administração de Categorias"
            subtitle="Crie e gerencie as categorias do sistema."
        >
            <div className="flex justify-end mb-6">
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data Criação</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : categories?.length ? (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.description || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={category.active ? "default" : "destructive"}>
                                            {category.active ? 'Ativa' : 'Inativa'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenEdit(category)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                                                    {category.active ? (
                                                        <><XCircle className="mr-2 h-4 w-4 text-destructive" /> Desativar</>
                                                    ) : (
                                                        <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Ativar</>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenDelete(category)} className="text-destructive">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    Nenhuma categoria encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova Categoria</DialogTitle>
                        <DialogDescription>
                            Crie uma nova categoria para o sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                        <Button onClick={submitCreate} disabled={createMutation.isPending || !form.name}>
                            {createMutation.isPending ? 'Salvando...' : 'Salvar Categoria'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Categoria</DialogTitle>
                        <DialogDescription>
                            Atualize as informações de {selectedCategory?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name">Nome</Label>
                            <Input
                                id="edit_name"
                                value={form.name}
                                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_description">Descrição</Label>
                            <Textarea
                                id="edit_description"
                                value={form.description}
                                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                        <Button onClick={submitEdit} disabled={updateMutation.isPending || !form.name}>
                            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir a categoria <b>{selectedCategory?.name}</b>?
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={submitDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir Categoria'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
