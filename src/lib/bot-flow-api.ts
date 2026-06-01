import { API_URL } from '@/lib/api';
import type { BotFlowChannel } from '@/lib/bot-flow-channels';
import type { Edge, Node } from '@xyflow/react';

export interface BotFlowListItem {
  id: number;
  name: string;
  channel: BotFlowChannel;
  isActive: boolean;
  nodeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BotFlowDetail {
  id: number;
  name: string;
  channel: BotFlowChannel;
  nodes: Node[];
  edges: Edge[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function mapFlowDetail(raw: Record<string, unknown>): BotFlowDetail {
  const nodes = parseJsonField<Node[]>(raw?.nodes, []);
  const edges = parseJsonField<Edge[]>(raw?.edges, []);
  return {
    id: raw.id as number,
    name: String(raw.name ?? 'Fluxo'),
    channel: raw.channel as BotFlowChannel,
    nodes: Array.isArray(nodes) ? nodes : [],
    edges: Array.isArray(edges) ? edges : [],
    isActive: Boolean(raw.isActive),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  };
}

async function parseResponse<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!res.ok) return null;
  if (!text.trim()) return null;
  return JSON.parse(text) as T;
}

export async function fetchBotFlows(): Promise<BotFlowListItem[]> {
  const res = await fetch(`${API_URL}/api/bot-flows`, {
    headers: authHeaders(),
  });
  const data = await parseResponse<BotFlowListItem[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function fetchBotFlowById(id: number): Promise<BotFlowDetail | null> {
  const res = await fetch(`${API_URL}/api/bot-flows/${id}`, {
    headers: { Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '' },
  });
  const raw = await parseResponse<Record<string, unknown>>(res);
  return raw ? mapFlowDetail(raw) : null;
}

export async function createBotFlow(payload: {
  name: string;
  channel: BotFlowChannel;
}): Promise<BotFlowDetail | null> {
  const res = await fetch(`${API_URL}/api/bot-flows`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const raw = await parseResponse<Record<string, unknown>>(res);
  return raw ? mapFlowDetail(raw) : null;
}

export async function saveBotFlow(
  id: number,
  payload: { nodes: Node[]; edges: Edge[]; isActive?: boolean },
): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/bot-flows/${id}/save`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.ok;
}

export async function deleteBotFlow(id: number): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/bot-flows/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.ok;
}
