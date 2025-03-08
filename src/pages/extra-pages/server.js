const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

// Function to build the transaction graph
function buildGraph(transactions) {
  const graph = new Map();
  transactions.forEach((tx) => {
    const sender = tx.senderAccount;
    const receiver = tx.receiverAccount;
    if (!graph.has(sender)) {
      graph.set(sender, { outgoing: [], incoming: [] });
    }
    if (!graph.has(receiver)) {
      graph.set(receiver, { outgoing: [], incoming: [] });
    }
    graph.get(sender).outgoing.push(tx);
    graph.get(receiver).incoming.push(tx);
  });
  return graph;
}

// Function to detect large transactions
function detectLargeTransactions(transactions, threshold = 50000) {
  return transactions
    .filter((tx) => parseFloat(tx.amount) > threshold)
    .map((tx) => tx.transactionId);
}

// Function to detect reciprocal transactions
function detectReciprocalTransactions(
  graph,
  timeThreshold = 3600000,
  amountDiff = 100
) {
  const reciprocalTxs = new Set();
  for (const [account, { outgoing }] of graph) {
    for (const tx of outgoing) {
      const receiver = tx.receiverAccount;
      const reverseTxs = graph
        .get(receiver)
        ?.outgoing.filter((rtx) => rtx.receiverAccount === account);
      if (reverseTxs) {
        for (const rtx of reverseTxs) {
          const timeDiff = Math.abs(
            new Date(tx.timestamp).getTime() - new Date(rtx.timestamp).getTime()
          );
          const amtDiff = Math.abs(
            parseFloat(tx.amount) - parseFloat(rtx.amount)
          );
          if (timeDiff <= timeThreshold && amtDiff <= amountDiff) {
            reciprocalTxs.add(tx.transactionId);
            reciprocalTxs.add(rtx.transactionId);
          }
        }
      }
    }
  }
  return Array.from(reciprocalTxs);
}

// Main fraud detection function
function detectFraud(graph, transactions) {
  const fraudulentTxIds = new Set();

  // Detect large transactions
  const largeTxs = detectLargeTransactions(transactions);
  largeTxs.forEach((txId) => fraudulentTxIds.add(txId));

  // Detect reciprocal transactions
  const reciprocalTxs = detectReciprocalTransactions(graph);
  reciprocalTxs.forEach((txId) => fraudulentTxIds.add(txId));

  // Add more detection rules here (e.g., cycles, high-frequency) as needed
  return fraudulentTxIds;
}

// Function to analyze transactions and add status
function analyzeTransactions(transactions) {
  const processedTransactions = transactions.map((tx) => ({
    ...tx,
    amount: parseFloat(tx.amount), // Ensure amount is a number
    timestamp: tx.timestamp, // Keep as is; parsed in detection if needed
  }));

  const graph = buildGraph(processedTransactions);
  const fraudulentTxIds = detectFraud(graph, processedTransactions);

  return transactions.map((tx) => ({
    ...tx,
    label: fraudulentTxIds.has(tx.transactionId) ? "suspicious" : "clean",
  }));
}

// Endpoint to save and analyze transactions
app.post("/save-transaction", (req, res) => {
  const data = req.body;
  const rootDir = path.resolve(__dirname, "../../..");
  const filePath = path.join(rootDir, "transactions.json");

  let transactions = [];
  if (fs.existsSync(filePath)) {
    try {
      const fileData = fs.readFileSync(filePath);
      transactions = JSON.parse(fileData);
      if (!Array.isArray(transactions)) {
        transactions = [];
      }
    } catch (err) {
      console.error("Error reading transactions file:", err);
      transactions = [];
    }
  }

  transactions.push(data);

  // Analyze the updated list
  const updatedTransactions = analyzeTransactions(transactions);

  // Write back to transactions.json
  fs.writeFile(
    filePath,
    JSON.stringify(updatedTransactions, null, 2),
    (err) => {
      if (err) {
        console.error("Error writing transactions file:", err);
        return res.status(500).send("Internal Server Error");
      }
      res.send("File saved successfully");
    }
  );
});

// Endpoint to manually trigger analysis
app.post("/analyze-transactions", (req, res) => {
  const rootDir = path.resolve(__dirname, "../../..");
  const filePath = path.join(rootDir, "transactions.json");

  let transactions = [];
  if (fs.existsSync(filePath)) {
    try {
      const fileData = fs.readFileSync(filePath);
      transactions = JSON.parse(fileData);
      if (!Array.isArray(transactions)) {
        transactions = [];
      }
    } catch (err) {
      console.error("Error reading transactions file:", err);
      return res.status(500).send("Internal Server Error");
    }
  } else {
    return res.status(404).send("transactions.json not found");
  }

  // Analyze the current list
  const updatedTransactions = analyzeTransactions(transactions);

  // Write back to transactions.json
  fs.writeFile(
    filePath,
    JSON.stringify(updatedTransactions, null, 2),
    (err) => {
      if (err) {
        console.error("Error writing transactions file:", err);
        return res.status(500).send("Internal Server Error");
      }
      res.send("Transactions analyzed and transactions.json updated");
    }
  );
});

// Endpoint to get transactions for display
app.get("/get-transactions", (req, res) => {
  const rootDir = path.resolve(__dirname, "../../..");
  const filePath = path.join(rootDir, "transactions.json");

  if (fs.existsSync(filePath)) {
    try {
      const fileData = fs.readFileSync(filePath);
      const transactions = JSON.parse(fileData);
      res.json(transactions);
    } catch (err) {
      console.error("Error reading transactions file:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(404).send("transactions.json not found");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
