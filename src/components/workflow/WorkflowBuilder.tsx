import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/dialog';
import {
  Mail,
  MessageSquare,
  Clock,
  GitBranch,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  Phone,
  ArrowDown
} from 'lucide-react';

export interface WorkflowStep {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'delay' | 'condition';
  action?: 'send';
  delay?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
  rule?: 'opened_email' | 'clicked_link' | 'purchased' | 'not_opened';
  subject?: string;
  content?: string;
  trueSteps?: WorkflowStep[];
  falseSteps?: WorkflowStep[];
}

interface WorkflowBuilderProps {
  workflow: WorkflowStep[];
  onChange: (workflow: WorkflowStep[]) => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  onChange,
}) => {
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type,
      ...(type === 'email' && { action: 'send', subject: '', content: '' }),
      ...(type === 'sms' && { action: 'send', content: '' }),
      ...(type === 'whatsapp' && { action: 'send', content: '' }),
      ...(type === 'delay' && { delay: 1, delayUnit: 'days' }),
      ...(type === 'condition' && { rule: 'opened_email', trueSteps: [], falseSteps: [] }),
    };
    onChange([...workflow, newStep]);
  };

  const removeStep = (id: string) => {
    onChange(workflow.filter(step => step.id !== id));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newWorkflow = [...workflow];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < workflow.length) {
      [newWorkflow[index], newWorkflow[targetIndex]] = [newWorkflow[targetIndex], newWorkflow[index]];
      onChange(newWorkflow);
    }
  };

  const updateStep = (id: string, updates: Partial<WorkflowStep>) => {
    onChange(
      workflow.map(step =>
        step.id === id ? { ...step, ...updates } : step
      )
    );
  };

  const openEditDialog = (step: WorkflowStep) => {
    setEditingStep(step);
    setIsDialogOpen(true);
  };

  const saveEditedStep = () => {
    if (editingStep) {
      updateStep(editingStep.id, editingStep);
      setIsDialogOpen(false);
      setEditingStep(null);
    }
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-orange-500" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'whatsapp':
        return <Phone className="w-5 h-5 text-green-500" />;
      case 'delay':
        return <Clock className="w-5 h-5 text-purple-500" />;
      case 'condition':
        return <GitBranch className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStepTitle = (step: WorkflowStep) => {
    switch (step.type) {
      case 'email':
        return 'Enviar E-mail';
      case 'sms':
        return 'Enviar SMS';
      case 'whatsapp':
        return 'Enviar WhatsApp';
      case 'delay':
        return `Aguardar ${step.delay} ${step.delayUnit === 'minutes' ? 'minuto(s)' : step.delayUnit === 'hours' ? 'hora(s)' : 'dia(s)'}`;
      case 'condition':
        return 'Condição';
    }
  };

  const getStepDescription = (step: WorkflowStep) => {
    switch (step.type) {
      case 'email':
        return step.subject || 'Sem assunto definido';
      case 'sms':
        return step.content?.substring(0, 50) || 'Sem conteúdo definido';
      case 'whatsapp':
        return step.content?.substring(0, 50) || 'Sem conteúdo definido';
      case 'delay':
        return 'Pausa na automação';
      case 'condition':
        const ruleText = {
          opened_email: 'Se abriu o e-mail',
          clicked_link: 'Se clicou no link',
          purchased: 'Se realizou compra',
          not_opened: 'Se não abriu o e-mail'
        }[step.rule || 'opened_email'];
        return ruleText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Empty State */}
      {workflow.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Comece seu workflow</h3>
              <p className="text-sm text-muted-foreground">
                Adicione blocos abaixo para criar sua automação
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Workflow Steps */}
      <div className="space-y-0">
        {workflow.map((step, index) => (
          <div key={step.id} className="relative">
            <Card className="p-5 hover:border-primary/50 transition-colors bg-gradient-to-br from-card to-card/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {getStepIcon(step.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-base">{getStepTitle(step)}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {getStepDescription(step)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        title="Mover para cima"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === workflow.length - 1}
                        title="Mover para baixo"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(step)}
                        title="Configurar"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeStep(step.id)}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Connection Line with Arrow */}
            {index < workflow.length - 1 && (
              <div className="flex flex-col items-center py-3">
                <div className="w-0.5 h-6 bg-gradient-to-b from-primary/50 to-primary/20"></div>
                <ArrowDown className="w-4 h-4 text-primary/50 -mt-1" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Step Buttons */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Bloco
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card
            className="p-4 cursor-pointer hover:border-orange-500 hover:bg-orange-500/5 transition-all group"
            onClick={() => addStep('email')}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <Mail className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-medium">E-mail</span>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
            onClick={() => addStep('sms')}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm font-medium">SMS</span>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:border-green-500 hover:bg-green-500/5 transition-all group"
            onClick={() => addStep('whatsapp')}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Phone className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm font-medium">WhatsApp</span>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:border-purple-500 hover:bg-purple-500/5 transition-all group"
            onClick={() => addStep('delay')}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm font-medium">Aguardar</span>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all group"
            onClick={() => addStep('condition')}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <GitBranch className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm font-medium">Condição</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Step Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar Passo</DialogTitle>
          </DialogHeader>

          {editingStep && (
            <div className="space-y-4 py-4">
              {/* Email Configuration */}
              {editingStep.type === 'email' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="email-subject">Assunto do E-mail</Label>
                    <Input
                      id="email-subject"
                      value={editingStep.subject || ''}
                      onChange={(e) =>
                        setEditingStep({ ...editingStep, subject: e.target.value })
                      }
                      placeholder="Digite o assunto..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email-content">Conteúdo</Label>
                    <textarea
                      id="email-content"
                      value={editingStep.content || ''}
                      onChange={(e) =>
                        setEditingStep({ ...editingStep, content: e.target.value })
                      }
                      placeholder="Digite o conteúdo do e-mail..."
                      rows={6}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </>
              )}

              {/* SMS Configuration */}
              {editingStep.type === 'sms' && (
                <div className="grid gap-2">
                  <Label htmlFor="sms-content">Mensagem SMS</Label>
                  <textarea
                    id="sms-content"
                    value={editingStep.content || ''}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, content: e.target.value })
                    }
                    placeholder="Digite a mensagem..."
                    rows={4}
                    maxLength={160}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    {(editingStep.content || '').length}/160 caracteres
                  </p>
                </div>
              )}

              {/* WhatsApp Configuration */}
              {editingStep.type === 'whatsapp' && (
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp-content">Mensagem WhatsApp</Label>
                  <textarea
                    id="whatsapp-content"
                    value={editingStep.content || ''}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, content: e.target.value })
                    }
                    placeholder="Digite a mensagem..."
                    rows={6}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}

              {/* Delay Configuration */}
              {editingStep.type === 'delay' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="delay-value">Duração</Label>
                    <Input
                      id="delay-value"
                      type="number"
                      min="1"
                      value={editingStep.delay || 1}
                      onChange={(e) =>
                        setEditingStep({
                          ...editingStep,
                          delay: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="delay-unit">Unidade</Label>
                    <Select
                      value={editingStep.delayUnit || 'days'}
                      onValueChange={(value: 'minutes' | 'hours' | 'days') =>
                        setEditingStep({ ...editingStep, delayUnit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutos</SelectItem>
                        <SelectItem value="hours">Horas</SelectItem>
                        <SelectItem value="days">Dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Condition Configuration */}
              {editingStep.type === 'condition' && (
                <div className="grid gap-2">
                  <Label htmlFor="condition-rule">Condição</Label>
                  <Select
                    value={editingStep.rule || 'opened_email'}
                    onValueChange={(value: WorkflowStep['rule']) =>
                      setEditingStep({ ...editingStep, rule: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opened_email">Se abriu o e-mail</SelectItem>
                      <SelectItem value="clicked_link">Se clicou no link</SelectItem>
                      <SelectItem value="purchased">Se realizou compra</SelectItem>
                      <SelectItem value="not_opened">Se não abriu o e-mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveEditedStep}>Salvar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
