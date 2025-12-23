const formatDistance = (min: number | null, max: number | null) => {
  if (min != null && max != null) {
    return `De ${min} km à ${max} km`;
  }

  if (min != null && max == null) {
    return `À partir de ${min} km (sans limite)`;
  }

  if (min == null && max != null) {
    return `Jusqu'à ${max} km`;
  }

  return "Dès 0 km (sans limite)";
};
export default formatDistance;

