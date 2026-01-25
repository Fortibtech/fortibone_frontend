'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types
export interface ProductVariant {
    id: string;
    price: string;
    sku?: string | null;
    name?: string;
    imageUrl?: string | null;
    itemsPerLot?: number | null;
    lotPrice?: string | null;
    quantityInStock?: number | null;
}

export interface ProCartItem {
    id: string;
    productId: string;
    productName: string;
    variant: ProductVariant;
    quantity: number;
    imageUrl?: string | null;
    addedAt: number;
    supplierBusinessId: string;
    supplierName?: string;
}

interface ProCartStore {
    items: ProCartItem[];
    addItem: (
        productId: string,
        productName: string,
        variant: ProductVariant,
        quantity: number,
        imageUrl: string | null | undefined,
        supplierBusinessId: string,
        supplierName?: string
    ) => void;
    removeItem: (productId: string, variantId: string, supplierBusinessId: string) => void;
    updateQuantity: (productId: string, variantId: string, supplierBusinessId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

const generateId = (productId: string, variantId: string, supplierBusinessId: string) =>
    `${productId}-${variantId}-${supplierBusinessId || 'no-supplier'}`;

export const useProCartStore = create<ProCartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (productId, productName, variant, quantity = 1, imageUrl, supplierBusinessId, supplierName) => {
                const safeSupplierId = supplierBusinessId || 'no-supplier';
                const variantId = variant.id || 'no-variant';
                const id = generateId(productId, variantId, safeSupplierId);

                set((state) => {
                    const existing = state.items.find((i) => i.id === id);

                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === id ? { ...i, quantity: i.quantity + quantity } : i
                            ),
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                id,
                                productId,
                                productName,
                                variant,
                                quantity,
                                imageUrl: imageUrl ?? variant.imageUrl ?? null,
                                addedAt: Date.now(),
                                supplierBusinessId: safeSupplierId,
                                supplierName,
                            },
                        ],
                    };
                });
            },

            removeItem: (productId, variantId, supplierBusinessId) => {
                const safeSupplierId = supplierBusinessId || 'no-supplier';
                const id = generateId(productId, variantId, safeSupplierId);

                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                }));
            },

            updateQuantity: (productId, variantId, supplierBusinessId, quantity) => {
                const safeSupplierId = supplierBusinessId || 'no-supplier';
                const id = generateId(productId, variantId, safeSupplierId);

                set((state) => {
                    if (quantity <= 0) {
                        return { items: state.items.filter((i) => i.id !== id) };
                    }
                    return {
                        items: state.items.map((i) =>
                            i.id === id ? { ...i, quantity } : i
                        ),
                    };
                });
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                const items = get().items;
                return items.reduce((sum, i) => sum + i.quantity, 0);
            },

            getTotalPrice: () => {
                const items = get().items;
                return items.reduce((sum, item) => {
                    const price = Number(item.variant.price) || 0;
                    return sum + price * item.quantity;
                }, 0);
            },
        }),
        {
            name: 'pro-cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
