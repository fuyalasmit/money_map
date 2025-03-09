import MainCard from "components/MainCard";
import ForceGraph3D from "react-force-graph-3d";
import { useState, useEffect, useRef, useCallback } from "react";
import SpriteText from "three-spritetext";
import transactionsData from "../../../transactions.json";
import {
  Stack,
  Box,
  Typography,
  IconButton,
  Dialog,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  DialogContent,
  DialogActions,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

// ==============================|| MULTIPLE SPANNING TREE ALGORITHMS ||============================== //

export default function MultipleSpanningTree() {
  const [algorithm, setAlgorithm] = useState("");
  const [graphData, setGraphData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [startNode, setStartNode] = useState("");
  const [userList, setUserList] = useState([]);
  const [growingGraph, setGrowingGraph] = useState({ nodes: [], links: [] });
  const [growthInterval, setGrowthInterval] = useState(null);
  const [showGrowingGraph, setShowGrowingGraph] = useState(false);
  const fsRef = useRef();
  const graphRef = useRef();

  // Initialize user list
  useEffect(() => {
    // Extract unique users from transactions
    const uniqueUsers = new Set();
    transactionsData.forEach((transaction) => {
      uniqueUsers.add(transaction.senderName);
      uniqueUsers.add(transaction.receiverName);
    });
    const userArray = Array.from(uniqueUsers).sort();
    setUserList(userArray);
  }, []);

  // Handle algorithm change
  const handleAlgorithmChange = (event) => {
    const selectedAlgo = event.target.value;
    setAlgorithm(selectedAlgo);

    // Reset start node when changing algorithms
    if (selectedAlgo !== "prim") {
      setStartNode("");
      // For Kruskal's algorithm, generate MST directly
      if (selectedAlgo === "kruskal") {
        generateMST(selectedAlgo);
      }
    }
  };

  // Disjoint Set operations for Kruskal's algorithm
  const makeSet = (vertices) => {
    const parent = {};
    vertices.forEach((vertex) => {
      parent[vertex] = vertex;
    });
    return parent;
  };

  const find = (parent, vertex) => {
    if (parent[vertex] !== vertex) {
      parent[vertex] = find(parent, parent[vertex]);
    }
    return parent[vertex];
  };

  const union = (parent, x, y) => {
    parent[find(parent, x)] = find(parent, y);
  };

  // Handle start node selection and generate MST for Prim's
  const handleStartNodeChange = (event) => {
    const selectedNode = event.target.value;
    setStartNode(selectedNode);

    // Generate MST if a node is selected
    if (selectedNode) {
      generateMST("prim", selectedNode);
    }
  };

  // Generate MST using the selected algorithm
  const generateMST = (algo, startUser = null) => {
    // Stop any existing growth animation
    if (growthInterval) {
      clearInterval(growthInterval);
      setGrowthInterval(null);
    }

    // Reset growing graph
    setGrowingGraph({ nodes: [], links: [] });
    setShowGrowingGraph(false);

    // Extract unique users and transactions
    const users = new Set();
    transactionsData.forEach((transaction) => {
      users.add(transaction.senderName);
      users.add(transaction.receiverName);
    });
    const uniqueUsers = Array.from(users);

    // Format transactions for MST
    const transactions = transactionsData.map((transaction) => ({
      source: transaction.senderName,
      target: transaction.receiverName,
      amount: Number(transaction.amount),
      transactionId: transaction.transactionId,
      isSuspicious: transaction.label === "suspicious",
      remarks: transaction.remarks,
    }));

    // Generate MST based on algorithm
    let mstEdges = [];

    if (algo === "kruskal") {
      // Kruskal's Algorithm with dynamic edge selection
      // Sort all edges in non-decreasing order of their weight (amount)
      const sortedTransactions = [...transactions].sort(
        (a, b) => a.amount - b.amount
      );

      // Create a disjoint set for each user
      const parent = makeSet(uniqueUsers);

      // Group edges by weight ranges for dynamic selection
      const weightRanges = {};
      const rangeSize = 1000; // Adjust based on typical transaction amounts

      sortedTransactions.forEach((transaction) => {
        const range = Math.floor(transaction.amount / rangeSize);
        if (!weightRanges[range]) {
          weightRanges[range] = [];
        }
        weightRanges[range].push(transaction);
      });

      const ranges = Object.keys(weightRanges).sort((a, b) => a - b);

      // Process edges dynamically within weight ranges
      for (const range of ranges) {
        // Randomize edges within each weight range while maintaining the overall minimum weight property
        const edgesInRange = weightRanges[range].sort(
          () => Math.random() - 0.5
        );

        for (const transaction of edgesInRange) {
          const sourceRoot = find(parent, transaction.source);
          const targetRoot = find(parent, transaction.target);

          // If including this edge doesn't cause a cycle, include it in MST
          if (sourceRoot !== targetRoot) {
            mstEdges.push(transaction);
            union(parent, transaction.source, transaction.target);
          }

          // Break if we have n-1 edges (MST is complete)
          if (mstEdges.length === uniqueUsers.length - 1) break;
        }

        // Check if MST is complete after processing this range
        if (mstEdges.length === uniqueUsers.length - 1) break;
      }
    } else if (algo === "prim") {
      // Prim's Algorithm
      if (!startUser) {
        return; // Exit if no starting user is provided
      }

      // Create a set to track vertices added to MST
      const visited = new Set();
      visited.add(startUser);

      // Track edges in the MST
      const adjacencyList = {};

      // Initialize adjacency list for all vertices
      uniqueUsers.forEach((user) => {
        adjacencyList[user] = [];
      });

      // Build adjacency list
      transactions.forEach((transaction) => {
        adjacencyList[transaction.source].push({
          target: transaction.target,
          amount: transaction.amount,
          ...transaction,
        });
        adjacencyList[transaction.target].push({
          target: transaction.source,
          amount: transaction.amount,
          ...transaction,
        });
      });

      // Run Prim's algorithm
      while (visited.size < uniqueUsers.length) {
        let minEdge = null;

        // Find the minimum weighted edge from visited to unvisited vertices
        visited.forEach((user) => {
          adjacencyList[user].forEach((edge) => {
            if (!visited.has(edge.target)) {
              if (!minEdge || edge.amount < minEdge.amount) {
                minEdge = {
                  source: user,
                  target: edge.target,
                  amount: edge.amount,
                  transactionId: edge.transactionId,
                  isSuspicious: edge.isSuspicious,
                  remarks: edge.remarks,
                };
              }
            }
          });
        });

        if (minEdge) {
          visited.add(minEdge.target);
          mstEdges.push(minEdge);
        } else {
          // Graph might be disconnected
          break;
        }
      }
    }

    // Create graph data from MST
    const nodes = [];
    const nodeSet = new Set();

    mstEdges.forEach((edge) => {
      if (!nodeSet.has(edge.source)) {
        nodes.push({
          id: edge.source,
          suspicious: edge.isSuspicious,
        });
        nodeSet.add(edge.source);
      }
      if (!nodeSet.has(edge.target)) {
        nodes.push({
          id: edge.target,
          suspicious: edge.isSuspicious,
        });
        nodeSet.add(edge.target);
      }
    });

    const mstData = {
      nodes,
      links: mstEdges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        amount: edge.amount,
        transactionId: edge.transactionId,
        isSuspicious: edge.isSuspicious,
        remarks: edge.remarks || "Transaction",
      })),
    };

    setGraphData(mstData);

    // Set up growing graph animation
    setGrowingGraph({
      nodes: nodes.length > 0 ? [nodes[0]] : [],
      links: [],
    });
    setShowGrowingGraph(false);
  };

  // Toggle growing graph animation
  const toggleGrowingGraph = () => {
    if (showGrowingGraph) {
      // Stop animation
      if (growthInterval) {
        clearInterval(growthInterval);
        setGrowthInterval(null);
      }
      setShowGrowingGraph(false);
      // Reset to full graph
      if (graphData) {
        setGrowingGraph({
          nodes: graphData.nodes.slice(0, 1),
          links: [],
        });
      }
    } else {
      // Start animation
      setShowGrowingGraph(true);

      // Initialize with first node
      if (graphData && graphData.nodes.length > 0) {
        setGrowingGraph({
          nodes: [graphData.nodes[0]],
          links: [],
        });

        let nodeIndex = 1;
        let linkIndex = 0;

        // Add nodes and links gradually
        const interval = setInterval(() => {
          setGrowingGraph((prev) => {
            const newGraph = { ...prev };

            // Add next node if available
            if (nodeIndex < graphData.nodes.length) {
              newGraph.nodes = [...prev.nodes, graphData.nodes[nodeIndex]];
              nodeIndex++;
            }

            // Add next link if available and both endpoints exist
            if (linkIndex < graphData.links.length) {
              const link = graphData.links[linkIndex];
              const sourceExists = newGraph.nodes.some(
                (n) => n.id === link.source || n.id === link.source.id
              );
              const targetExists = newGraph.nodes.some(
                (n) => n.id === link.target || n.id === link.target.id
              );

              if (sourceExists && targetExists) {
                newGraph.links = [...prev.links, link];
                linkIndex++;
              }
            }

            // Stop animation when complete
            if (
              nodeIndex >= graphData.nodes.length &&
              linkIndex >= graphData.links.length
            ) {
              clearInterval(growthInterval);
              setGrowthInterval(null);
            }

            return newGraph;
          });
        }, 1000); // Add new element every second

        setGrowthInterval(interval);
      }
    }
  };

  // Handle node click to focus the camera
  const handleNodeClick = useCallback((node, ref) => {
    // Aim at node from outside it
    const distance = 100;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    ref.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      1000
    );
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Render the graph component
  const renderGraph = (fullscreen = false, ref) => {
    const data = showGrowingGraph ? growingGraph : graphData;

    if (!data) return null;

    return (
      <ForceGraph3D
        ref={ref}
        graphData={data}
        nodeLabel="id"
        nodeColor={(node) => (node.suspicious ? "red" : "#00aaff")}
        backgroundColor="#000011"
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        onNodeClick={(node) => handleNodeClick(node, ref)}
        linkColor={(link) =>
          link.isSuspicious ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 255, 0, 0.5)"
        }
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkWidth={(link) => (link.isSuspicious ? 2 : 1)}
        nodeThreeObject={(node) => {
          const sprite = new SpriteText(node.id);
          sprite.color = node.suspicious ? "red" : "#00aaff";
          sprite.textHeight = fullscreen ? 8 : 6;
          return sprite;
        }}
        linkThreeObjectExtend={true}
        linkThreeObject={(link) => {
          const sprite = new SpriteText(
            `₹${Number(link.amount).toLocaleString()}`
          );
          sprite.color = link.isSuspicious ? "#ffcccc" : "lightgreen";
          sprite.textHeight = fullscreen ? 5 : 4;
          sprite.fontWeight = "bold";
          sprite.backgroundColor = link.isSuspicious
            ? "rgba(50, 0, 0, 0.2)"
            : "rgba(0, 50, 0, 0.2)";
          sprite.padding = 2;
          sprite.borderRadius = 2;
          return sprite;
        }}
        linkPositionUpdate={(sprite, { start, end }) => {
          const middlePos = Object.assign(
            ...["x", "y", "z"].map((c) => ({
              [c]: start[c] + (end[c] - start[c]) / 2,
            }))
          );
          Object.assign(sprite.position, middlePos);
          if (sprite.material) {
            sprite.material.depthWrite = false;
          }
        }}
        cooldownTime={3000}
        onEngineStop={() => {
          if (ref.current) {
            ref.current.zoomToFit(300, 500);
          }
        }}
      />
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (growthInterval) {
        clearInterval(growthInterval);
      }
    };
  }, [growthInterval]);

  return (
    <MainCard
      title={
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Typography variant="h3">Spanning Tree Algorithms</Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="algorithm-label">Select Algorithm</InputLabel>
              <Select
                labelId="algorithm-label"
                id="algorithm-select"
                value={algorithm}
                label="Select Algorithm"
                onChange={handleAlgorithmChange}
              >
                <MenuItem value="kruskal">Kruskal's Algorithm</MenuItem>
                <MenuItem value="prim">Prim's Algorithm</MenuItem>
              </Select>
            </FormControl>

            {/* Show Prim's starting node selector only when Prim's is selected */}
            {algorithm === "prim" && (
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="start-node-label">Starting User</InputLabel>
                <Select
                  labelId="start-node-label"
                  id="start-node-select"
                  value={startNode}
                  label="Starting User"
                  onChange={handleStartNodeChange}
                >
                  {userList.map((user) => (
                    <MenuItem key={user} value={user}>
                      {user}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {graphData && (
              <Button
                variant="contained"
                onClick={toggleGrowingGraph}
                color={showGrowingGraph ? "secondary" : "primary"}
              >
                {showGrowingGraph ? "Stop Growth" : "Show Growing Graph"}
              </Button>
            )}
            <IconButton
              onClick={toggleFullscreen}
              sx={{
                bgcolor: "white",
                border: "1px solid",
                borderColor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.main",
                  "& .MuiSvgIcon-root": {
                    color: "white",
                  },
                },
              }}
              aria-label="fullscreen"
            >
              <FullscreenIcon color="primary" />
            </IconButton>
          </Box>
        </Stack>
      }
    >
      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          {algorithm === "kruskal" &&
            "Kruskal's Algorithm - Global Optimization by Transaction Amount"}
          {algorithm === "prim" &&
            "Prim's Algorithm - Growing from a Single User"}
        </Typography>
        <Typography variant="body1" paragraph>
          {algorithm === "kruskal" &&
            "This algorithm sorts all transactions by amount and builds a minimum spanning tree, ensuring an optimal network with the lowest overall cost."}
          {algorithm === "prim" &&
            "This algorithm starts from a specific user and expands by adding the smallest transaction at each step, optimizing local connections first."}
        </Typography>
      </Box>

      {graphData ? (
        <Box
          sx={{ height: "600px", width: "100%", position: "relative", mt: 2 }}
        >
          {renderGraph(false, graphRef)}
        </Box>
      ) : (
        <Box sx={{ mt: 4, textAlign: "center", py: 10 }}>
          <Typography variant="h5" color="textSecondary">
            {algorithm === "prim" && !startNode
              ? "Select a starting user to generate a spanning tree"
              : algorithm === ""
                ? "Select an algorithm to generate a spanning tree"
                : "Preparing spanning tree visualization..."}
          </Typography>
        </Box>
      )}

      {/* Fullscreen Dialog */}
      <Dialog
        fullScreen
        open={isFullscreen}
        onClose={toggleFullscreen}
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "#000011",
            m: 0,
            p: 0,
          },
        }}
      >
        <Box sx={{ height: "100vh", width: "100%", position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
            }}
          >
            <IconButton
              onClick={toggleFullscreen}
              sx={{
                bgcolor: "white",
                "&:hover": {
                  bgcolor: "primary.main",
                  "& .MuiSvgIcon-root": {
                    color: "white",
                  },
                },
              }}
              aria-label="exit fullscreen"
            >
              <FullscreenExitIcon color="primary" />
            </IconButton>
          </Box>
          {renderGraph(true, fsRef)}
        </Box>
      </Dialog>
    </MainCard>
  );
}
