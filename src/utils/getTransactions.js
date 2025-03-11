import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import transactionsData from "../../transactions.json"; // Keep as fallback

// Generate dynamic labels for the last n months from current date
const generateLastMonthsLabels = (count = 12) => {
  const labels = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const monthName = new Intl.DateTimeFormat("en", {
      month: "short",
      year: "numeric",
    }).format(d);
    labels.push(monthName);
  }
  return labels;
};

// Generate dynamic labels for the last n days from current date
const generateLastDaysLabels = (count = 7) => {
  const labels = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // Format as "Mon 05" etc.
    const dayName = new Intl.DateTimeFormat("en", { weekday: "short" }).format(
      d
    );
    const dayNum = d.getDate().toString().padStart(2, "0");
    labels.push(`${dayName} ${dayNum}`);
  }
  return labels;
};

// Get monthly data for the last 12 months
const getMonthlyData = (transactions, label) => {
  const monthlyData = new Array(12).fill(0);
  const now = new Date();

  transactions.forEach((transaction) => {
    const txDate = new Date(transaction.timestamp);
    // Calculate months difference
    const monthsDiff =
      (now.getFullYear() - txDate.getFullYear()) * 12 +
      (now.getMonth() - txDate.getMonth());

    // Only include data from the last 12 months
    if (monthsDiff >= 0 && monthsDiff < 12) {
      // Index 0 is the oldest month, 11 is current month
      const index = 11 - monthsDiff;
      if (!label || transaction.label === label) {
        monthlyData[index]++;
      }
    }
  });

  return monthlyData;
};

// Get daily data for the last 7 days
const getWeeklyData = (transactions, label) => {
  const weeklyData = new Array(7).fill(0);
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of current day

  transactions.forEach((transaction) => {
    const txDate = new Date(transaction.timestamp);

    // Calculate days difference
    const daysDiff = Math.floor((now - txDate) / (1000 * 60 * 60 * 24));

    // Only include data from the last 7 days
    if (daysDiff >= 0 && daysDiff < 7) {
      // Index 0 is 6 days ago, 6 is today
      const index = 6 - daysDiff;
      if (!label || transaction.label === label) {
        weeklyData[index]++;
      }
    }
  });

  return weeklyData;
};

// Generate dynamic labels based on current date
export const monthlyLabels = generateLastMonthsLabels();
export const weeklyLabels = generateLastDaysLabels();

// The main export: a hook that provides all data dynamically
export function useTransactionData() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // First check if we have uploaded transactions in localStorage
      const uploadedTransactionsStr = localStorage.getItem(
        "uploadedTransactions"
      );

      if (uploadedTransactionsStr) {
        // Use uploaded transactions if available
        const uploadedData = JSON.parse(uploadedTransactionsStr);
        const processedData = uploadedData.map((tx) => ({
          id: tx.transactionId,
          sender: tx.senderName,
          receiver: tx.receiverName,
          amount: parseFloat(tx.amount),
          timestamp: new Date(tx.timestamp),
          label: tx.label || "clean",
        }));

        console.log("Using uploaded transactions:", processedData.slice(0, 3));
        setTransactions(processedData);
        setError(null);
      } else {
        // Fall back to API if no uploaded data
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

          console.log(
            "Processed transactions from API:",
            processedData.slice(0, 3)
          );
          setTransactions(processedData);
          setError(null);
        } catch (apiError) {
          console.error(
            "Error fetching from API, using fallback data:",
            apiError
          );

          // Fall back to static import if API fails
          const processedFallbackData = transactionsData.map((tx) => ({
            id: tx.transactionId,
            sender: tx.senderName,
            receiver: tx.receiverName,
            amount: parseFloat(tx.amount),
            timestamp: new Date(tx.timestamp),
            label: tx.label || "clean",
          }));
          setTransactions(processedFallbackData);
        }
      }
    } catch (err) {
      console.error("Error processing transactions:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();

    // Add event listener to refresh data when transactions are updated
    const handleTransactionsUpdated = () => {
      fetchTransactions();
    };

    window.addEventListener("transactionsUpdated", handleTransactionsUpdated);

    return () => {
      window.removeEventListener(
        "transactionsUpdated",
        handleTransactionsUpdated
      );
    };
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
    monthlyLabels,
    weeklyLabels,

    // Actions
    refetch: fetchTransactions,
  };
}
