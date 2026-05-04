import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
    Plus,
    FileText,
    Pencil,
    Trash2,
    Download,
    Search,
    Loader2
} from 'lucide-react';

export default function AdminKnowledgeBase() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [tutorials, setTutorials] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTutorial, setEditingTutorial] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        file: null as File | null
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTutorials();
    }, []);

    const fetchTutorials = async () => {
        try {
            setLoading(true);
            const data = await api.knowledgeBaseApi.list();
            setTutorials(data);
        } catch (error) {
            console.error('Erro ao buscar tutoriais:', error);
            toast({
                title: "Erro ao carregar",
                description: "Não foi possível carregar a base de conhecimento.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (tutorial: any = null) => {
        if (tutorial) {
            setEditingTutorial(tutorial);
            setFormData({ title: tutorial.title, file: null });
        } else {
            setEditingTutorial(null);
            setFormData({ title: '', file: null });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) return;
        if (!editingTutorial && !formData.file) {
            toast({
                title: "Atenção",
                description: "Por favor, selecione um arquivo PDF.",
                variant: "destructive"
            });
            return;
        }

        try {
            setSubmitting(true);
            const body = new FormData();
            body.append('title', formData.title);
            if (formData.file) {
                body.append('file', formData.file);
            }

            if (editingTutorial) {
                await api.knowledgeBaseApi.update(editingTutorial.id, body);
                toast({ title: "Sucesso", description: "Tutorial atualizado com sucesso!" });
            } else {
                await api.knowledgeBaseApi.create(body);
                toast({ title: "Sucesso", description: "Tutorial criado com sucesso!" });
            }

            setIsModalOpen(false);
            fetchTutorials();
        } catch (error) {
            toast({
                title: "Erro ao salvar",
                description: "Ocorreu um erro ao processar sua solicitação.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este tutorial?')) return;

        try {
            await api.knowledgeBaseApi.delete(id);
            toast({ title: "Sucesso", description: "Tutorial excluído com sucesso!" });
            fetchTutorials();
        } catch (error) {
            toast({
                title: "Erro ao excluir",
                description: "Não foi possível excluir o tutorial.",
                variant: "destructive"
            });
        }
    };

    const filteredTutorials = tutorials.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Base de Conhecimento" subtitle="Gerencie tutoriais e manuais do sistema">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar tutorial..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Tutorial
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título do Tutorial</TableHead>
                                <TableHead>Arquivo</TableHead>
                                <TableHead>Data de Criação</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredTutorials.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        Nenhum tutorial encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTutorials.map((tutorial) => (
                                    <TableRow key={tutorial.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                {tutorial.title}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="link" 
                                                className="p-0 h-auto text-primary"
                                                onClick={() => window.open(tutorial.pdfUrl, '_blank')}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Ver PDF
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(tutorial.createdAt).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost"
                                                    onClick={() => handleOpenModal(tutorial)}
                                                >
                                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost"
                                                    onClick={() => handleDelete(tutorial.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-rose-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTutorial ? 'Editar Tutorial' : 'Novo Tutorial'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título do Tutorial</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Ex: Manual de Configuração de Pixels"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="file">Arquivo PDF {editingTutorial && '(Opcional se não quiser alterar)'}</Label>
                            <Input
                                id="file"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                                required={!editingTutorial}
                            />
                            <p className="text-[10px] text-muted-foreground">Tamanho máximo: 20MB</p>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editingTutorial ? 'Salvar Alterações' : 'Criar Tutorial'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
