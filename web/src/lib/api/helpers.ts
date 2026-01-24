// web/src/lib/api/helpers.ts
// Aligné avec mobile (api/helpers.ts)

import { getBusinessInventory, InventoryItem } from './inventory';

/**
 * Récupérer un variant par son ID en parcourant l'inventaire
 */
export const getVariantById = async (
    businessId: string,
    variantId: string
): Promise<InventoryItem> => {
    let page = 1;
    const limit = 50;

    while (true) {
        const { data, totalPages } = await getBusinessInventory(businessId, page, limit);
        const found = data.find((v) => v.id === variantId);
        if (found) return found;
        if (page >= totalPages) break;
        page++;
    }

    throw new Error('Variant not found');
};
