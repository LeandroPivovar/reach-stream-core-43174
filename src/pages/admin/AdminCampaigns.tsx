import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkflowCanvas, WorkflowStep } from '@/components/workflow/WorkflowCanvas';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Globe,
  FileText,
  ArrowLeft,
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminCampaignTemplate {
  id: number;
  name: string;
  status: 'rascunho' | 'publicada';
  description?: string;
  workflow: any;
  createdAt: string;
  updatedAt: string;
}

type WizardStep = 1 | 2 | 3;

export default function AdminCampaigns() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<AdminCampaignTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    workflow: { nodes: [] as WorkflowStep[], edges: [] as any[] },
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await api.adminCampaignTemplatesApi.getAll();
      setTemplates(data || []);
    } catch (error) {
      toast({
        title: 'Erro ao carregar campanhas',
        description: 'Não foi possível carregar os templates de campanha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '', workflow: { nodes: [], edges: [] } });
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const openEdit = (template: AdminCampaignTemplate) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      description: template.description || '',
      workflow: template.workflow || { nodes: [], edges: [] },
    });
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleSave = async (status: 'rascunho' | 'publicada') => {
    if (!form.name.trim()) {
      toast({ title: 'Nome obrigatório', description: 'Informe um nome para a campanha.', variant: 'destructive' });
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        workflow: form.workflow,
        status,
      };

      if (editingId) {
        await api.adminCampaignTemplatesApi.update(editingId, payload);
        toast({ title: 'Campanha atualizada!', description: `Status: ${status === 'publicada' ? 'Publicada' : 'Rascunho'}` });
      } else {
        await api.adminCampaignTemplatesApi.create(payload);
        toast({ title: 'Campanha criada!', description: `Status: ${status === 'publicada' ? 'Publicada' : 'Rascunho'}` });
      }

      setIsWizardOpen(false);
      loadTemplates();
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Não foi possível salvar a campanha.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (template: AdminCampaignTemplate) => {
    try {
      const newStatus = template.status === 'publicada' ? 'rascunho' : 'publicada';
      await api.adminCampaignTemplatesApi.update(template.id, { status: newStatus });
      toast({
        title: newStatus === 'publicada' ? 'Campanha publicada!' : 'Movida para rascunho',
        description: `A campanha "${template.name}" foi atualizada.`,
      });
      loadTemplates();
    } catch (error) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    }
  };

  const handleDelete = async (template: AdminCampaignTemplate) => {
    if (!confirm(`Deseja excluir a campanha "${template.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.adminCampaignTemplatesApi.delete(template.id);
      toast({ title: 'Campanha excluída', description: `"${template.name}" foi removida.` });
      loadTemplates();
    } catch (error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const canProceed = () => {
    if (wizardStep === 1) return form.name.trim().length > 0;
    return true;
  };

  const statusBadge = (status: string) => (
    <Badge
      variant={status === 'publicada' ? 'default' : 'secondary'}
      className={status === 'publicada'
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}
    >
      {status === 'publicada' ? (
        <><Globe className="w-3 h-3 mr-1" />Publicada</>
      ) : (
        <><FileText className="w-3 h-3 mr-1" />Rascunho</>
      )}
    </Badge>
  );

  const stats = {
    total: templates.length,
    publicadas: templates.filter(t => t.status === 'publicada').length,
    rascunhos: templates.filter(t => t.status === 'rascunho').length,
  };

  return (
    <AdminLayout title="Campanhas Admin" subtitle="Crie e gerencie campanhas pré-definidas para os usuários">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total de Campanhas', value: stats.total, icon: Zap, color: 'text-blue-400' },
          { label: 'Publicadas', value: stats.publicadas, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Rascunhos', value: stats.rascunhos, icon: Clock, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4 bg-card border border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Header actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Lista de Campanhas</h2>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Campanha
        </Button>
      </div>

      {/* Table */}
      <Card className="border border-border/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Nós no Workflow</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Nenhuma campanha criada ainda</p>
                    <Button size="sm" onClick={openCreate}>Criar primeira campanha</Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              templates.map(template => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                    {template.description || '—'}
                  </TableCell>
                  <TableCell>{statusBadge(template.status)}</TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {template.workflow?.nodes?.length || 0} nós
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(template.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(template)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(template)}>
                          {template.status === 'publicada' ? (
                            <><FileText className="w-4 h-4 mr-2" />Mover para Rascunho</>
                          ) : (
                            <><Globe className="w-4 h-4 mr-2" />Publicar</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(template)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Wizard Dialog */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className={wizardStep === 2 ? "max-w-6xl h-[90vh] flex flex-col" : "max-w-xl"}>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Campanha' : 'Nova Campanha Admin'}
            </DialogTitle>
            <DialogDescription>
              {wizardStep === 1 && 'Configure o nome e descrição da campanha'}
              {wizardStep === 2 && 'Configure o workflow avançado da campanha'}
              {wizardStep === 3 && 'Revise e salve a campanha'}
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicators */}
          <div className="flex items-center gap-2 py-2">
            {[
              { step: 1, label: 'Informações' },
              { step: 2, label: 'Workflow' },
              { step: 3, label: 'Revisão' },
            ].map(({ step, label }) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  wizardStep === step
                    ? 'bg-primary text-primary-foreground'
                    : wizardStep > step
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {wizardStep > step ? '✓' : step}
                  </span>
                  {label}
                </div>
                {step < 3 && <div className={`flex-1 h-px ${wizardStep > step ? 'bg-primary/40' : 'bg-border'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Info */}
          {wizardStep === 1 && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="camp-name">Nome da Campanha *</Label>
                <Input
                  id="camp-name"
                  placeholder="Ex: Campanha de Reativação"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camp-desc">Descrição (opcional)</Label>
                <Textarea
                  id="camp-desc"
                  placeholder="Descreva o objetivo desta campanha para os usuários..."
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                💡 Esta campanha será usada como <strong>template</strong> pelos usuários. Eles poderão selecionar contatos e editar o workflow antes de enviar.
              </div>
            </div>
          )}

          {/* Step 2: Workflow */}
          {wizardStep === 2 && (
            <div className="flex-1 overflow-hidden">
              <WorkflowCanvas
                workflow={form.workflow}
                onChange={(wf) => setForm(prev => ({ ...prev, workflow: wf }))}
                twilioConfigured={true}
              />
            </div>
          )}

          {/* Step 3: Review */}
          {wizardStep === 3 && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-border/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nome</span>
                  <span className="font-medium">{form.name}</span>
                </div>
                {form.description && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted-foreground shrink-0">Descrição</span>
                    <span className="text-sm text-right">{form.description}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nós no Workflow</span>
                  <span className="font-medium">{form.workflow?.nodes?.length || 0} nós</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSave('rascunho')}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Salvar como Rascunho
                </Button>
                <Button
                  onClick={() => handleSave('publicada')}
                  disabled={isSaving}
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                >
                  <Globe className="w-4 h-4" />
                  Publicar
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Button
              variant="ghost"
              onClick={() => {
                if (wizardStep === 1) setIsWizardOpen(false);
                else setWizardStep(prev => (prev - 1) as WizardStep);
              }}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {wizardStep === 1 ? 'Cancelar' : 'Voltar'}
            </Button>

            {wizardStep < 3 && (
              <Button
                onClick={() => setWizardStep(prev => (prev + 1) as WizardStep)}
                disabled={!canProceed()}
                className="gap-2"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
