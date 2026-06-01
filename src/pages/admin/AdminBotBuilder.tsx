import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { BotBuilderSidebar } from '@/components/bot-builder/BotBuilderSidebar';
import { MessageNode } from '@/components/bot-builder/nodes/MessageNode';
import { ConditionNode } from '@/components/bot-builder/nodes/ConditionNode';
import { ImageNode } from '@/components/bot-builder/nodes/ImageNode';
import { DelayNode } from '@/components/bot-builder/nodes/DelayNode';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const nodeTypes = {
  messageNode: MessageNode,
  conditionNode: ConditionNode,
  imageNode: ImageNode,
  delayNode: DelayNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const BotBuilderFlow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: {}, // Initialize with empty data
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      console.log('Flow saved:', flow);
      toast.success('Fluxo salvo com sucesso! (Console log)');
      // Aqui entraria a chamada para a API no futuro
    }
  }, [reactFlowInstance]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Construtor de Fluxo</h1>
          <p className="text-muted-foreground">Arraste os nós para criar o fluxo do bot do WhatsApp.</p>
        </div>
        <Button onClick={onSave} className="gap-2">
          <Save className="w-4 h-4" />
          Salvar Fluxo
        </Button>
      </div>
      
      <div className="flex-1 flex flex-row overflow-hidden" ref={reactFlowWrapper}>
        <BotBuilderSidebar />
        <div className="flex-grow h-full bg-slate-50 dark:bg-slate-900/50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="react-flow-bot-builder"
          >
            <Controls />
            <MiniMap 
              zoomable 
              pannable 
              className="bg-background border rounded-lg shadow-sm"
              maskColor="rgba(var(--background), 0.5)"
            />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default function AdminBotBuilder() {
  return (
    <AdminLayout>
      <div className="h-[calc(100vh-theme(spacing.16))] w-full m-[-2rem] w-[calc(100%+4rem)]">
        <ReactFlowProvider>
          <BotBuilderFlow />
        </ReactFlowProvider>
      </div>
    </AdminLayout>
  );
}
