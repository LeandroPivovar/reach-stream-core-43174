import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Category } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Search, ArrowLeft, Loader2, Package } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Categorias() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.getCategories(),
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<Category>) => api.createCategory(data as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast({ title: 'Sucesso', description: 'Categoria criada com sucesso.' });
            closeDialog();
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Erro ao criar categoria.', variant: 'destructive' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number; payload: Partial<Category> }) =>
            api.updateCategory(data.id, data.payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast({ title: 'Sucesso', description: 'Categoria atualizada com sucesso.' });
            closeDialog();
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Erro ao atualizar categoria.', variant: 'destructive' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast({ title: 'Sucesso', description: 'Categoria excluída com sucesso.' });
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Erro',
                description: error.message || 'Erro ao excluir categoria.',
                variant: 'destructive',
            });
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
        },
    });

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setName(category.name);
            setDescription(category.description || '');
        } else {
            setEditingCategory(null);
            setName('');
            setDescription('');
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        setName('');
        setDescription('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (editingCategory) {
            updateMutation.mutate({
                id: editingCategory.id,
                payload: { name, description },
            });
        } else {
            createMutation.mutate({ name, description });
        }
    };

    const confirmDelete = (category: Category) => {
        setCategoryToDelete(category);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
                <Header title="Categorias" subtitle="Gerencie as categorias dos seus produtos" />

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 border-b-2 border-[#5a5cce] inline-block pb-1">
                                    Categorias
                                </h1>
                                <p className="text-gray-500 mt-1">Gerencie as categorias dos seus produtos</p>
                            </div>
                            <Button
                                onClick={() => openDialog()}
                                className="bg-[#5a5cce] hover:bg-[#4a4cbd] text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Categoria
                            </Button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <div className="relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar categorias..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-white border-gray-200"
                                    />
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="p-8 text-center text-gray-400">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#5a5cce]" />
                                    <p className="mt-2 text-sm">Carregando categorias...</p>
                                </div>
                            ) : filteredCategories.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-lg font-medium text-gray-900 mb-1">Nenhuma categoria encontrada</p>
                                    <p className="text-sm">
                                        {searchTerm
                                            ? 'Nenhum resultado para sua busca.'
                                            : 'Você ainda não possui categorias.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Nome</th>
                                                <th className="px-6 py-4 font-medium">Descrição</th>
                                                <th className="px-6 py-4 font-medium text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredCategories.map((category) => (
                                                <tr
                                                    key={category.id}
                                                    className="hover:bg-gray-50/50 transition-colors group"
                                                >
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {category.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 truncate max-w-[300px]">
                                                        {category.description || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openDialog(category)}
                                                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => confirmDelete(category)}
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Categoria *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Camisetas"
                                required
                                className="border-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Descrição opcional"
                                className="border-gray-200"
                            />
                        </div>
                    </form>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={closeDialog}
                            className="border-gray-200"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-[#5a5cce] hover:bg-[#4a4cbd] text-white"
                            disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
                        >
                            {createMutation.isPending || updateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AlertDialog for Delete */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir a categoria{' '}
                            <span className="font-medium text-gray-900">
                                {categoryToDelete?.name}
                            </span>
                            ? Isso pode afetar produtos vinculados a ela. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => categoryToDelete && deleteMutation.mutate(categoryToDelete.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
