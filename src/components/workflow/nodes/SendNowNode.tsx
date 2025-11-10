import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';

interface SendNowNodeData {
  label: string;
}

export const SendNowNode: React.FC<{ data: SendNowNodeData }> = ({ data }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#22c55e' }} />
      <Card className="w-64 p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <Send className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Enviar Agora</h3>
            <p className="text-xs text-muted-foreground">Início imediato</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-background/50 rounded-md border">
          <p className="text-xs text-muted-foreground">
            A campanha será enviada imediatamente após a criação
          </p>
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} style={{ background: '#22c55e' }} />
    </>
  );
};
