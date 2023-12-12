import { AntDesign } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Category, Transaction } from "../types";
import { AutoSizeText, ResizeTextMode } from "react-native-auto-size-text";
import { categoryColours, categoryEmojies } from "../constants";
import Card from "./ui/Card";

// Defines the properties expected by the TransactionListItem component,
// including transaction details and optional category information.
interface TransactionListItemProps {
  transaction: Transaction;
  categoryInfo: Category | undefined;
}

// This component is responsible for rendering a single transaction item,
// displaying details such as the amount, category, and transaction info.
export default function TransactionListItem({
  transaction,
  categoryInfo,
}: TransactionListItemProps) {
  // Determines the appropriate icon and color based on the transaction type.
  // This helps visually differentiate between expenses and income.
  const iconName =
    transaction.type === "Expense" ? "minuscircle" : "pluscircle";
  const color = transaction.type === "Expense" ? "red" : "green";
  // Retrieves the color and emoji associated with the transaction's category,
  // or defaults if no category information is provided.
  const categoryColour = categoryColours[categoryInfo?.name ?? "Default"];
  const emoji = categoryEmojies[categoryInfo?.name ?? "Default"];


  return (
    <Card>
      <View style={styles.row}>
        <View style={{ width: "40%", gap: 3 }}>
          {/* Displays the transaction amount and category details, utilizing the
              Amount and CategoryItem components for separate visual sections. */}
          <Amount
            amount={transaction.amount}
            color={color}
            iconName={iconName}
          />
          <CategoryItem
            categoryColour={categoryColour}
            categoryInfo={categoryInfo}
            emoji={emoji}
          />
        </View>
        {/* Displays additional information about the transaction such as
            the date, description, and unique transaction ID. */}
        <TransactionInfo
          date={transaction.date}
          description={transaction.description}
          id={transaction.id}
        />
      </View>
    </Card>
  );
}

// Component that presents detailed information about a transaction,
// including its description, unique ID, and formatted date.
function TransactionInfo({
  id,
  date,
  description,
}: {
  id: number;
  date: number;
  description: string;
}) {
  return (
    <View style={{ flexGrow: 0, gap: 7, flexShrink: 1 }}>
      {/* Shows the transaction description and ID prominently, with the
          date displayed in a secondary, smaller font. */}
      <Text style={{ fontSize: 17, fontWeight: "bold" }}>{description}</Text>
      <Text>Transaction number {id}</Text>
      <Text style={{ fontSize: 13, color: "gray" }}>
        {new Date(date * 1000).toDateString()}
      </Text>
    </View>
  );
}

// Component that renders the category of the transaction, using a color
// and emoji to visually distinguish between different categories.
function CategoryItem({
  categoryColour,
  categoryInfo,
  emoji,
}: {
  categoryColour: string;
  categoryInfo: Category | undefined;
  emoji: string;
}) {
  return (
    <View
      style={[
        styles.categoryContainer,
        { backgroundColor: categoryColour + "40" },
      ]}
    >
      {/* Displays the category name with an associated emoji and applies
          a background color to highlight the category section. */}
      <Text style={styles.categoryText}>
        {emoji} {categoryInfo?.name}
      </Text>
    </View>
  );
}

// Component that visualizes the amount of the transaction, including an icon
// and color to indicate whether it's an expense or income.
function Amount({
  iconName,
  color,
  amount,
}: {
  iconName: "minuscircle" | "pluscircle";
  color: string;
  amount: number;
}) {
  return (
    <View style={styles.row}>
      {/* Displays an icon indicating the type of transaction and the amount
          formatted with currency symbol. */}
      <AntDesign name={iconName} size={19} color={color} />
      <AutoSizeText
        fontSize={33}
        mode={ResizeTextMode.max_lines}
        numberOfLines={1}
        style={[styles.amount, { maxWidth: "81%" }]}
      >
        £{amount}
      </AutoSizeText>
    </View>
  );
}

// StyleSheet defining the layout and visual presentation of various components
// to ensure consistent styling throughout the TransactionListItem component.
const styles = StyleSheet.create({
  amount: {
    fontSize: 33,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryContainer: {
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 13,
  },
});
