import { getBusinessInventory } from "./Inventory";
import type { InventoryItem } from "./Inventory";

export const getVariantById = async (
  businessId: string,
  variantId: string
): Promise<InventoryItem> => {
  let page = 1;
  const limit = 50;
  while (true) {
    const { data, totalPages } = await getBusinessInventory(
      businessId,
      page,
      limit
    );
    const found = data.find((v) => v.id === variantId);
    if (found) return found;
    if (page >= totalPages) break;
    page++;
  }
  throw new Error("Variant not found");
};
