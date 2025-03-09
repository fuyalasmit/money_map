import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import transactionsData from "../../transactions.json"; // Only used as fallback

// Helper functions
const getMonthlyData = (transactions, label) => {
  const monthlyData = new Array(12).fill(0);
  transactions.forEach((transaction) => {
    const date = new Date(transaction.timestamp);
    const month = date.getMonth();
    if (!label || transaction.label === label) {
      monthlyData[month]++;
    }
  });
  return monthlyData;
};

const getWeeklyData = (transactions, label) => {
  const weeklyData = new Array(7).fill(0);
  transactions.forEach((transaction) => {
    const date = new Date(transaction.timestamp);
    const day = date.getDay();
    if (!label || transaction.label === label) {
      weeklyData[day]++;
    }
  });
  return weeklyData;
};

// Static labels (these don't need to be dynamic)
export const monthlyLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const weeklyLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// The only export: a hook that provides all data dynamically
export function useTransactionData() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5001/get-transactions"
      );

      const processedData = response.data.map((tx) => ({
        id: tx.transactionId,
        sender: tx.senderName,
        receiver: tx.receiverName,
        amount: parseFloat(tx.amount),
        timestamp: new Date(tx.timestamp),
        label: tx.label || "clean",
      }));

      setTransactions(processedData);
      setError(null);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error);
      // Fallback to local data if API fails
      const processedFallbackData = transactionsData.map((tx) => ({
        id: tx.transactionId,
        sender: tx.senderName,
        receiver: tx.receiverName,
        amount: parseFloat(tx.amount),
        timestamp: new Date(tx.timestamp),
        label: tx.label || "clean",
      }));
      setTransactions(processedFallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate all derived data dynamically
  const monthlyDataSus = getMonthlyData(transactions, "suspicious");
  const weeklyDataSus = getWeeklyData(transactions, "suspicious");
  const monthlyDataTotal = getMonthlyData(transactions);
  const weeklyDataTotal = getWeeklyData(transactions);
  const suspiciousTransactionsCount = transactions.filter(
    (tx) => tx.label === "suspicious"
  ).length;

  // Return everything in one object
  return {
    // Raw data
    transactions,
    loading,
    error,

    // Derived data
    monthlyDataSus,
    weeklyDataSus,
    monthlyDataTotal,
    weeklyDataTotal,
    suspiciousTransactionsCount,
    transactionsCount: transactions.length,

    // Actions
    refetch: fetchTransactions,
  };
}
