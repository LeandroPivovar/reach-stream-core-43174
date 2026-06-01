import { memo } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export const MessageNode = memo(({ id, data }: { id: string; data: any }) => {
  const { updateNodeData } = useReactFlow();

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { message: evt.target.value });
  };

  const onUseAiChange = (checked: boolean) => {
    updateNodeData(id, { useAi: checked });
  };

  return (
    <div className="bg-background border-2 border-blue-500 rounded-xl shadow-md min-w-[250px] overflow-hidden">
      <div className="bg-blue-500/10 p-3 border-b flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-blue-500" />
        <span className="font-semibold text-sm">Mensagem</span>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <Label htmlFor={`ai-${id}`} className="text-xs cursor-pointer">Gerar com IA (Gemini)</Label>
          </div>
          <Switch
            id={`ai-${id}`}
            checked={Boolean(data.useAi)}
            onCheckedChange={onUseAiChange}
            className="nodrag"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`msg-${id}`} className="text-xs text-muted-foreground">
            {data.useAi ? 'Instrução / contexto para a IA' : 'Texto da Mensagem'}
          </Label>
          <Textarea 
            id={`msg-${id}`}
            placeholder={data.useAi ? 'Ex: Responda como vendedor amigável...' : 'Digite a mensagem...'}
            className="resize-none min-h-[80px] text-sm nodrag"
            value={data.message || ''}
            onChange={onChange}
          />
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
});

MessageNode.displayName = 'MessageNode';
