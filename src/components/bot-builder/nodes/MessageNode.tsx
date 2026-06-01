import { memo } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const MessageNode = memo(({ id, data }: { id: string; data: any }) => {
  const { updateNodeData } = useReactFlow();

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { message: evt.target.value });
  };

  return (
    <div className="bg-background border-2 border-blue-500 rounded-xl shadow-md min-w-[250px] overflow-hidden">
      <div className="bg-blue-500/10 p-3 border-b flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-blue-500" />
        <span className="font-semibold text-sm">Mensagem</span>
      </div>
      
      <div className="p-4 space-y-2">
        <Label htmlFor={`msg-${id}`} className="text-xs text-muted-foreground">Texto da Mensagem</Label>
        <Textarea 
          id={`msg-${id}`}
          placeholder="Digite a mensagem..." 
          className="resize-none min-h-[80px] text-sm nodrag"
          value={data.message || ''}
          onChange={onChange}
        />
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
});

MessageNode.displayName = 'MessageNode';
