export type TransactionType = "LOAD" | "PAY" | "REFUND";

export type TransactionDto = {
  id: string;
  userId: string;
  amount: string | number;
  type: TransactionType;
  description: string;
  createdAt: number;
};

export type WalletDto = {
  id: string;
  userId: string;
  balance: string | number;
  updatedAt: number;
};

export type WalletVM = {
  balance: number;
  updatedAt: number;
};

export type TxVM = {
  id: string;
  icon: "income" | "expense";
  title: string;
  amount: number;
  sign: "+" | "-";
  status: "Tamamlandı";
  when: Date;
};
