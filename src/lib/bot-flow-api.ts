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
    isActive: raw.isActive === true || raw.isActive === 1 || raw.isActive === '1',
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

export async function updateBotFlowMeta(
  id: number,
  payload: { name?: string; isActive?: boolean },
): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/bot-flows/${id}`, {
    method: 'PATCH',
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

export interface TelegramConnectionStatus {
  connected: boolean;
  status: string | null;
  botUsername: string | null;
  connectedAt: string | null;
}

export async function fetchTelegramConnectionStatus(
  flowId: number,
): Promise<TelegramConnectionStatus | null> {
  const res = await fetch(`${API_URL}/api/bot-flows/${flowId}/telegram/status`, {
    headers: { Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '' },
  });
  return parseResponse<TelegramConnectionStatus>(res);
}

export async function connectTelegramBot(
  flowId: number,
  botToken: string,
): Promise<{ success: boolean; botUsername?: string | null; message?: string }> {
  const res = await fetch(`${API_URL}/api/bot-flows/${flowId}/telegram/connect`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ botToken }),
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const err = JSON.parse(text) as { message?: string | string[] };
      const msg = Array.isArray(err.message) ? err.message[0] : err.message;
      return { success: false, message: msg || 'Erro ao conectar' };
    } catch {
      return { success: false, message: 'Erro ao conectar' };
    }
  }
  try {
    return JSON.parse(text) as { success: boolean; botUsername?: string | null };
  } catch {
    return { success: true };
  }
}

export async function disconnectTelegramBot(flowId: number): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/bot-flows/${flowId}/telegram/disconnect`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return res.ok;
}
