export interface Category {
  id: number;
  name: string;
  emoji: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Expense {
  id: number;
  category_id: number;
  amount: number; // decimal parsed as number in React client
  payment_method: 'cash' | 'credit';
  note: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Setting {
  id: number;
  monthly_budget: number;
  currency: string;
}

export interface Summary {
  spent: number;
  budget_left: number;
  pace_projection: number;
  daily_average: number;
}

export interface CategorySpend {
  category_id: number;
  name: string;
  emoji: string;
  amount: number;
  percent: number;
}

export interface MonthSpend {
  month: string;
  amount: number;
}
