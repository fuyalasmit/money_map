import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Initial data from local file (as fallback)
import transactionsData from "../../transactions.json";

// Create a custom hook for fetching transaction data
export const useTransactionData = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5001/get-transactions"
      );

      // Process the fetched transactions to match our expected format
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

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch };
};

// Use the hook internally to maintain existing exports
const { transactions: fetchedTransactions, loading } = useTransactionData();

// Process transaction data - for static imports, use the fetched data if available
export const transactions = loading
  ? transactionsData.map((tx) => ({
      id: tx.transactionId,
      sender: tx.senderName,
      receiver: tx.receiverName,
      amount: parseFloat(tx.amount),
      timestamp: new Date(tx.timestamp),
      label: tx.label,
    }))
  : fetchedTransactions;

export const transactionsCount = transactions.length;

/**
 * Generates monthly transaction count data
 * @param {Array} transactions - Array of transaction objects
 * @param {String} label - Optional filter for specific transaction label
 * @returns {Array} - Array of counts by month (0-11)
 */
export const getMonthlyData = (transactions, label) => {
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

/**
 * Generates weekly transaction count data
 * @param {Array} transactions - Array of transaction objects
 * @param {String} label - Optional filter for specific transaction label
 * @returns {Array} - Array of counts by day of week (0-6)
 */
export const getWeeklyData = (transactions, label) => {
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

// Dynamically compute these based on current transactions
export const monthlyDataSus = getMonthlyData(transactions, "suspicious");
export const weeklyDataSus = getWeeklyData(transactions, "suspicious");
export const monthlyDataTotal = getMonthlyData(transactions);
export const weeklyDataTotal = getWeeklyData(transactions);

export const suspiciousTransactionsCount = transactions.filter(
  (tx) => tx.label === "suspicious"
).length;

// Export month and day labels for charts
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
