import transactionsData from "../../transactions.json"; // Adjust the path to your JSON file

// Helper function to generate year-month strings (e.g., "2025-08")
function generateYearMonths(start, end) {
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);
  const yearMonths = [];
  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    yearMonths.push(`${year}-${String(month).padStart(2, "0")}`);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return yearMonths;
}

// Helper function to format amount in crores
function formatCrores(amount) {
  const crores = (amount / 10000000).toFixed(2);
  return `Rs ${crores}Cr`;
}

// Main function to compute analytics
export function getAnalytics() {
  if (!transactionsData || transactionsData.length === 0) {
    return {
      totalUsers: { count: 0, percentage: 0, extra: "0" },
      totalTransaction: { count: "Rs 0Cr", percentage: 0, extra: "Rs 0Cr" },
      suspiciousTransaction: {
        count: "Rs 0Cr",
        percentage: 0,
        extra: "Rs 0Cr",
      },
    };
  }

  // Find the earliest and latest months
  const timestamps = transactionsData.map((tx) => tx.timestamp);
  const firstYearMonth = timestamps
    .reduce((a, b) => (a < b ? a : b))
    .slice(0, 7);
  const currentYearMonth = timestamps
    .reduce((a, b) => (a > b ? a : b))
    .slice(0, 7);
  const allYearMonths = generateYearMonths(firstYearMonth, currentYearMonth);

  // Process Total Users
  const accountFirstTx = new Map();
  transactionsData.forEach((tx) => {
    const { senderAccount, receiverAccount, timestamp } = tx;
    if (
      !accountFirstTx.has(senderAccount) ||
      timestamp < accountFirstTx.get(senderAccount)
    ) {
      accountFirstTx.set(senderAccount, timestamp);
    }
    if (
      !accountFirstTx.has(receiverAccount) ||
      timestamp < accountFirstTx.get(receiverAccount)
    ) {
      accountFirstTx.set(receiverAccount, timestamp);
    }
  });

  const newAccountsPerMonth = new Map();
  accountFirstTx.forEach((timestamp) => {
    const yearMonth = timestamp.slice(0, 7);
    newAccountsPerMonth.set(
      yearMonth,
      (newAccountsPerMonth.get(yearMonth) || 0) + 1
    );
  });

  let cumulativeUsers = 0;
  const cumulativeUsersByMonth = {};
  allYearMonths.forEach((ym) => {
    cumulativeUsers += newAccountsPerMonth.get(ym) || 0;
    cumulativeUsersByMonth[ym] = cumulativeUsers;
  });

  // Process Transactions
  const totalTxAmountPerMonth = new Map();
  const suspiciousTxAmountPerMonth = new Map();
  transactionsData.forEach((tx) => {
    const yearMonth = tx.timestamp.slice(0, 7);
    const amount = parseFloat(tx.amount);
    totalTxAmountPerMonth.set(
      yearMonth,
      (totalTxAmountPerMonth.get(yearMonth) || 0) + amount
    );
    if (tx.label === "suspicious") {
      // Adjust this condition based on your data
      suspiciousTxAmountPerMonth.set(
        yearMonth,
        (suspiciousTxAmountPerMonth.get(yearMonth) || 0) + amount
      );
    }
  });

  let cumulativeTotalTx = 0;
  let cumulativeSuspiciousTx = 0;
  const cumulativeTotalTxByMonth = {};
  const cumulativeSuspiciousTxByMonth = {};
  allYearMonths.forEach((ym) => {
    cumulativeTotalTx += totalTxAmountPerMonth.get(ym) || 0;
    cumulativeSuspiciousTx += suspiciousTxAmountPerMonth.get(ym) || 0;
    cumulativeTotalTxByMonth[ym] = cumulativeTotalTx;
    cumulativeSuspiciousTxByMonth[ym] = cumulativeSuspiciousTx;
  });

  // Helper to compute percentage change
  const computePercentage = (current, previous) => {
    if (previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Total Users
  const totalUsersCount = cumulativeUsersByMonth[currentYearMonth];
  const totalUsersExtra = newAccountsPerMonth.get(currentYearMonth) || 0;
  const previousUsers =
    allYearMonths.length > 1
      ? cumulativeUsersByMonth[allYearMonths[allYearMonths.length - 2]]
      : 0;
  const totalUsersPercentage = computePercentage(
    totalUsersCount,
    previousUsers
  );

  // Total Transaction
  const totalTxCount = formatCrores(cumulativeTotalTxByMonth[currentYearMonth]);
  const totalTxExtra = formatCrores(
    totalTxAmountPerMonth.get(currentYearMonth) || 0
  );
  const previousTotalTx =
    allYearMonths.length > 1
      ? cumulativeTotalTxByMonth[allYearMonths[allYearMonths.length - 2]]
      : 0;
  const totalTxPercentage = computePercentage(
    cumulativeTotalTxByMonth[currentYearMonth],
    previousTotalTx
  );

  // Suspicious Transaction
  const suspiciousTxCount = formatCrores(
    cumulativeSuspiciousTxByMonth[currentYearMonth] || 0
  );
  const suspiciousTxExtra = formatCrores(
    suspiciousTxAmountPerMonth.get(currentYearMonth) || 0
  );
  const previousSuspiciousTx =
    allYearMonths.length > 1
      ? cumulativeSuspiciousTxByMonth[allYearMonths[allYearMonths.length - 2]]
      : 0;
  const suspiciousTxPercentage = computePercentage(
    cumulativeSuspiciousTxByMonth[currentYearMonth] || 0,
    previousSuspiciousTx
  );

  return {
    totalUsers: {
      count: totalUsersCount,
      percentage: totalUsersPercentage,
      extra: totalUsersExtra.toLocaleString(),
    },
    totalTransaction: {
      count: totalTxCount,
      percentage: totalTxPercentage,
      extra: totalTxExtra,
    },
    suspiciousTransaction: {
      count: suspiciousTxCount,
      percentage: suspiciousTxPercentage,
      extra: suspiciousTxExtra,
    },
  };
}
