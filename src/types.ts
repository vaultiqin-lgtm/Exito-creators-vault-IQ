export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  isAiScanned?: boolean;
  locationTag?: string;
}

export interface Friend {
  name: string;
  amount: number;
  paid: boolean;
}

export interface GroupBill {
  id: string;
  description: string;
  totalAmount: number;
  date: string;
  friends: Friend[];
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSavings: number;
  coverImage?: string; // base64 or object URL
}

export interface LoanReminder {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isScheduled: boolean;
  status: "Pending" | "Paid" | "Overdue";
  totalPrincipal?: number;
  remainingInstallments?: number;
}

export interface UserProfile {
  username: string;
  mobile: string;
  pin?: string;
  biometricEnabled?: boolean;
  mobileVerified?: boolean;
}

export interface SalaryLog {
  id: string;
  monthYear: string;
  amount: number;
  notes: string;
  date?: string;
}

export type Theme = "light" | "dark";

export type AppLockMode = "none" | "pin4" | "pin6" | "pattern";

export interface SafeZoneData {
  cash: number;
  upi: number;
  pin: string;
  isPinConfigured?: boolean;
}

export type ActiveTab =
  | "home"
  | "dashboard"
  | "splitter"
  | "goals"
  | "remainder"
  | "profile"
  | "settings"
  | "legal"
  | "privacy"
  | "terms"
  | "help"
  | "subscriptions"
  | "upgrade";

