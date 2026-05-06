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
    'Reservation': 'Reserva'
  };

  let translatedName = name;
  Object.entries(translations).forEach(([en, pt]) => {
    // Case insensitive match with word boundaries
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translatedName = translatedName.replace(regex, pt);
  });

  return translatedName;
}
