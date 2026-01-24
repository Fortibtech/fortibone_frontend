import axiosInstance from "../axiosInstance";

export interface Batch {
  id: string;
  quantity: number;
  expirationDate: string; // ISO string
  receivedAt: string; // ISO string
  variantId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GetVariantBatchesParams {
  variantId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const getVariantBatches = async ({
  variantId,
  page = 1,
  limit = 10,
  search,
}: GetVariantBatchesParams): Promise<PaginatedResponse<Batch>> => {
  const response = await axiosInstance.get<PaginatedResponse<Batch>>(
    `/inventory/variants/${variantId}/batches`,
    {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
      },
    }
  );

  return response.data;
};
