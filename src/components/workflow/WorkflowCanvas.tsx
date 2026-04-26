import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Mail, MessageSquare, Phone, Clock, GitBranch, Send, Calendar, Tag, Gift, Eraser } from 'lucide-react';
import { EmailNode } from './nodes/EmailNode';
import { SmsNode } from './nodes/SmsNode';
import { WhatsappNode } from './nodes/WhatsappNode';
import { DelayNode } from './nodes/DelayNode';
import { ConditionNode } from './nodes/ConditionNode';
import { SendNowNode } from './nodes/SendNowNode';
import { ScheduleNode } from './nodes/ScheduleNode';
import { CouponNode } from './nodes/CouponNode';
import { GiftbackNode } from './nodes/GiftbackNode';

export interface WorkflowStep {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'delay' | 'condition' | 'sendnow' | 'schedule' | 'coupon' | 'giftback';
  action?: 'send';
  delay?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
  rule?: 'opened_email' | 'clicked_link' | 'purchased' | 'not_opened';
  subject?: string;
  content?: string;
  scheduleDate?: Date;
  scheduleTime?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: string;
  couponName?: string;
  giftbackValue?: string;
  minPurchaseValue?: string;
  expirationDays?: string;
  trueSteps?: WorkflowStep[];
  falseSteps?: WorkflowStep[];
}

interface WorkflowCanvasProps {
  workflow: any;
  onChange: (workflow: any) => void;
  twilioConfigured?: boolean;
  whatsappLimit?: number | boolean;
  whatsappSent?: number;
  onBuyCredits?: () => void;
  onOpenTemplateModal?: () => void;
}

const nodeTypes: NodeTypes = {
  email: EmailNode,
  sms: SmsNode,
  whatsapp: WhatsappNode,
  delay: DelayNode,
  condition: ConditionNode,
  sendnow: SendNowNode,
  schedule: ScheduleNode,
  coupon: CouponNode,
  giftback: GiftbackNode,
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  onChange,
  twilioConfigured = true,
  whatsappLimit,
  whatsappSent = 0,
  onBuyCredits,
  onOpenTemplateModal,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.edges || []);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [nodeIdCounter, setNodeIdCounter] = useState(() => {
    // Initialize counter based on existing nodes
    const maxId = (workflow?.nodes || []).reduce((max: number, node: any) => {
      if (node.id.startsWith('node-')) {
        const idNum = parseInt(node.id.replace('node-', ''));
        return !isNaN(idNum) && idNum > max ? idNum : max;
      }
      return max;
    }, 0);
    return maxId + 1;
  });

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    // Omit non-serializable data when passing up
    const cleanNodes = nodes.map(node => {
      const { onUpdate, onDelete, ...cleanData } = node.data as any;
      return { ...node, data: cleanData };
    });
    onChangeRef.current({ nodes: cleanNodes, edges });
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#7255F7', strokeWidth: 2 } }, eds));
    },
    [setEdges]
  );

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      
      if (!sourceNode || !targetNode) return false;

      // Bloquear conexão entre nós de início ("Enviar Agora" e "Agendar")
      const isStartNode = (type: string) => type === 'sendnow' || type === 'schedule';
      if (isStartNode(sourceNode.type as string) && isStartNode(targetNode.type as string)) {
        return false;
      }
      
      return true;
    },
    [nodes]
  );

  const addNode = (type: WorkflowStep['type']) => {
    if (type === 'whatsapp') {
      const hasCredits = whatsappLimit === true || whatsappLimit === -1 || (Number(whatsappLimit || 0) - (whatsappSent || 0)) > 0;
      if (!hasCredits) {
        if (onBuyCredits) {
          onBuyCredits();
        }
        return;
      }
    }

    const id = `node-${nodeIdCounter}`;
    const newNode: Node = {
      id,
      type,
      position: { x: 250, y: nodes.length * 150 + 50 },
      data: {
        label: type,
      },
      selected: true,
    };

    // Use current selection as anchor, or fallback to last node
    const selectedNode = nodes.find(n => n.selected);
    const lastNode = selectedNode || (nodes.length > 0 ? nodes[nodes.length - 1] : null);

    // Safety check: prohibit adding sendnow if last is schedule, and vice versa
    if (type === 'sendnow' && lastNode?.type === 'schedule') return;
    if (type === 'schedule' && lastNode?.type === 'sendnow') return;

    // Deselect all nodes and add the new one
    setNodes((nds) => [...nds.map(n => ({ ...n, selected: false })), newNode]);

    if (lastNode) {
      const sourceHandle = (lastNode.type === 'condition')
        ? String((lastNode.data as any).selectedBranch || 'true')
        : undefined;

      const newEdge: Edge = {
        id: `edge-${lastNode.id}-${id}`,
        source: lastNode.id,
        target: id,
        sourceHandle,
        animated: true,
        style: { stroke: '#7255F7', strokeWidth: 2 },
      };
      setEdges((eds) => [...eds, newEdge]);
    }

    setNodeIdCounter(nodeIdCounter + 1);
  };

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const nodesWithHandlers = React.useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onUpdate: (data: any) => updateNodeData(node.id, data),
        onDelete: () => deleteNode(node.id),
        onOpenTemplateModal,
      },
    }));
  }, [nodes, updateNodeData, deleteNode]);

  const activeNode = nodes.find(n => n.selected) || (nodes.length > 0 ? nodes[nodes.length - 1] : null);
  const isSendNowDisabled = activeNode?.type === 'schedule';
  const isScheduleDisabled = activeNode?.type === 'sendnow';

  return (
    <div className="flex flex-col gap-4 h-[600px]">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold mr-2">Início:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('sendnow')}
              disabled={isSendNowDisabled}
              className="gap-2"
            >
              <Send className="w-4 h-4 text-green-500" />
              Enviar Agora
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('schedule')}
              disabled={isScheduleDisabled}
              className="gap-2"
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              Agendar
            </Button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold mr-2">Mensagens:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('email')}
              className="gap-2"
            >
              <Mail className="w-4 h-4 text-orange-500" />
              E-mail
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('sms')}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4 text-blue-500" />
              SMS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('whatsapp')}
              className={cn(
                "gap-2",
                !(whatsappLimit === true || whatsappLimit === -1 || (Number(whatsappLimit || 0) - (whatsappSent || 0)) > 0) && "opacity-50 border-dashed"
              )}
            >
              <Phone className="w-4 h-4 text-green-500" />
              WhatsApp
              {!(whatsappLimit === true || whatsappLimit === -1 || (Number(whatsappLimit || 0) - (whatsappSent || 0)) > 0) && (
                <Badge variant="destructive" className="ml-1 text-[8px] h-3 px-1">Sem crédito</Badge>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold mr-2">Ações:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('coupon')}
              className="gap-2"
            >
              <Tag className="w-4 h-4 text-orange-500" />
              Cupom
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('giftback')}
              className="gap-2"
            >
              <Gift className="w-4 h-4 text-green-500" />
              Giftback
            </Button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold mr-2">Fluxo:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('delay')}
              className="gap-2"
            >
              <Clock className="w-4 h-4 text-purple-500" />
              Aguardar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('condition')}
              className="gap-2"
            >
              <GitBranch className="w-4 h-4 text-amber-500" />
              Condição
            </Button>
          </div>
          <div className="flex items-center gap-3 flex-wrap border-t pt-4">
            <span className="text-sm font-semibold mr-2">Ferramentas:</span>
            <Button
              variant={isDeleteMode ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsDeleteMode(!isDeleteMode)}
              className="gap-2"
            >
              <Eraser className="w-4 h-4" />
              {isDeleteMode ? "Modo Remoção Ativo (Clique na linha)" : "Ferramenta Tesoura (Remover Linhas)"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <div className="flex-1 border rounded-lg bg-background overflow-hidden">
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onEdgeClick={(_, edge) => {
            if (isDeleteMode) {
              setEdges((eds) => eds.filter((e) => e.id !== edge.id));
            }
          }}
          onEdgeDoubleClick={(_, edge) => {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
          }}
          deleteKeyCode={['Backspace', 'Delete']}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 50, y: 50, zoom: 0.45 }}
          minZoom={0.2}
          maxZoom={2}
          className={`bg-muted/30 ${isDeleteMode ? '!cursor-crosshair' : ''}`}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'email':
                  return '#f97316';
                case 'sms':
                  return '#3b82f6';
                case 'whatsapp':
                  return '#22c55e';
                case 'delay':
                  return '#a855f7';
                case 'condition':
                  return '#f59e0b';
                case 'sendnow':
                  return '#22c55e';
                case 'schedule':
                  return '#3b82f6';
                case 'coupon':
                  return '#f97316';
                case 'giftback':
                  return '#22c55e';
                default:
                  return '#7255F7';
              }
            }}
            className="!bg-background !border-border"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
