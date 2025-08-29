export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string; // format YYYY-MM-DD
  country: string;
  city: string;
  gender: "MALE" | "FEMALE";
  profileType: "PARTICULIER" | "PRO";
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
