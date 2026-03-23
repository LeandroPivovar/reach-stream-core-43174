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
            const minPurchases = params?.minPurchases ?? 0;
            const purchaseCount = purchaseData?.purchases.length || 0;
            return purchaseCount >= minPurchases;
        }

        case 'birthday': {
            if (!contact.birthDate) return false;
            const birthDateObj = new Date(contact.birthDate + 'T00:00:00');
            const birthMonth = birthDateObj.getMonth() + 1;
            const targetMonth = params?.month ?? currentMonth;
            return birthMonth === targetMonth;
        }

        case 'inactive_customers': {
            const days = params?.days ?? 0;
            if (purchaseData && purchaseData.purchases.length > 0) {
                const lastPurchaseDate = new Date(purchaseData.purchases[purchaseData.purchases.length - 1].date);
                const daysSinceLastPurchase = Math.floor((new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysSinceLastPurchase >= days;
            }
            return contact.status === 'Inativo';
        }

        case 'high_ticket': {
            const minTicket = params?.minTicket ?? 0;
            const ltv = purchaseData?.ltv || 0;
            const purchaseCount = purchaseData?.purchases.length || 0;
            const avgTicket = purchaseCount > 0 ? ltv / purchaseCount : 0;
            return avgTicket >= minTicket;
        }

        case 'lead_captured':
            return contact.status?.toLowerCase() === 'lead';

        case 'no_purchase_x_days': {
            const days = params?.days ?? 0;
            if (purchaseData && purchaseData.purchases.length > 0) {
                const lastPurchaseDate = new Date(purchaseData.purchases[purchaseData.purchases.length - 1].date);
                const daysSinceLastPurchase = Math.floor((new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysSinceLastPurchase >= days;
            }
            return false;
        }

        case 'active_coupon':
            return contact.group === 'VIP' || (contact.tags && contact.tags.includes('Promocional'));

        case 'gender': {
            if (!params?.gender) return true;
            return contact.gender === params.gender;
        }

        case 'by_state': {
            if (!params?.state) return true;
            return contact.state === params.state;
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
            gender: 0,
            by_state: 0,
        };

        contacts.forEach(c => {
            const purchaseData = contactPurchases[c.id];

            // Standard stats
            if (evaluateSegmentation(c, purchaseData, 'by_purchase_count', getParams('by_purchase_count'))) stats.by_purchase_count++;
            if (evaluateSegmentation(c, purchaseData, 'birthday', getParams('birthday'))) stats.birthday++;
            if (evaluateSegmentation(c, purchaseData, 'inactive_customers', getParams('inactive_customers'))) stats.inactive_customers++;
            if (evaluateSegmentation(c, purchaseData, 'high_ticket', getParams('high_ticket'))) stats.high_ticket++;
            if (evaluateSegmentation(c, purchaseData, 'lead_captured', {})) stats.lead_captured++;
            if (evaluateSegmentation(c, purchaseData, 'no_purchase_x_days', getParams('no_purchase_x_days'))) stats.no_purchase_x_days++;
            if (evaluateSegmentation(c, purchaseData, 'active_coupon', {})) stats.active_coupon++;

            if (evaluateSegmentation(c, purchaseData, 'gender', getParams('gender'))) stats.gender++;
            if (evaluateSegmentation(c, purchaseData, 'by_state', getParams('by_state'))) stats.by_state++;
        });

        return stats;
    }, [contacts, contactPurchases, selectedSegments]);
}
