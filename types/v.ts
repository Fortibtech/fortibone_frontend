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


// ⏩ To skip this step, set the environment variable: EAS_SKIP_AUTO_FINGERPRINT=1
// ✔ Computed project fingerprint

// See logs: https://expo.dev/accounts/phanuel/projects/fortibone_frontend/builds/ca11d24c-28ff-485e-9ce2-ff1939b03778

// Waiting for build to complete. You can press Ctrl+C to exit.
//   Build queued...

// Start builds sooner in the priority queue.
// Sign up for a paid plan at https://expo.dev/accounts/phanuel/settings/billing

// Waiting in Free tier queue
// |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■|

// ✔ Build finished
// 🤖 Android app:
// https://expo.dev/artifacts/eas/qXeW6mdBQ4gLWoCMVUGHAy.aab
// PS D:\0000\00new\fortibone_frontend>

