
export type LotteryType = 'MEGA_SENA' | 'LOTOFACIL' | 'QUINA' | 'MAIS_MILIONARIA';

export type NotificationType = 'RESULT' | 'DEADLINE' | 'FINANCIAL' | 'INFO';

export type UserRole = 'ADMIN' | 'PARTICIPANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  whatsapp?: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface Participant {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface PoolGroup {
  id: string;
  name: string;
  balance: number;
  participants: string[]; // IDs dos participantes
  whatsappGroupId?: string;
  notifActive?: boolean;
}

export interface Ticket {
  id: string;
  numbers: number[];
  extraNumbers?: number[]; // For +Milionária trevos
  cost: number;
  status: 'PENDING' | 'REGISTERED' | 'CHECKED';
  hits?: number;
  extraHits?: number;
}

export interface Pool {
  id: string;
  groupId: string; // Vínculo com o grupo
  name: string;
  type: LotteryType;
  drawNumber: string;
  drawDate: string;
  participants: {
    participantId: string;
    shares: number; // quota
    paid: boolean;
  }[];
  tickets: Ticket[];
  totalPrize: number;
  status: 'OPEN' | 'CLOSED' | 'FINISHED';
}

export interface LotteryConfig {
  name: string;
  minNumbers: number;
  maxNumbers: number;
  range: number;
  extraRange?: number;
  priceBase: number;
  color: string;
  gridCols: number;
}

export const LOTTERY_CONFIGS: Record<LotteryType, LotteryConfig> = {
  MEGA_SENA: {
    name: 'Mega-Sena',
    minNumbers: 6,
    maxNumbers: 20,
    range: 60,
    priceBase: 5.00,
    color: 'bg-emerald-600',
    gridCols: 10
  },
  LOTOFACIL: {
    name: 'Lotofácil',
    minNumbers: 15,
    maxNumbers: 20,
    range: 25,
    priceBase: 3.00,
    color: 'bg-purple-600',
    gridCols: 5
  },
  QUINA: {
    name: 'Quina',
    minNumbers: 5,
    maxNumbers: 15,
    range: 80,
    priceBase: 2.50,
    color: 'bg-blue-600',
    gridCols: 10
  },
  MAIS_MILIONARIA: {
    name: '+Milionária',
    minNumbers: 6,
    maxNumbers: 12,
    range: 50,
    extraRange: 6,
    priceBase: 6.00,
    color: 'bg-orange-500',
    gridCols: 10
  }
};
