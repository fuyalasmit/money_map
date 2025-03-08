import transactionsData from "../../transactions.json";

// Process transaction data
export const transactions = transactionsData.map((tx) => ({
  id: tx.transactionId,
  sender: tx.senderName,
  receiver: tx.receiverName,
  amount: parseFloat(tx.amount),
  timestamp: new Date(tx.timestamp),
  label: tx.label,
}));

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

// Precomputed data for common use cases
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
