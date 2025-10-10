export type Step = 1 | 2 | 3;

export interface RegisterForm {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
  position: string;
  skillLevel: string;
  city: string;
  terms: boolean;
  marketing: boolean;
}
