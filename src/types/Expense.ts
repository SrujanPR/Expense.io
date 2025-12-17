export interface Expense {
  id?: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  date: string;     // ISO date (YYYY-MM-DD)
  is_income: boolean;
}
