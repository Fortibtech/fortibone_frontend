// /stores/useCartStore.ts
import { create } from "zustand";

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
  businessId: string;
  supplierBusinessId: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  isInCart: (variantId: string) => boolean;
  toggleItem: (item: CartItem) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, { ...item, quantity: 1 }],
    })),
  removeItem: (variantId) =>
    set((state) => ({
      items: state.items.filter((i) => i.variantId !== variantId),
    })),
  isInCart: (variantId) => !!get().items.find((i) => i.variantId === variantId),
  toggleItem: (item) => {
    const inside = get().isInCart(item.variantId);
    if (inside) get().removeItem(item.variantId);
    else get().addItem(item);
  },
}));
