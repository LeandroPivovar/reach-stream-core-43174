import { useMemo } from 'react';
import { SegmentationParam } from '@/lib/api';

export function evaluateSegmentation(
    contact: any,
    purchaseData: { purchases: any[]; ltv: number } | undefined,
    segId: string,
    params: any
): boolean {
    const currentMonth = new Date().getMonth() + 1;

    switch (segId) {
        case 'total':
            return true;

        case 'by_purchase_count': {
            const minPurchases = params?.minPurchases !== undefined ? Number(params.minPurchases) : 1;
            const purchaseCount = purchaseData?.purchases?.length || 0;
            return purchaseCount >= minPurchases;
        }

        case 'birthday': {
            if (!contact.birthDate) return false;
            // Handle YYYY-MM-DD or similar standard strings, carefully extracting month
            const monthMatch = String(contact.birthDate).match(/-(\d{2})-/);
            let birthMonth = -1;
            if (monthMatch) {
                birthMonth = parseInt(monthMatch[1], 10);
            } else {
                const birthDateObj = new Date(contact.birthDate + 'T00:00:00');
                birthMonth = birthDateObj.getMonth() + 1;
            }
            const targetMonth = params?.month !== undefined ? Number(params.month) : currentMonth;
            return birthMonth === targetMonth;
        }

        case 'inactive_customers': {
            // Backend query logic: contact.id NOT IN (SELECT contactId FROM sales WHERE createdAt >= :date)
            // Meaning: include ANYONE who HAS NOT purchased within the last X days.
            const days = params?.days !== undefined ? Number(params.days) : 90;
            if (!purchaseData || !purchaseData.purchases || purchaseData.purchases.length === 0) {
                return true; // No purchases ever means they haven't purchased in the last X days.
            }
            const lastPurchaseDate = new Date(purchaseData.purchases[purchaseData.purchases.length - 1].date);
            const daysSinceLastPurchase = Math.floor((new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceLastPurchase >= days;
        }

        case 'no_purchase_x_days': {
            // Identical logic to inactive_customers in backend.
            const days = params?.days !== undefined ? Number(params.days) : 30;
            if (!purchaseData || !purchaseData.purchases || purchaseData.purchases.length === 0) {
                return true;
            }
            const lastPurchaseDate = new Date(purchaseData.purchases[purchaseData.purchases.length - 1].date);
            const daysSinceLastPurchase = Math.floor((new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceLastPurchase >= days;
        }

        case 'high_ticket': {
            const minTicket = params?.minTicket !== undefined ? Number(params.minTicket) : 500;
            const ltv = purchaseData?.ltv || 0;
            const purchaseCount = purchaseData?.purchases?.length || 0;
            const avgTicket = purchaseCount > 0 ? ltv / purchaseCount : 0;
            return avgTicket > minTicket; // Backend uses AVG > minTicket
        }

        case 'lead_captured':
            return contact.status?.toLowerCase() === 'lead';

        case 'active_coupon':
            return !!contact.hasActiveCoupon;

        case 'clicked_campaign':
            return !!contact.hasClickedCampaign;

        case 'gender': {
            if (params?.gender === 'M' || params?.gender === 'F') {
                return contact.gender === params.gender;
            }
            return true; // Ambos ou vazio retorna todos
        }

        case 'by_state': {
            if (params?.state) {
                return contact.state === params.state;
            }
            // Backend "contact.state IS NOT NULL" para quando seleciona Estado sem estado especifico?
            // "if (!segParams.state) orConditions.push(`contact.state IS NOT NULL`);"
            return !!contact.state;
        }

        case 'purchased_product': {
            const productIds = params?.productIds || [];
            if (productIds.length === 0) return true; // If no products selected, don't filter out? Or return all? Backend returns all if empty array.
            if (!purchaseData || !purchaseData.purchases) return false;
            return purchaseData.purchases.some(p => productIds.includes(p.productId) && (p.status === 'completed' || p.status === 'pago'));
        }

        default:
            if (segId.startsWith('state_')) {
                const state = segId.split('_')[1].toUpperCase();
                return contact.state === state;
            }
            return false;
    }
}

export function useSegmentationStats(
    contacts: any[],
    contactPurchases: Record<number, { purchases: any[]; ltv: number }>,
    selectedSegments: (string | SegmentationParam)[]
) {
    return useMemo(() => {
        const getParams = (id: string) => {
            const seg = selectedSegments.find(s => (typeof s === 'string' ? s : s.id) === id);
            return typeof seg === 'object' ? seg.params : {};
        };

        const stats: Record<string, number> = {
            total: contacts.length,
            by_purchase_count: 0,
            birthday: 0,
            inactive_customers: 0,
            high_ticket: 0,
            lead_captured: 0,
            no_purchase_x_days: 0,
            active_coupon: 0,
            clicked_campaign: 0,
            gender: 0,
            by_state: 0,
            purchased_product: 0,
        };

        contacts.forEach(c => {
            const purchaseData = contactPurchases[c.id];

            // Standard stats - Independent of horizontal filter/selection
            // We use default params for counting purposes if not selected
            if (evaluateSegmentation(c, purchaseData, 'by_purchase_count', getParams('by_purchase_count') || { minPurchases: 1 })) stats.by_purchase_count++;
            if (evaluateSegmentation(c, purchaseData, 'birthday', getParams('birthday') || { month: new Date().getMonth() + 1 })) stats.birthday++;
            if (evaluateSegmentation(c, purchaseData, 'inactive_customers', getParams('inactive_customers') || { days: 30 })) stats.inactive_customers++;
            if (evaluateSegmentation(c, purchaseData, 'high_ticket', getParams('high_ticket') || { minTicket: 500 })) stats.high_ticket++;
            if (evaluateSegmentation(c, purchaseData, 'lead_captured', {})) stats.lead_captured++;
            if (evaluateSegmentation(c, purchaseData, 'no_purchase_x_days', getParams('no_purchase_x_days') || { days: 30 })) stats.no_purchase_x_days++;
            if (evaluateSegmentation(c, purchaseData, 'active_coupon', {})) stats.active_coupon++;
            if (evaluateSegmentation(c, purchaseData, 'clicked_campaign', {})) stats.clicked_campaign++;

            if (evaluateSegmentation(c, purchaseData, 'gender', getParams('gender'))) stats.gender++;
            if (evaluateSegmentation(c, purchaseData, 'by_state', getParams('by_state'))) stats.by_state++;
            if (evaluateSegmentation(c, purchaseData, 'purchased_product', getParams('purchased_product'))) stats.purchased_product++;
        });


        return stats;
    }, [contacts, contactPurchases, selectedSegments]);
}
