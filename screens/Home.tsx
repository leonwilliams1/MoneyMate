import * as React from 'react';
import { ScrollView, StyleSheet, Text, TextStyle, View } from 'react-native';
import { Category, Transaction, TransactionsByMonth } from '../types';
import { useSQLiteContext } from 'expo-sqlite/next';
import TransactionList from '../components/TransactionsList';
import Card from '../components/ui/Card';
import AddTransaction from '../components/AddTransaction';

// The Home component serves as the main screen for managing and displaying transactions and their summaries.
// It initializes state variables for storing categories, transactions, and a summary of transactions by month.
export default function Home() {
  // State hooks are used to manage the current list of categories, transactions, and a summary of transactions by month.
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [transactionsByMonth, setTransactionsByMonth] = React.useState<TransactionsByMonth>({
    totalExpenses: 0,
    totalIncome: 0,
  });

  // Retrieves the SQLite context to interact with the database.
  const db = useSQLiteContext();

  // The useEffect hook ensures that data is fetched from the database when the component mounts.
  // This is crucial for initializing the component with up-to-date information.
  React.useEffect(() => {
    db.withTransactionAsync(async () => {
      await retrieveData();
    });
  }, [db]);

  // Fetches transactions, categories, and calculates the monthly summary data.
  async function retrieveData() {
    // Retrieves all transactions from the database, ordered by ID in descending order.
    // This ensures that the most recent transactions are displayed first.
    const transactionsResult = await db.getAllAsync<Transaction>(
      `SELECT * FROM Transactions ORDER BY id DESC;`
    );
    setTransactions(transactionsResult);

    // Retrieves all categories from the database to provide context for each transaction.
    const categoriesResult = await db.getAllAsync<Category>(
      `SELECT * FROM Categories;`
    );
    setCategories(categoriesResult);

    // Computes the start and end timestamps for the current month to use in querying the database.
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

    const startOfMonthTimestamp = Math.floor(startOfMonth.getTime() / 1000);
    const endOfMonthTimestamp = Math.floor(endOfMonth.getTime() / 1000);

    // Retrieves and calculates the total expenses and income for the current month.
    // This is used to provide a summary of financial activity within the given period.
    const monthlySummaryData = await db.getAllAsync<TransactionsByMonth>(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
        COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS totalIncome
      FROM Transactions
      WHERE date >= ? AND date <= ?;
    `,
      [startOfMonthTimestamp, endOfMonthTimestamp]
    );
    setTransactionsByMonth(monthlySummaryData[0]);
  }

  // Provides functionality to delete a transaction by its ID.
  // This function is invoked when a user performs a long press on a transaction item.
  async function deleteTransaction(id: number) {
    db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM Transactions WHERE id = ?;`, [id]);
      await retrieveData(); // Refresh the data after deletion to keep the UI updated.
    });
  }

  // Provides functionality to insert a new transaction into the database.
  // This function is called whenever a new transaction needs to be saved.
  async function insertTransaction(transaction: Transaction) {
    db.withTransactionAsync(async () => {
      await db.runAsync(
        `
        INSERT INTO Transactions (category_id, amount, date, description, type) 
        VALUES (?, ?, ?, ?, ?);
      `,
        [
          transaction.category_id,
          transaction.amount,
          transaction.date,
          transaction.description,
          transaction.type,
        ]
      );
      await retrieveData(); // Refresh the data after insertion to ensure the new transaction is displayed.
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      {/* The AddTransaction component is included to allow users to add new transactions. */}
      <AddTransaction insertTransaction={insertTransaction} />
      {/* The TransactionSummary component displays a summary of the transactions for the current month. */}
      <TransactionSummary
        totalExpenses={transactionsByMonth.totalExpenses}
        totalIncome={transactionsByMonth.totalIncome}
      />
      {/* The TransactionList component displays the list of transactions along with their categories,
          and provides functionality to delete transactions. */}
      <TransactionList
        categories={categories}
        transactions={transactions}
        deleteTransaction={deleteTransaction}
      />
    </ScrollView>
  );
}

// The TransactionSummary component provides a summarized view of transactions,
// including total income, total expenses, and savings, formatted for user readability.
function TransactionSummary({
  totalIncome,
  totalExpenses,
}: TransactionsByMonth) {
  // Calculates savings by subtracting total expenses from total income.
  const savings = totalIncome - totalExpenses;

  // Formats the current period as a readable string for display purposes.
  const readablePeriod = new Date().toLocaleDateString('default', {
    month: 'long',
    year: 'numeric',
  });

  // Determines text color based on whether the value is positive or negative.
  const determineTextStyle = (value: number): TextStyle => ({
    fontWeight: 'bold',
    color: value < 0 ? '#ff4500' : '#2e8b57', // Uses different colors for positive and negative values.
  });

  // Formats monetary values to ensure consistent display of currency amounts.
  const formatMoney = (value: number) => {
    const absValue = Math.abs(value).toFixed(2);
    return `${value < 0 ? '-' : ''}${absValue}`;
  };

  return (
    <Card style={styles.container}>
      {/* Displays summary information including income, expenses, and savings for the current period. */}
      <Text style={styles.periodTitle}>Summary for {readablePeriod}</Text>
      <Text style={styles.summaryText}>
        Income:{' '}
        <Text style={determineTextStyle(totalIncome)}>
          {formatMoney(totalIncome)}
        </Text>
      </Text>
      <Text style={styles.summaryText}>
        Total Expenses:{' '}
        <Text style={determineTextStyle(totalExpenses)}>
          {formatMoney(totalExpenses)}
        </Text>
      </Text>
      <Text style={styles.summaryText}>
        Savings:{' '}
        <Text style={determineTextStyle(savings)}>{formatMoney(savings)}</Text>
      </Text>
    </Card>
  );
}

// Styles for the Home component and its children to ensure proper layout and presentation.
const styles = StyleSheet.create({
  scrollViewContainer: {
    padding: 16,
    paddingVertical: 170,
  },
  container: {
    marginBottom: 16,
    paddingBottom: 7,
  },
  periodTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 19,
    color: '#333',
    marginBottom: 11,
  },
});
