// src/hooks/useCurrentBusiness.ts
import { useBusinessStore } from "@/store/businessStore";

export const useCurrentBusiness = () => {
  return useBusinessStore((state) => ({
    business: state.business,
    businessId: state.business?.id,
    bumpVersion: state.bumpVersion,
  }));
};
