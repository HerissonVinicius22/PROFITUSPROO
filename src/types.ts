export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'blocked';
export type AccountType = 'demo' | 'live';

export interface UserProfile {
  uid: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  cpf: string;
  whatsapp: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  availableDays: number;
  balance: number;
}

export interface GlobalConfig {
  pixKey: string;
  plan1_amount: number;
  plan1_pix: string;
  plan2_amount: number;
  plan2_pix: string;
  plan3_amount: number;
  plan3_pix: string;
  plan4_amount: number;
  plan4_pix: string;
  disabled_niches: string[];
}

export interface BacktestResult {
  asset: string;
  payout: number;
  isOTC: boolean;
  strategies: {
    name: string;
    timeframe: string;
    winRate: number;
    wins: number;
    losses: number;
  }[];
}

export interface DepositRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: 'pix' | 'crypto' | 'bank';
  details: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface TradingConfig {
  userId: string;
  pocketEmail?: string;
  pocketPassword?: string;
  accountType: AccountType;
  isBotActive: boolean;
  strategy: string;
  timeframe: 'S30' | 'M1' | 'M2' | 'M5' | 'M10' | 'M15' | 'M30' | 'H1' | 'AUTO';
  dailyProfitTarget: number;
  dailyStopLoss: number;
  investmentAmount: number;
  minPayout: number;
  pairs: string[];
  isAutoTrade: boolean;
}

export interface TradingStats {
  id?: string;
  userId: string;
  date: string;
  wins: number;
  losses: number;
  profit: number;
  margin: number;
}

export interface TradeHistory {
  id: string;
  userId: string;
  pair: string;
  entryTime: string;
  exitTime: string;
  result: 'win' | 'loss';
  value: number;
  isAutoTrade?: boolean;
}
