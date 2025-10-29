import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { GitBranch, Settings, Trash2 } from 'lucide-react';

type RuleType = 'opened_email' | 'clicked_link' | 'purchased' | 'not_opened';

interface ConditionNodeData {
  rule?: RuleType;
  onUpdate: (data: { rule: RuleType }) => void;
  onDelete: () => void;
}

export const ConditionNode: React.FC<NodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [rule, setRule] = useState<RuleType>((data as any)?.rule || 'opened_email');

  const handleSave = () => {
    (data as any).onUpdate({ rule });
    setIsEditing(false);
  };

  const getRuleLabel = () => {
    const labels: Record<string, string> = {
      opened_email: 'Abriu e-mail',
      clicked_link: 'Clicou no link',
      purchased: 'Realizou compra',
      not_opened: 'Não abriu e-mail',
    };
    return labels[rule] || 'Condição';
  };

  return (
    <>
      <Card className="min-w-[200px] p-4 shadow-lg border-amber-500/50 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background hover:shadow-xl transition-shadow">
        <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-5 h-5 text-amber-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">Condição</h4>
            <p className="text-xs text-muted-foreground truncate">
              {getRuleLabel()}
            </p>
          </div>
        </div>

        <div className="flex gap-1 mt-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => (data as any).onDelete()}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="!bg-green-500 !w-3 !h-3 !-bottom-2 !left-[25%]"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="!bg-red-500 !w-3 !h-3 !-bottom-2 !left-[75%]"
        />
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Condição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="condition-rule">Condição</Label>
              <Select value={rule} onValueChange={(value) => setRule(value as RuleType)}>
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
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <p className="font-medium">Saídas:</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Esquerda: Condição verdadeira</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-muted-foreground">Direita: Condição falsa</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
