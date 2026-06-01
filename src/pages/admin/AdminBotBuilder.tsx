import React, { useCallback, useRef, useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
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
import { BotBuilderSidebar, AutoConnectOptions } from '@/components/bot-builder/BotBuilderSidebar';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlow = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/bot-flows`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const flow = await res.json();
          if (flow && flow.nodes) {
            setNodes(flow.nodes);
            setEdges(flow.edges || []);
          }
        }
      } catch (err) {
        console.error('Error fetching flow:', err);
      }
    };
    fetchFlow();
  }, [setNodes, setEdges]);

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
      
      const autoConnectStr = event.dataTransfer.getData('application/reactflow-autoconnect');
      const conditionHandle = event.dataTransfer.getData('application/reactflow-conditionhandle');
      const autoConnect = autoConnectStr === 'true';

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = getId();
      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: {}, // Initialize with empty data
      };

      let sourceNode: Node | undefined;
      if (autoConnect) {
        sourceNode = reactFlowInstance.getNodes().find((n) => n.selected);
      }

      setNodes((nds) => {
        const newNodes = nds.map(n => ({...n, selected: false}));
        return newNodes.concat({...newNode, selected: true});
      });

      if (sourceNode && autoConnect) {
        const newEdge: Edge = {
          id: `e-${sourceNode.id}-${newNodeId}`,
          source: sourceNode.id,
          target: newNodeId,
          animated: true,
        };

        if (sourceNode.type === 'conditionNode') {
          newEdge.sourceHandle = conditionHandle;
        }

        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [reactFlowInstance, setNodes, setEdges],
  );

  const handleAddNode = useCallback((type: string, options: AutoConnectOptions) => {
    if (!reactFlowInstance) return;
    
    let sourceNode: Node | undefined;
    const allNodes = reactFlowInstance.getNodes();
    
    if (options.enabled) {
      sourceNode = allNodes.find((n) => n.selected);
    }

    const newNodeId = getId();
    let position = { x: 250, y: 100 };
    
    if (sourceNode) {
      position = {
        x: sourceNode.position.x,
        y: sourceNode.position.y + 150,
      };
    } else {
      const { x, y, zoom } = reactFlowInstance.getViewport();
      position = { x: -x / zoom + 250, y: -y / zoom + 100 };
    }

    const newNode: Node = {
      id: newNodeId,
      type,
      position,
      data: {},
    };

    setNodes((nds) => {
       const newNodes = nds.map(n => ({...n, selected: false}));
       return newNodes.concat({...newNode, selected: true});
    });

    if (sourceNode && options.enabled) {
      const newEdge: Edge = {
        id: `e-${sourceNode.id}-${newNodeId}`,
        source: sourceNode.id,
        target: newNodeId,
        animated: true,
      };

      if (sourceNode.type === 'conditionNode') {
        newEdge.sourceHandle = options.conditionHandle;
      }

      setEdges((eds) => addEdge(newEdge, eds));
    }
  }, [reactFlowInstance, setNodes, setEdges]);

  const onSave = useCallback(async () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/bot-flows`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nodes: flow.nodes,
            edges: flow.edges,
            isActive: false,
          })
        });
        
        if (res.ok) {
          toast.success('Fluxo salvo com sucesso!');
          navigate('/admin/bot-builder');
        } else {
          toast.error('Erro ao salvar fluxo.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Erro de conexão.');
      }
    }
  }, [reactFlowInstance, navigate]);

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
        <BotBuilderSidebar onAddNode={handleAddNode} />
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
