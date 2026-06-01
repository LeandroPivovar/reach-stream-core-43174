import React, { useState } from 'react';
import { MessageSquare, Image as ImageIcon, Clock, GitBranch, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AutoConnectOptions = {
  enabled: boolean;
  conditionHandle: string;
};

type BotBuilderSidebarProps = {
  onAddNode?: (type: string, autoConnectOptions: AutoConnectOptions) => void;
};

export const BotBuilderSidebar = ({ onAddNode }: BotBuilderSidebarProps) => {
  const [autoConnect, setAutoConnect] = useState(true);
  const [conditionHandle, setConditionHandle] = useState('true');

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/reactflow-autoconnect', autoConnect.toString());
    event.dataTransfer.setData('application/reactflow-conditionhandle', conditionHandle);
  };

  const handleNodeClick = (type: string) => {
    if (onAddNode) {
      onAddNode(type, { enabled: autoConnect, conditionHandle });
    }
  };

  return (
    <Card className="w-64 h-full flex flex-col rounded-none border-r border-y-0 border-l-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader>
        <CardTitle className="text-lg">Nós do Fluxo</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-6">
        
        <div className="space-y-3">
          <div className="text-sm font-medium">Adicionar Nó</div>
          <div className="text-xs text-muted-foreground mb-4">
            Clique para adicionar ou arraste para a área de edição.
          </div>
          
          <div
            className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors border-violet-200 dark:border-violet-900"
            onDragStart={(event) => onDragStart(event, 'contextNode')}
            onClick={() => handleNodeClick('contextNode')}
            draggable
          >
            <Brain className="w-5 h-5 text-violet-500" />
            <div>
              <span className="font-medium block">Contextualização</span>
              <span className="text-[10px] text-muted-foreground">Instruções gerais da IA</span>
            </div>
          </div>

          <div
            className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors"
            onDragStart={(event) => onDragStart(event, 'messageNode')}
            onClick={() => handleNodeClick('messageNode')}
            draggable
          >
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Mensagem</span>
          </div>

          <div
            className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors"
            onDragStart={(event) => onDragStart(event, 'conditionNode')}
            onClick={() => handleNodeClick('conditionNode')}
            draggable
          >
            <GitBranch className="w-5 h-5 text-purple-500" />
            <span className="font-medium">Condicional</span>
          </div>

          <div
            className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors"
            onDragStart={(event) => onDragStart(event, 'imageNode')}
            onClick={() => handleNodeClick('imageNode')}
            draggable
          >
            <ImageIcon className="w-5 h-5 text-green-500" />
            <span className="font-medium">Imagem</span>
          </div>

          <div
            className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors"
            onDragStart={(event) => onDragStart(event, 'delayNode')}
            onClick={() => handleNodeClick('delayNode')}
            draggable
          >
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="font-medium">Delay</span>
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <div className="text-sm font-medium">Auto-conectar</div>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-connect" className="text-xs cursor-pointer">Ligar ao selecionado</Label>
            <Switch 
              id="auto-connect" 
              checked={autoConnect} 
              onCheckedChange={setAutoConnect} 
            />
          </div>
          
          {autoConnect && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Saída p/ Condicional</Label>
              <Select value={conditionHandle} onValueChange={setConditionHandle}>
                <SelectTrigger className="w-full text-xs h-8">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Verdadeiro (Sim)</SelectItem>
                  <SelectItem value="false">Falso (Não)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
};
