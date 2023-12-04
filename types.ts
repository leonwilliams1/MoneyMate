/**
 * Represents a financial transaction record.
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id: number;
  
  /** Identifier of the category this transaction belongs to */
  category_id: number;
  
  /** Amount of money involved in the transaction */
  amount: number;
  
  /** Date and time of the transaction, represented as a Unix timestamp (seconds since epoch) */
  date: number;
  
  /** Description or notes about the transaction */
  description: string;
  
  /** Type of transaction, either 'Expense' or 'Income' */
  type: "Expense" | "Income";
}

/**
 * Represents a category of transactions.
 */
export interface Category {
  /** Unique identifier for the category */
  id: number;
  
  /** Name of the category */
  name: string;
  
  /** Type of transactions that fall under this category, either 'Expense' or 'Income' */
  type: "Expense" | "Income";
}

/**
 * Represents a summary of transactions for a particular month.
 */
export interface TransactionsByMonth {
  /** Total amount of expenses for the month */
  totalExpenses: number;
  
  /** Total amount of income for the month */
  totalIncome: number;
}
