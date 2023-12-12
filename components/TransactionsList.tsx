import { TouchableOpacity, View } from "react-native";
import Card from "./ui/Card";
import { Category, Transaction } from "../types";
import * as React from "react";
import TransactionListItem from "./TransactionListItem";

// This component renders a list of transactions and allows for interaction with each item.
// It accepts transactions to display, categories for categorizing transactions, 
// and a delete function to handle transaction removal.
export default function TransactionList({
  transactions,
  categories,
  deleteTransaction,
}: {
  categories: Category[];
  transactions: Transaction[];
  deleteTransaction: (id: number) => Promise<void>;
}) {
  return (
    <View style={{ gap: 15 }}>
      {/* Maps through each transaction and associates it with its corresponding category 
          from the provided categories array. This allows for accurate categorization 
          when displaying each transaction item. */}
      {transactions.map((transaction) => {
        // Finds the category that matches the transaction's category ID, 
        // ensuring that category information is correctly linked to each transaction.
        const currentItemCategory = categories.find(
          (category) => category.id === transaction.category_id
        );
        return (
          <TouchableOpacity
            key={transaction.id}
            activeOpacity={0.7}
            // Adds a long press handler to each transaction item, enabling users 
            // to delete the transaction by long-pressing, which improves user experience
            // by providing a straightforward method for removal.
            onLongPress={() => deleteTransaction(transaction.id)}
          >
            {/* Renders each transaction using the TransactionListItem component, 
                passing both the transaction details and associated category information. 
                This ensures that each transaction is displayed with the correct context and details. */}
            <TransactionListItem
              transaction={transaction}
              categoryInfo={currentItemCategory}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

