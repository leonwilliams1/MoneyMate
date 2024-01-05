import * as React from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import Card from "./ui/Card";
import { MaterialIcons } from "@expo/vector-icons"; 
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useSQLiteContext } from "expo-sqlite/next"; //access database
import { Category, Transaction } from "../types";

// The AddTransaction component is responsible for providing a user interface to add a new transaction.
// It includes state management for form inputs and handles interactions with the SQLite database.

export default function AddTransaction({
  insertTransaction, // Function for inserting a new transaction into the database.
}: {
  insertTransaction(transaction: Transaction): Promise<void>;
}) {
  // State variables to manage the form and UI interactions.
  const [addingTransaction, setAddingTransaction] = React.useState<boolean>(false); // Tracks whether the form for adding a transaction is visible.
  const [currentTab, setCurrentTab] = React.useState<number>(0); // Manages the selected tab (Expense or Income).
  const [categories, setCategories] = React.useState<Category[]>([]); // Stores categories for the selected transaction type.
  const [selectedType, setSelectedType] = React.useState<string>(""); // Tracks the currently selected category type.
  const [amount, setAmount] = React.useState<string>(""); // Holds the amount for the transaction.
  const [description, setDescription] = React.useState<string>(""); // Holds the description for the transaction.
  const [category, setCategory] = React.useState<string>("Expense"); // Tracks whether the transaction is an Expense or Income.
  const [categoryId, setCategoryId] = React.useState<number>(1); // Holds the ID of the selected category.
  const db = useSQLiteContext(); // Provides access to the SQLite database context.

  // Effect hook to retrieve categories whenever the selected tab changes.
  React.useEffect(() => {
    retrieveExpenseType(currentTab); // Fetches categories based on the current tab (Expense or Income).
  }, [currentTab]);

  // Function to retrieve and set categories based on the selected tab (Expense or Income).
  async function retrieveExpenseType(currentTab: number) {
    // Set category type based on the current tab index.
    setCategory(currentTab === 0 ? "Expense" : "Income");
    const type = currentTab === 0 ? "Expense" : "Income";

    // Query the database for categories of the selected type.
    const result = await db.getAllAsync<Category>(
      `SELECT * FROM Categories WHERE type = ?;`,
      [type]
    );
    setCategories(result); // Update the state with retrieved categories.
  }

  // Function to process and save the transaction data.
  async function processSave() {
    // Log transaction details for debugging purposes.
    console.log({
      amount: Number(amount),
      description,
      category_id: categoryId,
      date: new Date().getTime() / 1000, // Convert date to UNIX timestamp.
      type: category as "Expense" | "Income",
    });

    // Insert the transaction into the database.
    // @ts-ignore: Ignore TypeScript errors for the insertTransaction function call.
    await insertTransaction({
      amount: Number(amount),
      description,
      category_id: categoryId,
      date: new Date().getTime() / 1000,
      type: category as "Expense" | "Income",
    });
    // Reset form state after saving the transaction.
    setAmount("");
    setDescription("");
    setCategory("Expense");
    setCategoryId(1);
    setCurrentTab(0);
    setAddingTransaction(false);
  }

  return (
    <View style={{ marginBottom: 15 }}>
      {addingTransaction ? (
        <View>
          <Card>
            {/* Input fields for the transaction form */}
            <TextInput
              placeholder="£Amount"
              style={{ fontSize: 33, marginBottom: 16, fontWeight: "bold" }}
              keyboardType="numeric"
              onChangeText={(text) => {
                // Filter non-numeric characters from the input.
                const numericValue = text.replace(/[^0-9.]/g, "");
                setAmount(numericValue);
              }}
            />
            <TextInput
              placeholder="Description"
              style={{ marginBottom: 16 }}
              onChangeText={setDescription}
            />
            <Text style={{ marginBottom: 7 }}>Select an entry type</Text>
            {/* Segmented control to switch between Expense and Income */}
            <SegmentedControl
              values={["Expense", "Income"]}
              style={{ marginBottom: 16 }}
              selectedIndex={0}
              onChange={(event) => {
                setCurrentTab(event.nativeEvent.selectedSegmentIndex); // Update tab index on selection change.
              }}
            />
            {/* Render category buttons based on retrieved categories */}
            {categories.map((cat) => (
              <CategoryButton
                key={cat.name}
                // @ts-ignore: Ignore TypeScript errors for props.
                id={cat.id}
                title={cat.name}
                isSelected={selectedType === cat.name}
                setSelectedType={setSelectedType}
                setCategoryId={setCategoryId}
              />
            ))}
          </Card>
          {/* Buttons to cancel or save the transaction */}
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <Button
              title="Cancel"
              color="red"
              onPress={() => setAddingTransaction(false)}
            />
            <Button title="Save" onPress={processSave} />
          </View>
        </View>
      ) : (
        <AddButton setAddingTransaction={setAddingTransaction} />
      )}
    </View>
  );
}

// Component for rendering individual category buttons in the transaction form.
function CategoryButton({
  id,
  title,
  isSelected,
  setSelectedType,
  setCategoryId,
}: {
  id: number;
  title: string;
  isSelected: boolean;
  setSelectedType: React.Dispatch<React.SetStateAction<string>>;
  setCategoryId: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        setSelectedType(title); // Set the selected category type.
        setCategoryId(id); // Set the ID of the selected category.
      }}
      activeOpacity={0.6}
      style={{
        height: 41,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isSelected ? "#007BFF20" : "#00000020",
        borderRadius: 16,
        marginBottom: 7,
      }}
    >
      <Text
        style={{
          fontWeight: "700",
          color: isSelected ? "#008BFF" : "#000000",
          marginLeft: 5,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// Component for rendering the button to initiate adding a new transaction.
function AddButton({
  setAddingTransaction,
}: {
  setAddingTransaction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <TouchableOpacity
      onPress={() => setAddingTransaction(true)} // Show the transaction form when pressed.
      activeOpacity={0.6}
      style={{
        height: 41,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007BFF20",
        borderRadius: 16,
      }}
    >
      <MaterialIcons name="add-circle-outline" size={24} color="#008BFF" />
      <Text style={{ fontWeight: "700", color: "#008BFF", marginLeft: 5 }}>
        New Entry
      </Text>
    </TouchableOpacity>
  );
}
