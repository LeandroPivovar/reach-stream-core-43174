import { Contact, SegmentationParam } from '@/lib/api';

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
