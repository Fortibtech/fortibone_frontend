// web/src/lib/api/inventory.ts
// API Inventaire - Aligné fidèlement avec le mobile (api/Inventory.ts)

import axiosInstance from './axiosInstance';

// ==================== INTERFACES ====================

export interface Attribute {
    id: string;
    name: string;
    categoryId: string;
}

export interface AttributeValue {
    id: string;
    value: string;
    variantId: string;
    attributeId: string;
    attribute: Attribute;
}

export interface Product {
    id: string;
    name: string;
}

export interface InventoryItem {
    id: string;
    sku: string;
    barcode: string | null;
    price: string;
    purchasePrice: string;
    quantityInStock: number;
    alertThreshold: number | null;
    itemsPerLot: number | null;
    lotPrice: string | null;
    imageUrl: string;
    productId: string;
    product: Product;
    attributeValues: AttributeValue[];
}

export interface InventoryResponse {
    data: InventoryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Interface simplifiée pour l'affichage tableau (aligné mobile)
export interface InventoryDisplayItem {
    id: string;
    name: string;
    sku: string;
    price: string;
    quantityInStock: number;
    lots: number;
    sold: number;
    imageUrl: string;
}

export interface PerformedBy {
    id: string;
    firstName: string;
}

export interface OrderInfo {
    id: string;
    orderNumber: string;
}

export interface InventoryMovement {
    id: string;
    type: 'LOSS' | 'GAIN' | 'SALE' | 'ADJUSTMENT';
    quantityChange: number;
    newQuantity: number;
    reason: string | null;
    createdAt: string;
    variantId: string;
    businessId: string;
    orderId: string | null;
    performedById: string;
    performedBy: PerformedBy;
    order: OrderInfo | null;
}

export interface Batch {
    id: string;
    quantity: number;
    expirationDate: string;
    variantId: string;
    createdAt: string;
    updatedAt: string;
    variant?: {
        product: {
            name: string;
        };
    };
}

export interface BatchPayload {
    quantity: number;
    expirationDate: string; // Format "YYYY-MM-DD"
}

export interface AdjustPayload {
    quantityChange: number;
    type: 'RETURN' | 'LOSS' | 'ADJUSTMENT' | 'EXPIRATION';
    reason?: string;
    batchId?: string;
}

export interface RecordExpiredLossesResponse {
    message: string;
    lossesRecorded: number;
}

// ==================== FONCTIONS API ====================

/**
 * Récupérer l'inventaire d'une entreprise
 */
export const getBusinessInventory = async (
    businessId: string,
    page: number = 1,
    limit: number = 20
): Promise<InventoryResponse> => {
    try {
        const response = await axiosInstance.get<InventoryResponse>(
            `/inventory/businesses/${businessId}`,
            { params: { page, limit } }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération inventaire:', error.message);
        throw new Error(`Failed to fetch inventory: ${error.message}`);
    }
};

/**
 * Mapper les données API vers le format d'affichage (aligné mobile)
 */
export const mapInventoryToDisplay = (items: InventoryItem[]): InventoryDisplayItem[] => {
    return items.map((item) => ({
        id: item.id,
        name: item.product.name,
        sku: item.sku,
        price: item.price,
        quantityInStock: item.quantityInStock,
        lots: item.itemsPerLot || 1,
        sold: 0, // À calculer depuis les mouvements si nécessaire
        imageUrl: item.imageUrl,
    }));
};

/**
 * Récupérer les lots d'un variant
 */
export const getVariantBatches = async (variantId: string): Promise<Batch[]> => {
    try {
        const response = await axiosInstance.get(`/inventory/variants/${variantId}/batches`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération lots:', error.message);
        throw new Error(`Failed to fetch batches: ${error.message}`);
    }
};

/**
 * Récupérer l'historique des mouvements d'un variant
 */
export const getVariantHistory = async (variantId: string): Promise<InventoryMovement[]> => {
    try {
        const response = await axiosInstance.get<InventoryMovement[]>(
            `/inventory/variants/${variantId}/history`
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération historique:', error.message);
        throw new Error(`Failed to fetch variant history: ${error.message}`);
    }
};

/**
 * Ajuster le stock d'un variant
 */
export const adjustVariantStock = async (
    variantId: string,
    payload: AdjustPayload
): Promise<InventoryItem> => {
    try {
        const response = await axiosInstance.post<InventoryItem>(
            `/inventory/variants/${variantId}/adjust`,
            payload
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur ajustement stock:', error.message);
        throw new Error(`Failed to adjust stock: ${error.message}`);
    }
};

/**
 * Ajouter un nouveau lot de stock
 */
export const addVariantBatch = async (
    variantId: string,
    payload: BatchPayload
): Promise<InventoryItem> => {
    try {
        const response = await axiosInstance.post<InventoryItem>(
            `/inventory/variants/${variantId}/batches`,
            payload
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur ajout lot:', error.message);
        throw new Error(`Failed to add batch: ${error.message}`);
    }
};

/**
 * Récupérer les produits qui expirent bientôt
 */
export const getExpiringSoonProducts = async (
    businessId: string,
    days: number = 30
): Promise<Batch[]> => {
    try {
        const response = await axiosInstance.get<Batch[]>(
            `/inventory/businesses/${businessId}/expiring-soon`,
            { params: { days } }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération produits expirants:', error.message);
        throw new Error(`Failed to fetch expiring products: ${error.message}`);
    }
};

/**
 * Enregistrer les pertes de produits périmés
 */
export const recordExpiredLosses = async (
    businessId: string
): Promise<RecordExpiredLossesResponse> => {
    try {
        const response = await axiosInstance.post<RecordExpiredLossesResponse>(
            `/inventory/businesses/${businessId}/record-expired-losses`
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur enregistrement pertes:', error.message);
        throw new Error(`Failed to record expired losses: ${error.message}`);
    }
};
