export interface ChannelCreditsInput {
  sent?: number;
  limit?: number | boolean;
  extraBalance?: number;
}

export interface ChannelCredits {
  isUnlimited: boolean;
  sent: number;
  total: number;
  available: number;
  planTotal: number;
  planAvailable: number;
  extraTotal: number;
  extraRemaining: number;
}

/** `limit` da API já inclui plano + créditos adicionais. */
export function getChannelCredits(input?: ChannelCreditsInput | null): ChannelCredits {
  const sent = Number(input?.sent) || 0;
  const extra = Number(input?.extraBalance) || 0;
  const rawLimit = input?.limit;

  if (rawLimit === true || rawLimit === -1) {
    return {
      isUnlimited: true,
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
    isUnlimited: false,
    sent,
    total,
    available,
    planTotal,
    planAvailable: Math.max(0, planTotal - planUsed),
    extraTotal: extra,
    extraRemaining: Math.max(0, extra - extraUsed),
  };
}

export interface SubscriptionCreditsStats {
  emailsSent?: number;
  emailsLimit?: number;
  extraEmailsBalance?: number;
  smsSent?: number;
  smsLimit?: number;
  extraSmsBalance?: number;
  whatsappSent?: number;
  whatsappLimit?: number | boolean;
  extraWhatsappBalance?: number;
}

export function getEmailCredits(stats?: SubscriptionCreditsStats | null): ChannelCredits {
  return getChannelCredits({
    sent: stats?.emailsSent,
    limit: stats?.emailsLimit,
    extraBalance: stats?.extraEmailsBalance,
  });
}

export function getSmsCredits(stats?: SubscriptionCreditsStats | null): ChannelCredits {
  return getChannelCredits({
    sent: stats?.smsSent,
    limit: stats?.smsLimit,
    extraBalance: stats?.extraSmsBalance,
  });
}

export function getWhatsappCredits(stats?: SubscriptionCreditsStats | null): ChannelCredits {
  return getChannelCredits({
    sent: stats?.whatsappSent,
    limit: stats?.whatsappLimit,
    extraBalance: stats?.extraWhatsappBalance,
  });
}

export function hasChannelCreditsAvailable(credits: ChannelCredits, loading = false): boolean {
  if (loading) return true;
  return credits.isUnlimited || credits.available > 0;
}

export function hasEmailCreditsAvailable(stats?: SubscriptionCreditsStats | null): boolean {
  if (!stats || stats.emailsLimit === undefined || stats.emailsLimit === null) return true;
  const credits = getEmailCredits(stats);
  return credits.isUnlimited || credits.available > 0;
}

export function hasSmsCreditsAvailable(stats?: SubscriptionCreditsStats | null): boolean {
  if (!stats || stats.smsLimit === undefined || stats.smsLimit === null) return true;
  const credits = getSmsCredits(stats);
  return credits.isUnlimited || credits.available > 0;
}

export function hasWhatsappCreditsAvailable(stats?: SubscriptionCreditsStats | null): boolean {
  if (!stats || stats.whatsappLimit === undefined || stats.whatsappLimit === null) return true;
  const credits = getWhatsappCredits(stats);
  return credits.isUnlimited || credits.available > 0;
}

export function formatChannelAvailable(credits: ChannelCredits): string {
  if (credits.isUnlimited) return 'Ilimitado';
  return credits.available.toLocaleString('pt-BR');
}

export function formatEmailAvailable(stats?: SubscriptionCreditsStats | null): string {
  return formatChannelAvailable(getEmailCredits(stats));
}

export function formatSmsAvailable(stats?: SubscriptionCreditsStats | null): string {
  return formatChannelAvailable(getSmsCredits(stats));
}

export function formatWhatsappAvailable(stats?: SubscriptionCreditsStats | null): string {
  return formatChannelAvailable(getWhatsappCredits(stats));
}

/** Detalhe plano/adicional para exibição em cards. */
export function getChannelBreakdown(credits: ChannelCredits) {
  return {
    available: formatChannelAvailable(credits),
    planAvailable: credits.planAvailable,
    extraRemaining: credits.extraRemaining,
    showBreakdown: !credits.isUnlimited && credits.extraTotal > 0,
    progress: credits.isUnlimited || credits.total <= 0 ? 0 : (credits.sent / credits.total) * 100,
  };
}
