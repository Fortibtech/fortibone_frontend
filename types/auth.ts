export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string; // format YYYY-MM-DD
  country: string;
  city: string;
  gender: Genre;
  profileType: "PARTICULIER" | "PRO";
}

export const enum Genre  {MALE = "MALE", FEMALE= "FEMALE"}
// export interface RegisterUserPayload {
//   firstName: string;
//   lastName: string;
//   gender: "MALE" | "FEMALE";
//   profileType: "PARTICULIER" | "PRO";
//   country: string;
//   city: string;
//   dateOfBirth: string;
//   email: string;
//   password: string;
//   phoneNumber: string;
// }

export interface CreateBusinessPayload {
  name: string;
  description?: string;
  type: "COMMERCANT";
  address: string;
  phoneNumber: string;
  logoUrl?: string;
  coverImageUrl?: string;
  latitude?: number;
  longitude?: number;
  currencyId?: string;
  siret?: string;
  websiteUrl?: string;
  activitySector: string;
  commerceType: "PHYSICAL" | "ONLINE";
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}
export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  city: string;
  gender: "MALE" | "FEMALE";
  profileType: "PARTICULIER" | "PRO";
  // ajoute d'autres champs si ton API renvoie plus
}
