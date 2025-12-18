// Type definitions matching Prisma schema with strict type safety

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string | null;
  phone: string | null;
  address: string | null;
  join_date: Date | null;
  points: number;
  membership_level: string | null;
  status: string | null;
  created_at: Date;
}

export interface SafeUser extends Omit<User, 'password'> {}

export interface Transaction {
  id: number;
  total_item: number;
  total_transaction: number;
  items: string | null;
  points_gained: number;
  created_at: Date;
  users_id: number;
  user?: SafeUser;
}

export interface Reward {
  id: number;
  reward_name: string;
  points_required: number;
  redeemed_at: Date | null;
  status: string | null;
  code: string | null;
  created_at: Date;
  users_id: number;
  user?: SafeUser;
}

export interface MembershipLog {
  id: number;
  activity: string;
  activity_time: Date;
  users_id: number;
  user?: SafeUser;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

// Dashboard Stats types
export interface AdminStats {
  totalUsers: number;
  pointRatio: number;
  totalTransactions: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  transactionsPerDay: { date: string; count: number; amount: number }[];
  pointsActivity: { date: string; issued: number; redeemed: number }[];
}

export interface MemberDashboard {
  user: SafeUser;
  recentTransactions: Transaction[];
  availableRewards: Reward[];
  redeemedRewards: Reward[];
}

// Voucher types
export interface VoucherRedemption {
  rewardId: number;
  userId: number;
}
