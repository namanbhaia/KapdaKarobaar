export interface Expense {
  spender: string;
  amount: string;
  date: string;
  category: string;
  comments: string;
}

export const fetchExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await fetch("/api/expenses", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.expenses || [];
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
};

export const submitExpense = async (expense: Expense): Promise<boolean> => {
  try {
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to submit expense:", error);
    return false;
  }
};
