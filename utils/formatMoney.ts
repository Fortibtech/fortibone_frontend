/**
 * Formate un montant monétaire avec 2 décimales précises et le symbole de devise
 * Corrige les erreurs de précision flottante (ex: 7444273.89999999865 → 7444273.90)
 * Réutilisable partout dans ton app !
 */
export const formatMoney = (
  value: number | string,
  symbol: string = ""
): string => {
  // Si c'est une string, on la convertit d'abord en nombre
  let numValue: number;
  if (typeof value === "string") {
    numValue = parseFloat(value.replace(",", "")) || 0;
  } else {
    numValue = value || 0;
  }

  if (isNaN(numValue)) return `0,00 ${symbol}`;

  // CORRECTION CLÉ : Arrondi à 2 décimales AVANT formatage
  const roundedValue = Math.round(numValue * 100) / 100;

  return `${roundedValue.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${symbol}`;
};
