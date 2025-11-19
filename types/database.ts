// Database types for the cash flow tracker app

export interface Person {
  id: number;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  personId: number;
  amount: number;
  type: 'incoming' | 'outgoing';
  description: string;
  category?: string;
  date: string;
  createdAt: string;
}

export interface PersonWithBalance extends Person {
  balance: number;
  transactionCount: number;
}

export interface DashboardStats {
  totalBalance: number;
  totalIncoming: number;
  totalOutgoing: number;
  transactionCount: number;
  peopleCount: number;
}

export interface TransactionWithPerson extends Transaction {
  personName: string;
}

export type TransactionType = 'incoming' | 'outgoing';
export type SortOrder = 'asc' | 'desc';
