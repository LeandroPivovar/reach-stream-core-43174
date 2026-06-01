import { memo } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const DelayNode = memo(({ id, data }: { id: string; data: any }) => {
  const { updateNodeData } = useReactFlow();

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { delayTime: evt.target.value });
  };

  return (
    <div className="bg-background border-2 border-orange-500 rounded-xl shadow-md min-w-[200px] overflow-hidden">
      <div className="bg-orange-500/10 p-3 border-b flex items-center gap-2">
        <Clock className="w-4 h-4 text-orange-500" />
        <span className="font-semibold text-sm">Delay</span>
      </div>
      
      <div className="p-4 space-y-2">
        <Label htmlFor={`delay-${id}`} className="text-xs text-muted-foreground">Tempo (segundos)</Label>
        <Input 
          id={`delay-${id}`}
          type="number"
          min="0"
          placeholder="Ex: 5" 
          className="text-sm h-8 nodrag"
          value={data.delayTime || ''}
          onChange={onChange}
        />
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500" />
    </div>
  );
});

DelayNode.displayName = 'DelayNode';
