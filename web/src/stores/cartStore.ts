// stores/cartStore.ts - Version web alignée sur mobile useCartStore
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string; // clé unique : `${productId}-${variantId}`
    productId: string;
    variantId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string | null;
    businessId: string;
    supplierBusinessId?: string;
    variantName?: string;
    stock?: number;
    currency?: string;
}

interface CartState {
    items: CartItem[];

    // Ajouter ou incrémenter un produit
    addItem: (item: Omit<CartItem, 'id' | 'quantity'>, qty?: number) => void;

    // Retirer complètement du panier
    removeItem: (productId: string, variantId: string) => void;

    // Mettre à jour la quantité
    updateQuantity: (productId: string, variantId: string, quantity: number) => void;

    // Toggle classique
    toggleItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;

    // Vérifier si un produit+variante est dans le panier
    isInCart: (productId: string, variantId: string) => boolean;

    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

const getItemId = (productId: string, variantId: string) =>
    `${productId}-${variantId}`;

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (newItem, qty = 1) =>
                set((state) => {
                    const id = getItemId(newItem.productId, newItem.variantId);
                    const existing = state.items.find((i) => i.id === id);

                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === id ? { ...i, quantity: i.quantity + qty } : i
                            ),
                        };
                    }

                    return {
                        items: [...state.items, { ...newItem, id, quantity: qty }],
                    };
                }),

            removeItem: (productId, variantId) =>
                set((state) => ({
                    items: state.items.filter(
                        (i) => i.id !== getItemId(productId, variantId)
                    ),
                })),

            updateQuantity: (productId, variantId, quantity) =>
                set((state) => {
                    if (quantity <= 0) {
                        return {
                            items: state.items.filter(
                                (i) => i.id !== getItemId(productId, variantId)
                            ),
                        };
                    }
                    return {
                        items: state.items.map((i) =>
                            i.id === getItemId(productId, variantId) ? { ...i, quantity } : i
                        ),
                    };
                }),

            toggleItem: (item) => {
                const { isInCart, addItem, removeItem } = get();
                const inCart = isInCart(item.productId, item.variantId);

                if (inCart) {
                    removeItem(item.productId, item.variantId);
                } else {
                    addItem(item, 1);
                }
            },

            isInCart: (productId, variantId) =>
                get().items.some((i) => i.id === getItemId(productId, variantId)),

            clearCart: () => set({ items: [] }),

            getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

            getTotalPrice: () =>
                get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
