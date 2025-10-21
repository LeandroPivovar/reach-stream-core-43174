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
  Settings
} from 'lucide-react';

export interface WorkflowStep {
  id: string;
  type: 'email' | 'sms' | 'delay' | 'condition';
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
      case 'delay':
        return <Clock className="w-5 h-5 text-purple-500" />;
      case 'condition':
        return <GitBranch className="w-5 h-5 text-green-500" />;
    }
  };

  const getStepTitle = (step: WorkflowStep) => {
    switch (step.type) {
      case 'email':
        return 'Enviar E-mail';
      case 'sms':
        return 'Enviar SMS';
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
    <div className="space-y-4">
      {/* Workflow Steps */}
      <div className="space-y-3">
        {workflow.map((step, index) => (
          <div key={step.id} className="relative">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{getStepTitle(step)}</h4>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === workflow.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditDialog(step)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeStep(step.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getStepDescription(step)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Connection Line */}
            {index < workflow.length - 1 && (
              <div className="flex justify-center my-2">
                <div className="w-0.5 h-4 bg-border"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Step Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="p-4 cursor-pointer hover:border-primary transition-colors"
          onClick={() => addStep('email')}
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium">Enviar E-mail</span>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:border-primary transition-colors"
          onClick={() => addStep('sms')}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Enviar SMS</span>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:border-primary transition-colors"
          onClick={() => addStep('delay')}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium">Aguardar</span>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:border-primary transition-colors"
          onClick={() => addStep('condition')}
        >
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Condição</span>
          </div>
        </Card>
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
