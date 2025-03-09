const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { MultiDirectedGraph } = require("graphology");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

// Configuration for detection algorithms
const config = {
  structuring: {
    minTransactions: 3,
    maxAvgAmount: 1000,
    minTotal: 2000,
    timeWindow: 24 * 60 * 60 * 1000, // 24 hours in ms
  },
  cycle: {
    maxLength: 4,
    timeThreshold: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    minAmount: 1000,
  },
  fan: {
    k: 4, // Min outgoing connections
    m: 3, // Min incoming connections to sink
    timeWindow1: 24 * 60 * 60 * 1000, // Fan-out window
    timeWindow2: 24 * 60 * 60 * 1000, // Fan-in window
  },
  velocity: {
    threshold: 30 * 60 * 1000, // 30 minutes (was 1 hour)
  },
  periodic: {
    minTransactions: 5,
    maxStdDev: 2 * 60 * 60 * 1000, // 2 hour in ms
  },
  large: {
    threshold: 50000, // From server.js
  },
  reciprocal: {
    timeThreshold: 1800, // 1 hour in ms
    amountDiff: 100,
  },
};

// Path to transaction file
const getTransactionsFilePath = () => {
  const rootDir = path.resolve(__dirname);
  return path.join(rootDir, "transactions.json");
};

// Load transactions from file
const loadTransactions = () => {
  const filePath = getTransactionsFilePath();
  if (fs.existsSync(filePath)) {
    try {
      const fileData = fs.readFileSync(filePath);
      const transactions = JSON.parse(fileData);
      if (!Array.isArray(transactions)) {
        return [];
      }
      return transactions;
    } catch (err) {
      console.error("Error reading transactions file:", err);
      return [];
    }
  }
  return [];
};

// Save transactions to file
const saveTransactions = (transactions) => {
  const filePath = getTransactionsFilePath();
  return new Promise((resolve, reject) => {
    fs.writeFile(
      filePath,
      JSON.stringify(transactions, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing transactions file:", err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

// Build graph from transactions
const buildGraph = (transactions) => {
  const graph = new MultiDirectedGraph();
  const edgeKeysUsed = new Set();

  transactions.forEach((tx) => {
    const sender = tx.senderName;
    const receiver = tx.receiverName;

    if (!graph.hasNode(sender)) graph.addNode(sender);
    if (!graph.hasNode(receiver)) graph.addNode(receiver);

    // Handle duplicate edge keys
    let edgeKey = tx.transactionId;
    let counter = 1;
    while (edgeKeysUsed.has(edgeKey)) {
      edgeKey = `${tx.transactionId}-${counter}`;
      counter++;
    }

    edgeKeysUsed.add(edgeKey);
    graph.addDirectedEdgeWithKey(edgeKey, sender, receiver, {
      amount: parseFloat(tx.amount),
      timestamp: new Date(tx.timestamp),
      originalId: tx.transactionId,
    });
  });

  return { graph, edgeKeysUsed };
};

// DETECTION METHODS FROM graph.js

// 1. Temporal Structuring Detection
const detectStructuring = (graph, config) => {
  const suspiciousStructuring = [];

  graph.forEachNode((sender) => {
    graph.forEachNode((receiver) => {
      const edges = graph.edges(sender, receiver);
      if (edges.length >= config.structuring.minTransactions) {
        const transactionsInPair = edges
          .map((edge) => ({
            id: edge,
            timestamp: graph.getEdgeAttribute(edge, "timestamp"),
            amount: graph.getEdgeAttribute(edge, "amount"),
          }))
          .sort((a, b) => a.timestamp - b.timestamp);

        let windowStart = 0;
        for (
          let windowEnd = 0;
          windowEnd < transactionsInPair.length;
          windowEnd++
        ) {
          // Sliding window analysis
          while (
            transactionsInPair[windowEnd].timestamp -
              transactionsInPair[windowStart].timestamp >
            config.structuring.timeWindow
          ) {
            windowStart++;
          }

          const windowSize = windowEnd - windowStart + 1;
          if (windowSize >= config.structuring.minTransactions) {
            const windowTransactions = transactionsInPair.slice(
              windowStart,
              windowEnd + 1
            );
            const totalAmount = windowTransactions.reduce(
              (sum, tx) => sum + tx.amount,
              0
            );
            const avgAmount = totalAmount / windowSize;

            if (
              avgAmount < config.structuring.maxAvgAmount &&
              totalAmount > config.structuring.minTotal
            ) {
              suspiciousStructuring.push({
                sender,
                receiver,
                transactions: windowTransactions.map((t) => t.id),
                pattern: "Structuring",
              });
            }
          }
        }
      }
    });
  });

  return suspiciousStructuring;
};

// 2. Temporal Cycle Detection
const findTemporalCycles = (graph, config) => {
  const visited = new Set();
  const cycles = [];

  function isIncreasing(timestamps) {
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] <= timestamps[i - 1]) return false;
    }
    return true;
  }

  function dfs(currentNode, startNode, path, edgePath, timestamps) {
    // Prevent excessively long paths
    if (path.length > config.cycle.maxLength) return;

    // Check for a cycle
    if (currentNode === startNode && path.length > 1) {
      const cycleTimestamps = timestamps.slice();
      if (
        isIncreasing(cycleTimestamps) &&
        cycleTimestamps[cycleTimestamps.length - 1] - cycleTimestamps[0] <
          config.cycle.timeThreshold
      ) {
        cycles.push({ nodes: path.slice(), edges: edgePath.slice() });
      }
      return;
    }

    // Add current node to path
    path.push(currentNode);

    // Iterate over all outgoing edges
    graph.forEachOutEdge(currentNode, (edge, attributes, source, target) => {
      // Allow unvisited nodes or the start node (for cycle completion)
      if (!visited.has(target) || (target === startNode && path.length > 1)) {
        edgePath.push(edge);
        timestamps.push(attributes.timestamp);
        dfs(target, startNode, path, edgePath, timestamps);
        edgePath.pop();
        timestamps.pop();
      }
    });

    // Backtrack
    path.pop();
  }

  graph.forEachNode((node) => {
    dfs(node, node, [], [], []);
    visited.add(node);
  });

  return cycles;
};

const detectCycles = (graph, config) => {
  const cycles = findTemporalCycles(graph, config);

  return cycles
    .map((cycle) => {
      const totalAmount = cycle.edges
        .map((edge) => graph.getEdgeAttribute(edge, "amount"))
        .reduce((sum, amount) => sum + amount, 0);

      return {
        nodes: cycle.nodes,
        transactions: cycle.edges,
        totalAmount,
        pattern: "Temporal Cycle",
      };
    })
    .filter((c) => c.totalAmount > config.cycle.minAmount);
};

// 3. Temporal Fan-Out/Fan-In Detection
const detectFanPatterns = (graph, config) => {
  const suspiciousFanPatterns = [];

  graph.forEachNode((source) => {
    const outEdges = graph
      .outEdges(source)
      .map((edge) => ({
        edge,
        receiver: graph.target(edge),
        timestamp: graph.getEdgeAttribute(edge, "timestamp"),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    let windowStart = 0;
    for (let windowEnd = 0; windowEnd < outEdges.length; windowEnd++) {
      // Sliding window for fan-out
      while (
        outEdges[windowEnd].timestamp - outEdges[windowStart].timestamp >
        config.fan.timeWindow1
      ) {
        windowStart++;
      }

      const receiversInWindow = new Set(
        outEdges.slice(windowStart, windowEnd + 1).map((e) => e.receiver)
      );

      // If enough receivers, check for fan-in
      if (receiversInWindow.size >= config.fan.k) {
        const bNodes = Array.from(receiversInWindow);
        const fanInStartTime = outEdges[windowEnd].timestamp;
        const fanInEndTime = fanInStartTime + config.fan.timeWindow2;

        // Collect all fan-in transactions from middle nodes
        const fanInTransactions = bNodes.flatMap((b) => {
          return graph
            .outEdges(b)
            .map((edge) => ({
              edge,
              sender: b,
              receiver: graph.target(edge),
              timestamp: graph.getEdgeAttribute(edge, "timestamp"),
            }))
            .filter(
              (t) =>
                t.timestamp >= fanInStartTime && t.timestamp <= fanInEndTime
            );
        });

        // Find sink nodes that receive from multiple middle nodes
        const cNodes = {};
        fanInTransactions.forEach((t) => {
          if (!cNodes[t.receiver]) cNodes[t.receiver] = new Set();
          cNodes[t.receiver].add(t.sender);
        });

        for (const sink in cNodes) {
          if (cNodes[sink].size >= config.fan.m) {
            const involvedBs = Array.from(cNodes[sink]);

            const fanOutEdges = outEdges
              .slice(windowStart, windowEnd + 1)
              .filter((e) => bNodes.includes(e.receiver));

            const fanInEdges = fanInTransactions.filter(
              (t) => t.receiver === sink && involvedBs.includes(t.sender)
            );

            suspiciousFanPatterns.push({
              source,
              middle: involvedBs,
              sink,
              fanOutTransactions: fanOutEdges.map((e) => e.edge),
              fanInTransactions: fanInEdges.map((t) => t.edge),
              pattern: "Fan Pattern",
            });
          }
        }
      }
    }
  });

  return suspiciousFanPatterns;
};

// 4. Velocity Analysis
const detectHighVelocity = (graph, config) => {
  const suspiciousVelocityAccounts = [];

  graph.forEachNode((account) => {
    const inEdges = graph
      .inEdges(account)
      .map((edge) => ({
        timestamp: graph.getEdgeAttribute(edge, "timestamp"),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    const outEdges = graph
      .outEdges(account)
      .map((edge) => ({
        timestamp: graph.getEdgeAttribute(edge, "timestamp"),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (inEdges.length === 0 || outEdges.length === 0) return;

    let inIndex = 0;
    const timeDifferences = [];

    // Find time differences between incoming and outgoing transactions
    for (const outEdge of outEdges) {
      while (
        inIndex < inEdges.length &&
        inEdges[inIndex].timestamp < outEdge.timestamp
      ) {
        inIndex++;
      }

      if (inIndex > 0) {
        const lastInTimestamp = inEdges[inIndex - 1].timestamp;
        const timeDiff = outEdge.timestamp - lastInTimestamp;
        timeDifferences.push(timeDiff);
      }
    }

    if (timeDifferences.length > 0) {
      const avgTimeDiff =
        timeDifferences.reduce((sum, diff) => sum + diff, 0) /
        timeDifferences.length;

      if (avgTimeDiff < config.velocity.threshold) {
        suspiciousVelocityAccounts.push({
          account,
          avgTimeDiff,
          transactions: graph.edges(account),
          pattern: "High Velocity",
        });
      }
    }
  });

  return suspiciousVelocityAccounts;
};

// 5. Periodic Transaction Detection
const detectPeriodicTransactions = (graph, config) => {
  const suspiciousPeriodicPairs = [];

  function isPeriodic(timestamps, minTransactions, maxStdDev) {
    if (timestamps.length < minTransactions) return false;

    const differences = [];
    for (let i = 1; i < timestamps.length; i++) {
      differences.push(timestamps[i] - timestamps[i - 1]);
    }

    const meanDiff =
      differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    const variance =
      differences.reduce((sum, diff) => sum + Math.pow(diff - meanDiff, 2), 0) /
      differences.length;
    const stdDev = Math.sqrt(variance);

    return stdDev < maxStdDev;
  }

  graph.forEachNode((sender) => {
    graph.forEachNode((receiver) => {
      if (sender === receiver) return;

      const edges = graph.edges(sender, receiver);
      if (edges.length >= config.periodic.minTransactions) {
        const timestamps = edges
          .map((edge) => graph.getEdgeAttribute(edge, "timestamp").getTime())
          .sort((a, b) => a - b);

        if (
          isPeriodic(
            timestamps,
            config.periodic.minTransactions,
            config.periodic.maxStdDev
          )
        ) {
          suspiciousPeriodicPairs.push({
            sender,
            receiver,
            transactions: edges,
            pattern: "Periodic",
          });
        }
      }
    });
  });

  return suspiciousPeriodicPairs;
};

// 6. Large Transaction Detection (from server.js)
const detectLargeTransactions = (transactions, threshold) => {
  return transactions
    .filter((tx) => parseFloat(tx.amount) > threshold)
    .map((tx) => ({
      transactionId: tx.transactionId,
      pattern: "Large Amount",
    }));
};

// 7. Reciprocal Transaction Detection (from server.js)
const detectReciprocalTransactions = (graph, config) => {
  const reciprocalTransactions = [];

  graph.forEachNode((sender) => {
    graph.outNeighbors(sender).forEach((receiver) => {
      // Check if receiver also sends to sender
      if (graph.hasEdge(receiver, sender)) {
        const outEdges = graph.outEdges(sender, receiver);
        const inEdges = graph.outEdges(receiver, sender);

        // Check all combinations
        for (const outEdge of outEdges) {
          const outAmount = graph.getEdgeAttribute(outEdge, "amount");
          const outTime = graph
            .getEdgeAttribute(outEdge, "timestamp")
            .getTime();

          for (const inEdge of inEdges) {
            const inAmount = graph.getEdgeAttribute(inEdge, "amount");
            const inTime = graph
              .getEdgeAttribute(inEdge, "timestamp")
              .getTime();

            const timeDiff = Math.abs(outTime - inTime);
            const amountDiff = Math.abs(outAmount - inAmount);

            if (
              timeDiff <= config.reciprocal.timeThreshold &&
              amountDiff <= config.reciprocal.amountDiff
            ) {
              reciprocalTransactions.push({
                transactions: [outEdge, inEdge],
                sender,
                receiver,
                pattern: "Reciprocal",
              });
            }
          }
        }
      }
    });
  });

  return reciprocalTransactions;
};

// Analyze transactions using all methods
const analyzeTransactions = (transactions) => {
  // Build a graph from transactions
  const { graph } = buildGraph(transactions);

  // Run all detection algorithms
  const structuring = detectStructuring(graph, config);
  const cycles = detectCycles(graph, config);
  const fanPatterns = detectFanPatterns(graph, config);
  const highVelocity = detectHighVelocity(graph, config);
  const periodic = detectPeriodicTransactions(graph, config);
  const largeTransactions = detectLargeTransactions(
    transactions,
    config.large.threshold
  );
  const reciprocalTransactions = detectReciprocalTransactions(graph, config);

  // Collect all suspicious transaction IDs
  const suspiciousTransactionIds = new Set();
  const suspiciousReasons = new Map();

  // Helper to process detection results
  function processSuspicious(results, transactionField = "transactions") {
    results.forEach((result) => {
      const txs = Array.isArray(result[transactionField])
        ? result[transactionField]
        : [result[transactionField]];

      txs.forEach((tx) => {
        const originalId =
          typeof tx === "string" && tx.includes("-")
            ? tx.split("-")[0]
            : tx.transactionId || tx;

        suspiciousTransactionIds.add(originalId);

        if (!suspiciousReasons.has(originalId)) {
          suspiciousReasons.set(originalId, []);
        }
        suspiciousReasons.get(originalId).push(result.pattern);
      });
    });
  }

  // Process all detection results
  processSuspicious(structuring);
  processSuspicious(cycles);
  processSuspicious(fanPatterns);
  processSuspicious(highVelocity);
  processSuspicious(periodic);
  processSuspicious(largeTransactions, "transactionId");
  processSuspicious(reciprocalTransactions);

  // Update transaction labels
  const updatedTransactions = transactions.map((tx) => ({
    ...tx,
    label: suspiciousTransactionIds.has(tx.transactionId)
      ? "suspicious"
      : "clean",
    reasons: suspiciousReasons.get(tx.transactionId) || [],
  }));

  // Return statistics and updated transactions
  return {
    updatedTransactions,
    stats: {
      total: transactions.length,
      suspicious: suspiciousTransactionIds.size,
      byMethod: {
        structuring: new Set(
          [].concat(...structuring.map((s) => s.transactions))
        ).size,
        cycles: new Set([].concat(...cycles.map((c) => c.transactions))).size,
        fanPatterns: new Set(
          [].concat(
            ...fanPatterns.flatMap((f) => [
              ...f.fanOutTransactions,
              ...f.fanInTransactions,
            ])
          )
        ).size,
        highVelocity: new Set(
          [].concat(...highVelocity.map((h) => h.transactions))
        ).size,
        periodic: new Set([].concat(...periodic.map((p) => p.transactions)))
          .size,
        largeTransactions: largeTransactions.length,
        reciprocal: new Set(
          [].concat(...reciprocalTransactions.map((r) => r.transactions))
        ).size,
      },
    },
  };
};

// API ENDPOINTS

// Endpoint to save and analyze transactions
app.post("/save-transaction", async (req, res) => {
  try {
    const data = req.body;
    let transactions = loadTransactions();

    // Add the new transaction
    transactions.push(data);

    // Analyze transactions
    const { updatedTransactions } = analyzeTransactions(transactions);

    // Save updated transactions
    await saveTransactions(updatedTransactions);

    res.send({
      message: "Transaction saved and analyzed successfully",
      transactionId: data.transactionId,
      suspicious:
        updatedTransactions.find((t) => t.transactionId === data.transactionId)
          .label === "suspicious",
    });
  } catch (err) {
    console.error("Error processing transaction:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Endpoint to manually trigger analysis
app.post("/analyze-transactions", async (req, res) => {
  try {
    const transactions = loadTransactions();

    if (transactions.length === 0) {
      return res.status(404).send({ error: "No transactions found" });
    }

    // Run analysis
    const { updatedTransactions, stats } = analyzeTransactions(transactions);

    // Save updated transactions
    await saveTransactions(updatedTransactions);

    res.send({
      message: "Transactions analyzed successfully",
      stats,
    });
  } catch (err) {
    console.error("Error analyzing transactions:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Endpoint to get transactions for display
app.get("/get-transactions", (req, res) => {
  try {
    const transactions = loadTransactions();
    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Endpoint to get analytics about suspicious transactions
app.get("/suspicious-analytics", (req, res) => {
  try {
    const transactions = loadTransactions();

    if (transactions.length === 0) {
      return res.json({ total: 0, suspicious: 0, patterns: {} });
    }

    // Count by detection pattern
    const patternCounts = {};
    transactions
      .filter((tx) => tx.label === "suspicious" && Array.isArray(tx.reasons))
      .forEach((tx) => {
        tx.reasons.forEach((reason) => {
          patternCounts[reason] = (patternCounts[reason] || 0) + 1;
        });
      });

    // Count suspicious by time period (month)
    const byMonth = Array(12).fill(0);
    transactions
      .filter((tx) => tx.label === "suspicious")
      .forEach((tx) => {
        const month = new Date(tx.timestamp).getMonth();
        byMonth[month]++;
      });

    res.json({
      total: transactions.length,
      suspicious: transactions.filter((tx) => tx.label === "suspicious").length,
      patterns: patternCounts,
      byMonth,
    });
  } catch (err) {
    console.error("Error getting analytics:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

const server = app.listen(PORT, () => {
  console.log(
    `Advanced Transaction Analysis Server running on http://localhost:${PORT}`
  );
  console.log(`Monitoring for changes with nodemon...`);
});

// Add graceful shutdown for nodemon restarts
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
  });
});
