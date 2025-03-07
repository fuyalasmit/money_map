const { MultiDirectedGraph } = require("graphology");

// Define accounts and time range
const accounts = Array.from({ length: 500 }, (_, i) => `A${i + 1}`);
const startTime = new Date("2023-01-01T00:00:00").getTime();
const endTime = new Date("2023-01-31T23:59:59").getTime();

// Helper function to pick unique random accounts
function pickUniqueAccounts(count) {
  const shuffled = [...accounts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate legitimate transactions (8,000)
const legitimateTransactions = [];
for (let i = 0; i < 8000; i++) {
  let sender, receiver;
  do {
    sender = accounts[Math.floor(Math.random() * accounts.length)];
    receiver = accounts[Math.floor(Math.random() * accounts.length)];
  } while (sender === receiver);
  const amount = Math.max(10, 500 + 200 * (Math.random() * 2 - 1)); // Crude normal distribution
  const timestamp = startTime + Math.random() * (endTime - startTime);
  legitimateTransactions.push({ sender, receiver, amount, timestamp });
}

// Generate structuring transactions (400)
const structuringPairs = Array.from({ length: 80 }, () => {
  let sender, receiver;
  do {
    sender = accounts[Math.floor(Math.random() * accounts.length)];
    receiver = accounts[Math.floor(Math.random() * accounts.length)];
  } while (sender === receiver);
  return [sender, receiver];
});
const structuringTransactions = [];
structuringPairs.forEach((pair) => {
  const [sender, receiver] = pair;
  const windowStart =
    startTime + Math.random() * (endTime - startTime - 24 * 60 * 60 * 1000);
  for (let j = 0; j < 5; j++) {
    const timestamp = windowStart + Math.random() * 24 * 60 * 60 * 1000;
    structuringTransactions.push({ sender, receiver, amount: 900, timestamp });
  }
});

// Generate cycle transactions (≈399)
const cycleTransactions = [];
for (let i = 0; i < 133; i++) {
  const cycle = pickUniqueAccounts(3);
  let timestamp =
    startTime + Math.random() * (endTime - startTime - 3 * 60 * 60 * 1000);
  cycleTransactions.push({
    sender: cycle[0],
    receiver: cycle[1],
    amount: 1000,
    timestamp,
  });
  timestamp += 60 * 60 * 1000; // 1 hour later
  cycleTransactions.push({
    sender: cycle[1],
    receiver: cycle[2],
    amount: 1000,
    timestamp,
  });
  timestamp += 60 * 60 * 1000;
  cycleTransactions.push({
    sender: cycle[2],
    receiver: cycle[0],
    amount: 1000,
    timestamp,
  });
}

// Generate fan-out/fan-in transactions (400)
const fanTransactions = [];
for (let i = 0; i < 40; i++) {
  const A = accounts[Math.floor(Math.random() * accounts.length)];
  const Bs = pickUniqueAccounts(5).filter((b) => b !== A);
  const C = pickUniqueAccounts(1).find((c) => c !== A && !Bs.includes(c));
  const fanOutStart =
    startTime + Math.random() * (endTime - startTime - 2 * 24 * 60 * 60 * 1000);
  Bs.forEach((B) => {
    const timestamp = fanOutStart + Math.random() * 24 * 60 * 60 * 1000;
    fanTransactions.push({ sender: A, receiver: B, amount: 500, timestamp });
  });
  const fanInStart = fanOutStart + 24 * 60 * 60 * 1000;
  Bs.forEach((B) => {
    const timestamp = fanInStart + Math.random() * 24 * 60 * 60 * 1000;
    fanTransactions.push({ sender: B, receiver: C, amount: 500, timestamp });
  });
}

// Generate rapid movement chain transactions (300)
const chainTransactions = [];
for (let i = 0; i < 100; i++) {
  const chain = pickUniqueAccounts(4);
  let timestamp =
    startTime + Math.random() * (endTime - startTime - 3 * 60 * 60 * 1000);
  chainTransactions.push({
    sender: chain[0],
    receiver: chain[1],
    amount: 1000,
    timestamp,
  });
  timestamp += 60 * 60 * 1000;
  chainTransactions.push({
    sender: chain[1],
    receiver: chain[2],
    amount: 1000,
    timestamp,
  });
  timestamp += 60 * 60 * 1000;
  chainTransactions.push({
    sender: chain[2],
    receiver: chain[3],
    amount: 1000,
    timestamp,
  });
}

// Generate periodic transactions (400)
const periodicPairs = Array.from({ length: 80 }, () => {
  let sender, receiver;
  do {
    sender = accounts[Math.floor(Math.random() * accounts.length)];
    receiver = accounts[Math.floor(Math.random() * accounts.length)];
  } while (sender === receiver);
  return [sender, receiver];
});
const periodicTransactions = [];
periodicPairs.forEach((pair) => {
  const [sender, receiver] = pair;
  let timestamp = startTime + Math.random() * (7 * 24 * 60 * 60 * 1000); // Start within first week
  for (let j = 0; j < 5; j++) {
    periodicTransactions.push({ sender, receiver, amount: 1000, timestamp });
    timestamp += 7 * 24 * 60 * 60 * 1000; // 7 days apart
  }
});

// Add 1 extra structuring transaction to reach 2,000 fraudulent
const extraPair = pickUniqueAccounts(2);
structuringTransactions.push({
  sender: extraPair[0],
  receiver: extraPair[1],
  amount: 900,
  timestamp: startTime + Math.random() * (endTime - startTime),
});

// Combine all transactions
const transactions = [
  ...legitimateTransactions,
  ...structuringTransactions,
  ...cycleTransactions,
  ...fanTransactions,
  ...chainTransactions,
  ...periodicTransactions,
];

// Sort by timestamp
transactions.sort((a, b) => a.timestamp - b.timestamp);

// Assign unique transaction IDs
transactions.forEach((tx, index) => {
  tx.id = `t${index + 1}`;
});

// Sample transaction data with timestamps
// const transactions = [
//   {
//     id: "t1",
//     sender: "A",
//     receiver: "B",
//     amount: 900,
//     timestamp: new Date("2023-01-01T10:00:00"),
//   },
//   {
//     id: "t2",
//     sender: "A",
//     receiver: "B",
//     amount: 900,
//     timestamp: new Date("2023-01-01T10:05:00"),
//   },
//   {
//     id: "t3",
//     sender: "B",
//     receiver: "C",
//     amount: 850,
//     timestamp: new Date("2023-01-01T10:10:00"),
//   },
//   {
//     id: "t4",
//     sender: "C",
//     receiver: "A",
//     amount: 800,
//     timestamp: new Date("2023-01-01T10:15:00"),
//   },
//   {
//     id: "t5",
//     sender: "A",
//     receiver: "D",
//     amount: 700,
//     timestamp: new Date("2023-01-02T11:00:00"),
//   },
//   {
//     id: "t6",
//     sender: "D",
//     receiver: "E",
//     amount: 650,
//     timestamp: new Date("2023-01-02T11:05:00"),
//   },
//   {
//     id: "t7",
//     sender: "E",
//     receiver: "F",
//     amount: 600,
//     timestamp: new Date("2023-01-02T11:10:00"),
//   },
//   {
//     id: "t8",
//     sender: "F",
//     receiver: "C",
//     amount: 550,
//     timestamp: new Date("2023-01-02T11:15:00"),
//   },
// ];

// Initialize the graph
const graph = new MultiDirectedGraph();
transactions.forEach((t) => {
  if (!graph.hasNode(t.sender)) graph.addNode(t.sender);
  if (!graph.hasNode(t.receiver)) graph.addNode(t.receiver);
  graph.addDirectedEdgeWithKey(t.id, t.sender, t.receiver, {
    amount: t.amount,
    timestamp: t.timestamp,
  });
});

// 1. Temporal Structuring Detection
const structuringThresholds = {
  minTransactions: 3,
  maxAvgAmount: 1000,
  minTotal: 2000,
  timeWindow: 24 * 60 * 60 * 1000,
};

const suspiciousStructuring = [];
graph.forEachNode((sender) => {
  graph.forEachNode((receiver) => {
    const edges = graph.edges(sender, receiver);
    if (edges.length >= structuringThresholds.minTransactions) {
      const transactionsInPair = edges
        .map((edge) => ({
          id: edge,
          timestamp: graph.getEdgeAttribute(edge, "timestamp"),
          amount: graph.getEdgeAttribute(edge, "amount"),
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      let windowStart = 0;
      let windowTotal = 0;
      for (
        let windowEnd = 0;
        windowEnd < transactionsInPair.length;
        windowEnd++
      ) {
        windowTotal += transactionsInPair[windowEnd].amount;
        while (
          transactionsInPair[windowEnd].timestamp -
            transactionsInPair[windowStart].timestamp >
          structuringThresholds.timeWindow
        ) {
          windowTotal -= transactionsInPair[windowStart].amount;
          windowStart++;
        }
        const windowSize = windowEnd - windowStart + 1;
        if (windowSize >= structuringThresholds.minTransactions) {
          const windowAmounts = transactionsInPair
            .slice(windowStart, windowEnd + 1)
            .map((t) => t.amount);
          const totalAmount = windowAmounts.reduce((sum, amt) => sum + amt, 0);
          const avgAmount = totalAmount / windowSize;
          if (
            avgAmount < structuringThresholds.maxAvgAmount &&
            totalAmount > structuringThresholds.minTotal
          ) {
            suspiciousStructuring.push({
              sender,
              receiver,
              transactions: transactionsInPair
                .slice(windowStart, windowEnd + 1)
                .map((t) => t.id),
            });
          }
        }
      }
    }
  });
});

// 2. Temporal Cycle Detection
function findTemporalCycles(graph, maxLength, timeThreshold) {
  const visited = new Set();
  const cycles = [];
  graph.forEachNode((node) => {
    dfs(node, node, [], [], []);
    visited.add(node);
  });
  function dfs(currentNode, startNode, path, edgePath, timestamps) {
    // Prevent excessively long paths
    if (path.length > maxLength) return;

    // Check for a cycle
    if (currentNode === startNode && path.length > 1) {
      const cycleTimestamps = timestamps.slice();
      if (
        isIncreasing(cycleTimestamps) &&
        cycleTimestamps[cycleTimestamps.length - 1] - cycleTimestamps[0] <
          timeThreshold
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
  function isIncreasing(timestamps) {
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] <= timestamps[i - 1]) return false;
    }
    return true;
  }
  graph.forEachNode((node) => {
    dfs(node, node, [], []);
    visited.add(node);
  });
  return cycles;
}
const maxCycleLength = 4;
const timeThreshold = 7 * 24 * 60 * 60 * 1000;
const temporalCycles = findTemporalCycles(graph, maxCycleLength, timeThreshold);
const suspiciousTemporalCycles = temporalCycles
  .map((cycle) => {
    const edges = [];
    for (let i = 0; i < cycle.length - 1; i++) {
      const edge = graph.findEdge(cycle[i], cycle[i + 1]);
      edges.push(edge);
    }
    const amounts = edges.map((e) => graph.getEdgeAttribute(e, "amount"));
    const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0);
    return { cycle, transactions: edges, totalAmount };
  })
  .filter((c) => c.totalAmount > 1000);

// 3. Temporal Fan-Out/Fan-In Detection
const fanThresholds = {
  k: 3,
  m: 2,
  timeWindow1: 24 * 60 * 60 * 1000,
  timeWindow2: 24 * 60 * 60 * 1000,
};
const suspiciousFanPatterns = [];
graph.forEachNode((a) => {
  const outEdges = graph
    .outEdges(a)
    .map((edge) => ({
      edge,
      receiver: graph.target(edge),
      timestamp: graph.getEdgeAttribute(edge, "timestamp"),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
  let windowStart = 0;
  for (let windowEnd = 0; windowEnd < outEdges.length; windowEnd++) {
    while (
      outEdges[windowEnd].timestamp - outEdges[windowStart].timestamp >
      fanThresholds.timeWindow1
    ) {
      windowStart++;
    }
    const receiversInWindow = new Set(
      outEdges.slice(windowStart, windowEnd + 1).map((e) => e.receiver)
    );
    if (receiversInWindow.size >= fanThresholds.k) {
      const bNodes = Array.from(receiversInWindow);
      const fanInStartTime = outEdges[windowEnd].timestamp;
      const fanInEndTime = fanInStartTime + fanThresholds.timeWindow2;
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
            (t) => t.timestamp >= fanInStartTime && t.timestamp <= fanInEndTime
          );
      });
      const cNodes = {};
      fanInTransactions.forEach((t) => {
        if (!cNodes[t.receiver]) cNodes[t.receiver] = new Set();
        cNodes[t.receiver].add(t.sender);
      });
      for (const c in cNodes) {
        if (cNodes[c].size >= fanThresholds.m) {
          const involvedBs = Array.from(cNodes[c]);
          const fanOutEdges = outEdges
            .slice(windowStart, windowEnd + 1)
            .filter((e) => bNodes.includes(e.receiver));
          const fanInEdges = fanInTransactions.filter(
            (t) => t.receiver === c && involvedBs.includes(t.sender)
          );
          suspiciousFanPatterns.push({
            source: a,
            middle: involvedBs,
            sink: c,
            fanOutTransactions: fanOutEdges.map((e) => e.edge),
            fanInTransactions: fanInEdges.map((t) => t.edge),
          });
        }
      }
    }
  }
});

// 4. Velocity Analysis
const velocityThreshold = 1 * 60 * 60 * 1000;
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
    if (avgTimeDiff < velocityThreshold) {
      suspiciousVelocityAccounts.push({ account, avgTimeDiff });
    }
  }
});

// 5. Periodic Transaction Detection
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
const periodicThresholds = {
  minTransactions: 4,
  maxStdDev: 1 * 60 * 60 * 1000,
};
const suspiciousPeriodicPairs = [];
graph.forEachNode((sender) => {
  graph.forEachNode((receiver) => {
    const edges = graph.edges(sender, receiver);
    if (edges.length >= periodicThresholds.minTransactions) {
      const timestamps = edges
        .map((edge) => graph.getEdgeAttribute(edge, "timestamp"))
        .sort((a, b) => a - b);
      if (
        isPeriodic(
          timestamps,
          periodicThresholds.minTransactions,
          periodicThresholds.maxStdDev
        )
      ) {
        suspiciousPeriodicPairs.push({ sender, receiver, transactions: edges });
      }
    }
  });
});

// Collect and report suspicious transactions with reasons
const allSuspiciousTransactions = new Map();

suspiciousStructuring.forEach((s) => {
  s.transactions.forEach((tx) => {
    allSuspiciousTransactions.set(tx, "Structuring");
  });
});

suspiciousTemporalCycles.forEach((c) => {
  c.transactions.forEach((tx) => {
    allSuspiciousTransactions.set(tx, "Temporal Cycle");
  });
});

suspiciousFanPatterns.forEach((f) => {
  f.fanOutTransactions.forEach((tx) => {
    allSuspiciousTransactions.set(tx, "Fan-Out");
  });
  f.fanInTransactions.forEach((tx) => {
    allSuspiciousTransactions.set(tx, "Fan-In");
  });
});

suspiciousVelocityAccounts.forEach((a) => {
  graph.edges(a.account).forEach((tx) => {
    allSuspiciousTransactions.set(tx, "High Velocity");
  });
});

suspiciousPeriodicPairs.forEach((p) => {
  p.transactions.forEach((tx) => {
    allSuspiciousTransactions.set(tx, "Periodic");
  });
});

console.log("All Suspicious Transactions with Reasons:");
allSuspiciousTransactions.forEach((reason, tx) => {
  console.log(`Transaction ID: ${tx}, Reason: ${reason}`);
});
