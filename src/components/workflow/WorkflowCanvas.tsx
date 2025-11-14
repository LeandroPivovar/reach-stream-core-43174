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
import { Mail, MessageSquare, Phone, Clock, GitBranch, Send, Calendar, Tag, Gift } from 'lucide-react';
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
  giftbackValue?: string;
  minPurchaseValue?: string;
  expirationDays?: string;
  trueSteps?: WorkflowStep[];
  falseSteps?: WorkflowStep[];
}

interface WorkflowCanvasProps {
  workflow: WorkflowStep[];
  onChange: (workflow: WorkflowStep[]) => void;
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
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#7255F7', strokeWidth: 2 } }, eds));
    },
    [setEdges]
  );

  const addNode = (type: WorkflowStep['type']) => {
    const id = `node-${nodeIdCounter}`;
    const newNode: Node = {
      id,
      type,
      position: { x: 250, y: nodes.length * 150 + 50 },
      data: {
        label: type,
        onUpdate: (data: any) => updateNodeData(id, data),
        onDelete: () => deleteNode(id),
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter(nodeIdCounter + 1);
  };

  const updateNodeData = (nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

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
              className="gap-2"
            >
              <Send className="w-4 h-4 text-green-500" />
              Enviar Agora
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('schedule')}
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
              className="gap-2"
            >
              <Phone className="w-4 h-4 text-green-500" />
              WhatsApp
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
        </div>
      </Card>

      {/* Canvas */}
      <div className="flex-1 border rounded-lg bg-background overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 50, y: 50, zoom: 0.45 }}
          minZoom={0.2}
          maxZoom={2}
          className="bg-muted/30"
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
