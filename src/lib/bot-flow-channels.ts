import { Instagram, MessageCircle, QrCode, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type BotFlowChannel =
  | 'whatsapp_qr'
  | 'whatsapp_api'
  | 'instagram_direct'
  | 'telegram';

export interface BotFlowChannelOption {
  id: BotFlowChannel;
  label: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
}

export const BOT_FLOW_CHANNELS: BotFlowChannelOption[] = [
  {
    id: 'whatsapp_qr',
    label: 'WhatsApp — QR dinâmico',
    description: 'Conecte escaneando o QR Code no celular',
    icon: QrCode,
    colorClass: 'bg-green-500/10 text-green-600 border-green-500/30',
  },
  {
    id: 'whatsapp_api',
    label: 'WhatsApp — API oficial',
    description: 'Integração via Meta Business / Cloud API',
    icon: MessageCircle,
    colorClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  {
    id: 'instagram_direct',
    label: 'Direct Instagram',
    description: 'Automatize respostas no Direct do Instagram',
    icon: Instagram,
    colorClass: 'bg-pink-500/10 text-pink-600 border-pink-500/30',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    description: 'Bot via token do BotFather',
    icon: Send,
    colorClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
  },
];

export function getBotFlowChannel(id: BotFlowChannel | string): BotFlowChannelOption | undefined {
  return BOT_FLOW_CHANNELS.find((c) => c.id === id);
}
