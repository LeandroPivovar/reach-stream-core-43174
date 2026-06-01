import { memo } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Brain } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const ContextNode = memo(({ id, data }: { id: string; data: any }) => {
  const { updateNodeData } = useReactFlow();

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { context: evt.target.value });
  };

  return (
    <div className="bg-background border-2 border-violet-500 rounded-xl shadow-md min-w-[280px] overflow-hidden">
      <div className="bg-violet-500/10 p-3 border-b flex items-center gap-2">
        <Brain className="w-4 h-4 text-violet-500" />
        <span className="font-semibold text-sm">Contextualização</span>
      </div>

      <div className="p-4 space-y-2">
        <Label htmlFor={`ctx-${id}`} className="text-xs text-muted-foreground">
          Instruções gerais para a IA
        </Label>
        <Textarea
          id={`ctx-${id}`}
          placeholder="Ex: Você é assistente de vendas da loja X. Seja cordial, responda sobre produtos e preços..."
          className="resize-none min-h-[100px] text-sm nodrag"
          value={data.context || ''}
          onChange={onChange}
        />
        <p className="text-[10px] text-muted-foreground leading-snug">
          Não envia mensagem ao usuário. Define o comportamento geral do bot para todos os nós com IA.
        </p>
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-violet-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-violet-500" />
    </div>
  );
});

ContextNode.displayName = 'ContextNode';
