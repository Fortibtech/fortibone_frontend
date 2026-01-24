import axiosInstance from "../axiosInstance";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
}

export const getCurrencySymbolById = async (
  currencyId: string
): Promise<string | null> => {
  try {
    const { data } = await axiosInstance.get<Currency[]>("/currencies");

    const currency = data.find((c) => c.id === currencyId);

    return currency ? currency.symbol : null;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération du symbole de devise :",
      error
    );
    throw error;
  }
};
