// D:\0000\Hodos\comHodosapp>
// https://expo.dev/accounts/fortibtechteam/projects/comHodos/builds/ca10c80c-e349-4e61-afac-a29b3fc54fd6

export interface Attribute {
  id: string;
  name: string;
  categoryId: string;
}
export interface AttributeValue {
  id: string;
  value: string;
  attributeId: string;
  variantId: string;
  attribute: Attribute;
}
export interface Variant {
  id: string;
  sku: string;
  price: string;
  quantityInStock: number;
  imageUrl: string;
  attributeValues: AttributeValue[];
  // si tu as plus de champs, ajoute-les ici
}
