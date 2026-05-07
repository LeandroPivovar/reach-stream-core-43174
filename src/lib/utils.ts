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
    'media': 'Mídia',
    'upsell': 'Venda Adicional (Upsell)',
    'urgency': 'Urgência',
    'active_coupon': 'Cupom Ativo',
    'movement_campaign': 'Campanha de Movimentação',
    'client_day': 'Dia do Cliente',
    'inactive_cart': 'Carrinho Inativo',
    'state_location': 'Localização por Estado',
    'remarketing': 'Remarketing',
    'birthday_monthly': 'Aniversariantes do Mês',
    'news': 'Novidades',
    'lead_first_contact': 'Primeiro Contato (Lead)',
    'discret_benefit': 'Benefício Discreto',
    'message_remember_you': 'Mensagem "Lembrei de Você"',
    'relationship_benefit_nopression': 'Benefício de Relacionamento',
    'surprise': 'Surpresa',
    'abandoned_cart': 'Carrinho Abandonado',
    'christmas': 'Natal',
    'highticket_giftback': 'Giftback Alto Valor',
    'moms_day': 'Dia das Mães',
    'giftback': 'Giftback',
    'micro_interation': 'Micro Interação',
    'preference_list': 'Lista de Preferências',
    'micro_feedback': 'Micro Feedback',
    'relacionamento': 'Relacionamento',
    'storytelling': 'Storytelling',
    'checkin': 'Check-in',
    'open_conversation': 'Abrir Conversa',
    'content_information': 'Conteúdo e Informação',
    'promotional_cupom': 'Cupom Promocional',
    'hello_message_new_user': 'Boas-vindas Novo Usuário',
    'notification_order_tracking': 'Rastreamento de Pedido',
    'marketing_welcome_template': 'Boas-vindas (Marketing)',
    'marketing_birthday_discount_template': 'Desconto de Aniversário (Marketing)',
    'message_opt_in': 'Opt-in de Mensagens',
    'marketing_holiday_template': 'Campanha de Feriado (Marketing)',
    'copy': 'Cópia',
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

export function translatePaymentMethod(method: string): string {
  if (!method) return method;
  
  const translations: Record<string, string> = {
    'credit_card': 'Cartão de Crédito',
    'bank_transfer': 'Transferência Bancária',
    'boleto': 'Boleto',
    'pix': 'Pix',
    'paypal': 'PayPal',
    'other': 'Outro',
    'debit_card': 'Cartão de Débito',
    'manual': 'Manual',
    'cash': 'Dinheiro'
  };

  return translations[method.toLowerCase()] || method;
}
