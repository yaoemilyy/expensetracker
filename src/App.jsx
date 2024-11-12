import { useState, useEffect } from "react";
import { Amplify } from 'aws-amplify';
import { Authenticator, Button, TextField, Heading, Flex, View } from "@aws-amplify/ui-react";
import awsExports from './aws-exports';
import { Expense } from '../src/models';
import { DataStore } from '@aws-amplify/datastore';
import "@aws-amplify/ui-react/styles.css";


Amplify.configure(awsExports);

export default function App() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      const data = await DataStore.query(Expense);
      setExpenses(data);
    };

    fetchExpenses();

    const subscription = DataStore.observe(Expense).subscribe(() => fetchExpenses());

    return () => subscription.unsubscribe();
  }, []);

  const createExpense = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);

    await DataStore.save(
      new Expense({
        name: form.get("name"),
        amount: parseFloat(form.get("amount")),
        date: new Date().toISOString(),
        category: form.get("category"),
        notes: form.get("notes"),
      })
    );

    event.target.reset();
  };

  const deleteExpense = async (id) => {
    const toDelete = await DataStore.query(Expense, id);
    if (toDelete) {
      await DataStore.delete(toDelete);
      setExpenses(expenses.filter((expense) => expense.id !== id));
    }
  };

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex direction="column" alignItems="center">
          <Heading>Expense Tracker</Heading>
          <form onSubmit={createExpense}>
            <TextField name="name" placeholder="Expense Name" required />
            <TextField name="amount" placeholder="Amount" type="number" required />
            <TextField name="category" placeholder="Category" />
            <TextField name="notes" placeholder="Notes" />
            <Button type="submit">Add Expense</Button>
          </form>
          <Heading>All Expenses</Heading>
          {expenses.map((expense) => (
            <View key={expense.id}>
              <p>{expense.name}: ${expense.amount}</p>
              <Button onClick={() => deleteExpense(expense.id)}>Delete</Button>
            </View>
          ))}
          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}
