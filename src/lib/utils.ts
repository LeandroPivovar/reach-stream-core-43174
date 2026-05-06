import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function translateTemplateName(name: string): string {
  if (!name) return name;
  
  const translations: Record<string, string> = {
    'Welcome': 'Boas-vindas',
    'Authentication': 'Autenticação',
    'Marketing': 'Marketing',
    'Utility': 'Utilidade',
    'Order': 'Pedido',
    'Payment': 'Pagamento',
    'Delivery': 'Entrega',
    'Alert': 'Alerta',
    'Notification': 'Notificação',
    'Verification': 'Verificação',
    'Support': 'Suporte',
    'Update': 'Atualização',
    'Reminder': 'Lembrete',
    'Confirmation': 'Confirmação',
    'Account': 'Conta',
    'Password': 'Senha',
    'Shipping': 'Envio/Frete',
    'Receipt': 'Recibo',
    'Invoice': 'Fatura',
    'Appointment': 'Agendamento/Consulta',
    'Reservation': 'Reserva',
    'inactive_clients': 'Clientes Inativos',
    'high_ticket_clients': 'Clientes de Alto Valor',
    'automatic_rebuy': 'Recompra Automática',
    'buyers_especific_product': 'Compradores de Produto Específico',
    'almost_loss': 'Quase Perda',
    'cross_sell': 'Venda Cruzada',
    'recovered_client': 'Cliente Recuperado',
    'loyalty_campaign': 'Campanha de Fidelidade',
    'black_friday': 'Black Friday',
    'valentines_day': 'Dia dos Namorados',
    'media': 'Mídia'
  };

  let translatedName = name.replace(/_/g, ' ');
  Object.entries(translations).forEach(([en, pt]) => {
    const cleanEn = en.replace(/_/g, ' ');
    const regex = new RegExp(`\\b${cleanEn}\\b`, 'gi');
    translatedName = translatedName.replace(regex, pt);
  });

  return translatedName
    .split(' ')
    .filter(Boolean)
    .map((word, i) => i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(' ');
}
