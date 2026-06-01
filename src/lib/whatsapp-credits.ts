export interface WhatsappCreditsStats {
  whatsappSent?: number;
  whatsappLimit?: number | boolean;
  extraWhatsappBalance?: number;
}

/** Totais de WhatsApp — `whatsappLimit` da API já inclui plano + créditos adicionais. */
export function getWhatsappCredits(stats?: WhatsappCreditsStats | null) {
  const sent = Number(stats?.whatsappSent) || 0;
  const extra = Number(stats?.extraWhatsappBalance) || 0;
  const rawLimit = stats?.whatsappLimit;

  if (rawLimit === true || rawLimit === -1) {
    return {
      isUnlimited: true as const,
      sent,
      total: -1,
      available: -1,
      planTotal: -1,
      planAvailable: -1,
      extraTotal: extra,
      extraRemaining: extra,
    };
  }

  const total = Number(rawLimit) || 0;
  const planTotal = Math.max(0, total - extra);
  const available = Math.max(0, total - sent);
  const planUsed = Math.min(sent, planTotal);
  const extraUsed = Math.max(0, sent - planTotal);

  return {
    isUnlimited: false as const,
    sent,
    total,
    available,
    planTotal,
    planAvailable: Math.max(0, planTotal - planUsed),
    extraTotal: extra,
    extraRemaining: Math.max(0, extra - extraUsed),
  };
}

export function hasWhatsappCreditsAvailable(stats?: WhatsappCreditsStats | null): boolean {
  if (!stats || stats.whatsappLimit === undefined || stats.whatsappLimit === null) {
    return true;
  }
  const credits = getWhatsappCredits(stats);
  return credits.isUnlimited || credits.available > 0;
}

export function formatWhatsappAvailable(stats?: WhatsappCreditsStats | null): string {
  const credits = getWhatsappCredits(stats);
  if (credits.isUnlimited) return 'Ilimitado';
  return credits.available.toLocaleString('pt-BR');
}
