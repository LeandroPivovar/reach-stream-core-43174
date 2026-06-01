import { memo } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ConditionNode = memo(({ id, data }: { id: string; data: any }) => {
  const { updateNodeData } = useReactFlow();

  const onConditionChange = (value: string) => {
    updateNodeData(id, { conditionType: value });
  };

  const onValueChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { conditionValue: evt.target.value });
  };

  return (
    <div className="bg-background border-2 border-purple-500 rounded-xl shadow-md min-w-[280px] overflow-visible">
      <div className="bg-purple-500/10 p-3 border-b flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-purple-500" />
        <span className="font-semibold text-sm">Condicional</span>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Verificar resposta</Label>
          <Select 
            value={data.conditionType || 'contains'} 
            onValueChange={onConditionChange}
          >
            <SelectTrigger className="w-full text-sm h-8">
              <SelectValue placeholder="Tipo de condição" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contains">Contém</SelectItem>
              <SelectItem value="equals">É exatamente igual a</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`val-${id}`} className="text-xs text-muted-foreground">Valor esperado</Label>
          <Input 
            id={`val-${id}`}
            placeholder="Ex: sim" 
            className="text-sm h-8 nodrag"
            value={data.conditionValue || ''}
            onChange={onValueChange}
          />
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      
      {/* Verdadeiro */}
      <div className="relative">
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="true"
          style={{ left: '30%', background: '#22c55e' }}
          className="w-3 h-3"
        />
        <div className="absolute -bottom-6 left-[30%] -translate-x-1/2 text-[10px] font-bold text-green-500">
          V
        </div>
      </div>

      {/* Falso */}
      <div className="relative">
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="false"
          style={{ left: '70%', background: '#ef4444' }}
          className="w-3 h-3"
        />
        <div className="absolute -bottom-6 left-[70%] -translate-x-1/2 text-[10px] font-bold text-red-500">
          F
        </div>
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';
