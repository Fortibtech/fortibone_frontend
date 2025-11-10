// stores/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductVariant } from "@/api";

// ──────────────────────────────────────────────────────────────
// Type de chaque article du panier
// ──────────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  productName: string;
  variant: ProductVariant;
  quantity: number;
  imageUrl?: string;
  addedAt: number;
  supplierBusinessId: string; // ← NOUVEAU : ID du fournisseur qui vend ce produit
}

// ──────────────────────────────────────────────────────────────
// Interface du store
// ──────────────────────────────────────────────────────────────
interface CartStore {
  items: CartItem[];
  addItem: (
    productId: string,
    productName: string,
    variant: ProductVariant,
    quantity: number,
    imageUrl?: string, // ← optionnel (?)
    supplierBusinessId: string // ← obligatoire, mais après un optionnel → ERREUR TS1016
  ) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // ──────────────────────────────────────────────────────────────
      // Ajouter un article au panier
      // ──────────────────────────────────────────────────────────────
      addItem: (
        productId,
        productName,
        variant,
        quantity,
        imageUrl,
        supplierBusinessId: string
      ) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.productId === productId &&
              i.variant.id === variant.id &&
              i.supplierBusinessId === supplierBusinessId // ← Vérifie aussi le fournisseur
          );

          if (existingItem) {
            // Mise à jour de la quantité si l'article existe déjà (même produit, variante, fournisseur)
            return {
              items: state.items.map((item) =>
                item.productId === productId &&
                item.variant.id === variant.id &&
                item.supplierBusinessId === supplierBusinessId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          // Nouvel article
          return {
            items: [
              ...state.items,
              {
                productId,
                productName,
                variant,
                quantity,
                imageUrl: imageUrl || variant.imageUrl || undefined,
                addedAt: Date.now(),
                supplierBusinessId, // ← Stocké ici
              },
            ],
          };
        });
      },

      // ──────────────────────────────────────────────────────────────
      // Supprimer un article
      // ──────────────────────────────────────────────────────────────
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variant.id === variantId)
          ),
        })),

      // ──────────────────────────────────────────────────────────────
      // Mettre à jour la quantité
      // ──────────────────────────────────────────────────────────────
      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variant.id === variantId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        })),

      // ──────────────────────────────────────────────────────────────
      // Vider le panier
      // ──────────────────────────────────────────────────────────────
      clearCart: () => set({ items: [] }),

      // ──────────────────────────────────────────────────────────────
      // Nombre total d'articles
      // ──────────────────────────────────────────────────────────────
      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      // ──────────────────────────────────────────────────────────────
      // Prix total du panier
      // ──────────────────────────────────────────────────────────────
      getTotalPrice: () =>
        get().items.reduce((sum, item) => {
          const price = parseFloat(item.variant.price) || 0;
          return sum + price * item.quantity;
        }, 0),
    }),
    {
      name: "cart-storage", // Clé dans AsyncStorage pour persistance
    }
  )
);
