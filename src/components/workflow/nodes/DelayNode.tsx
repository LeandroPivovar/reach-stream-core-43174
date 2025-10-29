import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
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
import { Clock, Settings, Trash2 } from 'lucide-react';

interface DelayNodeData {
  delay?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
  onUpdate: (data: { delay: number; delayUnit: 'minutes' | 'hours' | 'days' }) => void;
  onDelete: () => void;
}

export const DelayNode: React.FC<NodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [delay, setDelay] = useState((data as any)?.delay || 1);
  const [delayUnit, setDelayUnit] = useState<'minutes' | 'hours' | 'days'>((data as any)?.delayUnit || 'days');

  const handleSave = () => {
    (data as any).onUpdate({ delay, delayUnit });
    setIsEditing(false);
  };

  const getDelayLabel = () => {
    const unitLabel = delayUnit === 'minutes' ? 'min' : delayUnit === 'hours' ? 'h' : 'd';
    return `${delay} ${unitLabel}`;
  };

  return (
    <>
      <Card className="min-w-[200px] p-4 shadow-lg border-purple-500/50 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background hover:shadow-xl transition-shadow">
        <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">Aguardar</h4>
            <p className="text-xs text-muted-foreground">
              {getDelayLabel()}
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
        
        <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Atraso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="delay-value">Duração</Label>
                <Input
                  id="delay-value"
                  type="number"
                  min="1"
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="delay-unit">Unidade</Label>
                <Select value={delayUnit} onValueChange={(value: any) => setDelayUnit(value)}>
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
