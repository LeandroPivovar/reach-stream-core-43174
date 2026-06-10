
import React, { useState, useRef, useEffect } from 'react';
import './AdminEmailBuilder.css';
import { initEmailBuilder } from './emailBuilderApp';
import { EmailBuilderCore } from './EmailBuilderCore';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, Send, Plus, Loader2, ArrowLeft, Pencil, Trash2, Mail, FileText, AlertCircle } from 'lucide-react';

export interface EmailTemplateDto {
  id: number;
  userId: number;
  name: string;
  category: string;
  html: string;
  subject?: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  custom: 'Personalizado',
  marketing: 'Marketing',
  transactional: 'Transacional',
  notification: 'Notificação',
};

const CATEGORY_COLORS: Record<string, string> = {
  custom: 'secondary',
  marketing: 'default',
  transactional: 'outline',
  notification: 'outline',
};

export default function AdminEmailBuilder() {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [templates, setTemplates] = useState<EmailTemplateDto[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null);

  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('custom');
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  const [sendTo, setSendTo] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendVariables, setSendVariables] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const [connectInfo, setConnectInfo] = useState<{ success: boolean; message?: string; hasConnection?: boolean } | null>(null);
  const [isLoadingConnectInfo, setIsLoadingConnectInfo] = useState(false);

  const { toast } = useToast();
  const builderInitialized = useRef(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const res = await api.getEmailTemplates();
      setTemplates(Array.isArray(res) ? res : []);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Falha ao carregar templates', variant: 'destructive' });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const checkConnection = async () => {
    setIsLoadingConnectInfo(true);
    try {
      const res = await api.getEmailConnections();
      const connections = Array.isArray(res) ? res : [];
      const verified = connections.filter((c: any) => c.status === 'verified');
      setConnectInfo({
        success: true,
        hasConnection: verified.length > 0,
        message: verified.length > 0 ? `${verified.length} conexão(ões) verificada(s)` : 'Nenhuma conexão de e-mail verificada',
      });
    } catch {
      setConnectInfo({ success: false, message: 'Falha ao verificar conexões', hasConnection: false });
    } finally {
      setIsLoadingConnectInfo(false);
    }
  };

  const handleNewTemplate = () => {
    resetSaveForm();
    if (typeof (window as any).loadCanvasHTML === 'function') {
      (window as any).loadCanvasHTML('');
    }
    setView('editor');
  };

  const handleEditTemplate = (template: EmailTemplateDto) => {
    setEditingTemplateId(template.id);
    setTemplateName(template.name);
    setTemplateSubject(template.subject || '');
    setTemplateDescription(template.description || '');
    setTemplateCategory(template.category || 'custom');
    setView('editor');
    // Load HTML into canvas after view switches (canvas must be visible)
    setTimeout(() => {
      const content = extractCanvasContent(template.html);
      if (typeof (window as any).loadCanvasHTML === 'function') {
        (window as any).loadCanvasHTML(content);
      }
    }, 50);
  };

  const handleBackToList = async () => {
    setView('list');
    resetSaveForm();
    await loadTemplates();
  };

  const confirmDeleteTemplate = (id: number) => {
    setDeletingTemplateId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteTemplate = async () => {
    if (!deletingTemplateId) return;
    try {
      await api.deleteEmailTemplate(deletingTemplateId);
      toast({ title: 'Sucesso', description: 'Template excluído' });
      setIsDeleteConfirmOpen(false);
      setDeletingTemplateId(null);
      await loadTemplates();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Falha ao excluir template', variant: 'destructive' });
    }
  };

  const openSaveModal = () => {
    setIsSaveModalOpen(true);
  };

  const handleSave = async () => {
    const canvas = document.getElementById('email-canvas');
    const html = canvas?.innerHTML || '';
    if (!html || html.includes('canvas-empty-state')) {
      toast({ title: 'Aviso', description: 'O canvas está vazio. Crie um e-mail antes de salvar.', variant: 'destructive' });
      return;
    }
    if (!templateName.trim()) {
      toast({ title: 'Aviso', description: 'Informe um nome para o template.', variant: 'destructive' });
      return;
    }
    try {
      const fullHtml = buildFullHtml(html);
      if (editingTemplateId) {
        await api.updateEmailTemplate(editingTemplateId, {
          name: templateName,
          subject: templateSubject,
          html: fullHtml,
          category: templateCategory,
          description: templateDescription,
        });
        toast({ title: 'Sucesso', description: 'Template atualizado com sucesso' });
      } else {
        const created = await api.createEmailTemplate({
          name: templateName,
          subject: templateSubject,
          html: fullHtml,
          category: templateCategory,
          description: templateDescription,
        });
        setEditingTemplateId(created.id);
        toast({ title: 'Sucesso', description: 'Template salvo com sucesso' });
      }
      setIsSaveModalOpen(false);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Falha ao salvar template', variant: 'destructive' });
    }
  };

  const openSendModal = async () => {
    await loadTemplates();
    await checkConnection();
    resetSendForm();
    setIsSendModalOpen(true);
  };

  const handleSend = async () => {
    if (!selectedTemplateId) {
      toast({ title: 'Aviso', description: 'Selecione um template para enviar.', variant: 'destructive' });
      return;
    }
    if (!sendTo.trim()) {
      toast({ title: 'Aviso', description: 'Informe o e-mail do destinatário.', variant: 'destructive' });
      return;
    }
    try {
      const variables: Record<string, string> = {};
      if (sendVariables.trim()) {
        try {
          Object.assign(variables, JSON.parse(sendVariables));
        } catch {
          toast({ title: 'Erro', description: 'Variáveis devem estar em formato JSON válido.', variant: 'destructive' });
          return;
        }
      }
      await api.sendEmailTemplate({
        templateId: selectedTemplateId,
        to: sendTo,
        subject: sendSubject || undefined,
        variables: Object.keys(variables).length > 0 ? variables : undefined,
      });
      toast({ title: 'Sucesso', description: 'E-mail enviado com sucesso!' });
      setIsSendModalOpen(false);
      resetSendForm();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Falha ao enviar e-mail', variant: 'destructive' });
    }
  };

  const resetSaveForm = () => {
    setTemplateName('');
    setTemplateSubject('');
    setTemplateDescription('');
    setTemplateCategory('custom');
    setEditingTemplateId(null);
  };

  const resetSendForm = () => {
    setSendTo('');
    setSendSubject('');
    setSendVariables('');
    setSelectedTemplateId(null);
  };

  const canvasRef = (node: HTMLDivElement | null) => {
    if (node && !builderInitialized.current) {
      builderInitialized.current = true;
      initEmailBuilder();
    }
  };

  function buildFullHtml(canvasContent: string): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-mail</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    table { border-collapse: collapse; }
    img { max-width: 100%; height: auto; }
    .email-wrapper { width: 100%; background-color: #f4f4f7; padding: 20px 0; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <div class="email-container">
            ${canvasContent}
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
  }

  function extractCanvasContent(html: string): string {
    const match = html.match(/<div class="email-container">([\s\S]*?)<\/div>\s*<\/td>\s*<\/tr>/);
    if (match) return match[1];
    const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
    if (bodyMatch) return bodyMatch[1];
    return html;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const listActions = (
    <Button onClick={handleNewTemplate} className="flex items-center gap-2">
      <Plus className="w-4 h-4" /> Novo Template
    </Button>
  );

  const editorActions = (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={handleBackToList} className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Meus Templates
      </Button>
      {editingTemplateId && templateName && (
        <span className="text-sm text-muted-foreground hidden md:block">Editando: <strong>{templateName}</strong></span>
      )}
      <Button variant="outline" onClick={openSaveModal} className="flex items-center gap-2">
        <Save className="w-4 h-4" />
        {editingTemplateId ? 'Atualizar Template' : 'Salvar Template'}
      </Button>
      <Button onClick={openSendModal} className="flex items-center gap-2">
        <Send className="w-4 h-4" /> Enviar
      </Button>
    </div>
  );

  return (
    <AdminLayout
      title={view === 'list' ? 'Templates de E-mail' : 'Editor de E-mail'}
      subtitle={view === 'list' ? 'Gerencie e crie templates de e-mail responsivos.' : 'Crie templates responsivos arrastando e soltando blocos.'}
      actions={view === 'list' ? listActions : editorActions}
    >
      {/* Template list view */}
      {view === 'list' && (
        <div className="space-y-4">
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum template criado</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Crie seu primeiro template de e-mail usando o editor visual com drag & drop.
              </p>
              <Button onClick={handleNewTemplate} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Criar Primeiro Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((t) => (
                <div key={t.id} className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{t.name}</h4>
                      {t.subject && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">Assunto: {t.subject}</p>
                      )}
                    </div>
                    <Badge variant={CATEGORY_COLORS[t.category] as any || 'secondary'} className="flex-shrink-0 text-xs">
                      {CATEGORY_LABELS[t.category] || t.category}
                    </Badge>
                  </div>

                  {t.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-2 border-t">
                    <FileText className="w-3 h-3" />
                    <span>Atualizado em {formatDate(t.updatedAt)}</span>
                    {!t.active && (
                      <Badge variant="destructive" className="ml-auto text-xs">Inativo</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 flex items-center gap-1"
                      onClick={() => handleEditTemplate(t)}
                    >
                      <Pencil className="w-3 h-3" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => { setSelectedTemplateId(t.id); openSendModal(); }}
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive flex items-center gap-1"
                      onClick={() => confirmDeleteTemplate(t.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Email builder canvas — always in DOM for correct initialization */}
      <div style={{ display: view === 'editor' ? 'block' : 'none', height: 'calc(100vh - 120px)', marginTop: view === 'editor' ? 0 : 0 }}>
        <EmailBuilderCore canvasRef={canvasRef} />
      </div>

      {/* Save / Update Modal */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTemplateId ? 'Atualizar Template' : 'Salvar Template'}</DialogTitle>
            <DialogDescription>
              {editingTemplateId ? 'Atualize as informações do template.' : 'Preencha as informações do novo template.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="tpl-name">Nome do Template *</Label>
              <Input
                id="tpl-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Promoção de Aniversário"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tpl-subject">Assunto Padrão</Label>
              <Input
                id="tpl-subject"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
                placeholder="Ex: Aproveite nossos descontos exclusivos!"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tpl-category">Categoria</Label>
              <Select value={templateCategory} onValueChange={setTemplateCategory}>
                <SelectTrigger id="tpl-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Personalizado</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="transactional">Transacional</SelectItem>
                  <SelectItem value="notification">Notificação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tpl-desc">Descrição (opcional)</Label>
              <Textarea
                id="tpl-desc"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Breve descrição do template..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {editingTemplateId ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Modal */}
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar E-mail</DialogTitle>
            <DialogDescription>Envie um template para um destinatário de teste.</DialogDescription>
          </DialogHeader>
          {connectInfo && !connectInfo.hasConnection && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {connectInfo.message}
            </div>
          )}
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Template</Label>
              <Select value={selectedTemplateId?.toString() || ''} onValueChange={(v) => setSelectedTemplateId(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="send-to">Destinatário *</Label>
              <Input
                id="send-to"
                type="email"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="send-subject">Assunto (opcional)</Label>
              <Input
                id="send-subject"
                value={sendSubject}
                onChange={(e) => setSendSubject(e.target.value)}
                placeholder="Deixe vazio para usar o assunto do template"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="send-vars">Variáveis (JSON, opcional)</Label>
              <Textarea
                id="send-vars"
                value={sendVariables}
                onChange={(e) => setSendVariables(e.target.value)}
                placeholder={'{"nome": "João", "cupom_nome": "PROMO10"}'}
                rows={3}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSend} disabled={isLoadingConnectInfo} className="flex items-center gap-2">
              {isLoadingConnectInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Template</DialogTitle>
            <DialogDescription>Esta ação não pode ser desfeita. O template será excluído permanentemente.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteTemplate} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
