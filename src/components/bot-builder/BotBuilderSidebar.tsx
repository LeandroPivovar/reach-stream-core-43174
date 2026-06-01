import React from 'react';
import { MessageSquare, Image as ImageIcon, Clock, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const BotBuilderSidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="w-64 h-full rounded-none border-r border-y-0 border-l-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader>
        <CardTitle className="text-lg">Nós do Fluxo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Arraste os nós para a área de edição.
        </div>
        
        <div
          className="flex items-center gap-3 p-3 border rounded-md cursor-grab active:cursor-grabbing hover:bg-accent transition-colors"
          onDragStart={(event) => onDragStart(event, 'messageNode')}
          draggable
        >
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <span className="font-medium">Mensagem</span>
        </div>

        <div
          className="flex items-center gap-3 p-3 border rounded-md cursor-grab active:cursor-grabbing hover:bg-accent transition-colors"
          onDragStart={(event) => onDragStart(event, 'conditionNode')}
          draggable
        >
          <GitBranch className="w-5 h-5 text-purple-500" />
          <span className="font-medium">Condicional</span>
        </div>

        <div
          className="flex items-center gap-3 p-3 border rounded-md cursor-grab active:cursor-grabbing hover:bg-accent transition-colors"
          onDragStart={(event) => onDragStart(event, 'imageNode')}
          draggable
        >
          <ImageIcon className="w-5 h-5 text-green-500" />
          <span className="font-medium">Imagem</span>
        </div>

        <div
          className="flex items-center gap-3 p-3 border rounded-md cursor-grab active:cursor-grabbing hover:bg-accent transition-colors"
          onDragStart={(event) => onDragStart(event, 'delayNode')}
          draggable
        >
          <Clock className="w-5 h-5 text-orange-500" />
          <span className="font-medium">Delay</span>
        </div>
      </CardContent>
    </Card>
  );
};
