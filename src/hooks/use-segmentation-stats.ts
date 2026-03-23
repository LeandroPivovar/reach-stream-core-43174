import { useMemo } from 'react';
import { evaluateSegmentation } from '@/lib/segmentation-utils';
import { SegmentationParam } from '@/lib/api';

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
            gender_male: 0,
            gender_female: 0,
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

            // Gênero specific counters (M and F)
            if (evaluateSegmentation(c, purchaseData, 'gender', { gender: 'M' })) stats.gender_male++;
            if (evaluateSegmentation(c, purchaseData, 'gender', { gender: 'F' })) stats.gender_female++;

            // Por estado (State specific counters)
            if (c.state) {
                const stateKey = `state_${c.state.toLowerCase()}`;
                stats[stateKey] = (stats[stateKey] || 0) + 1;
            }
        });

        return stats;
    }, [contacts, contactPurchases, selectedSegments]);
}
