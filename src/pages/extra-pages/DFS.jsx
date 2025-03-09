import React, { useState, useEffect, useRef, useCallback } from "react";
import MainCard from "components/MainCard";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import transactionsData from "../../../transactions.json";
import {
  Stack,
  Box,
  Typography,
  IconButton,
  Dialog,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// ==============================|| DFS ALGORITHM PAGE ||============================== //

export default function DFSPage() {
  const [adjacencyList, setAdjacencyList] = useState(null);
  const [userList, setUserList] = useState([]);
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [allPaths, setAllPaths] = useState([]);
  const [selectedPathIndex, setSelectedPathIndex] = useState(0);
  const [graphData, setGraphData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selfLoopsExist, setSelfLoopsExist] = useState(false);
  const graphRef = useRef();
  const fsRef = useRef();

  // Initialize data
  useEffect(() => {
    // Extract unique users from transactions
    const uniqueUsers = new Set();
    transactionsData.forEach((transaction) => {
      uniqueUsers.add(transaction.senderName);
      uniqueUsers.add(transaction.receiverName);
    });
    const userArray = Array.from(uniqueUsers).sort();
    setUserList(userArray);

    // Create adjacency list for directed graph
    const adjList = {};

    // Initialize empty adjacency list for all users
    userArray.forEach((user) => {
      adjList[user] = [];
    });

    // Check for self-loops
    let selfLoops = false;

    // Fill adjacency list based on transactions
    transactionsData.forEach((transaction) => {
      const { senderName, receiverName } = transaction;

      // Detect self-loops
      if (senderName === receiverName) {
        selfLoops = true;
      }

      // Store the transaction detail in the adjacency list for faster path lookup
      adjList[senderName].push({
        target: receiverName,
        transaction,
      });
    });

    setSelfLoopsExist(selfLoops);
    setAdjacencyList(adjList);
  }, []);

  // Helper function to check if a path is unique compared to existing paths
  const isPathUnique = (newPath, existingPaths) => {
    // Convert path to a string representation for easy comparison
    const pathStr = JSON.stringify(newPath.path);

    // Check against all existing paths
    for (const existingPath of existingPaths) {
      // If paths have same nodes in same order, they're duplicates
      if (JSON.stringify(existingPath.path) === pathStr) {
        return false;
      }
    }
    return true;
  };

  // Helper function to detect if a path contains redundant cycles (e.g. A→B→C→A→B→C)
  const hasRedundantCycles = (path) => {
    // For paths shorter than 5, no need to check for redundant subcycles
    if (path.length < 5) return false;

    // Look for repeated patterns in the path
    for (let patternLen = 2; patternLen <= path.length / 2; patternLen++) {
      // Check if the last segment matches an earlier segment of the same length
      const lastSegment = path.slice(-patternLen);
      for (let i = 0; i <= path.length - 2 * patternLen; i++) {
        const segment = path.slice(i, i + patternLen);
        if (JSON.stringify(segment) === JSON.stringify(lastSegment)) {
          return true;
        }
      }
    }
    return false;
  };

  // Find all paths between two users using DFS
  const findAllPaths = (start, end) => {
    if (!adjacencyList) return [];

    // Case where start and end are the same - handle specially
    if (start === end) {
      const selfLoopPaths = findSelfLoopPaths(start);
      return selfLoopPaths;
    }

    const allFoundPaths = [];
    const visited = new Set();
    const MAX_PATHS = 20; // Limit to prevent excessive computation
    const MAX_PATH_LENGTH = 8; // Limit path length to avoid very long paths

    // DFS function to find all paths
    function dfs(currentUser, targetUser, currentPath = [], transactions = []) {
      // Stop if we've found too many paths already
      if (allFoundPaths.length >= MAX_PATHS) return;

      // Stop if the path is getting too long
      if (currentPath.length > MAX_PATH_LENGTH) return;

      // Add current user to path and mark as visited
      currentPath.push(currentUser);
      visited.add(currentUser);

      // If we reached the target, add this path to our results if it's unique
      if (currentUser === targetUser) {
        const newPath = {
          path: [...currentPath],
          transactions: [...transactions],
        };

        // Only add paths that are unique and don't have redundant cycles
        if (
          !hasRedundantCycles(newPath.path) &&
          isPathUnique(newPath, allFoundPaths)
        ) {
          allFoundPaths.push(newPath);
        }
      } else {
        // For each neighbor, if not visited, continue the DFS
        for (const neighbor of adjacencyList[currentUser]) {
          if (!visited.has(neighbor.target)) {
            // Add transaction to path transactions
            dfs(neighbor.target, targetUser, currentPath, [
              ...transactions,
              neighbor.transaction,
            ]);
          }
        }
      }

      // Backtrack: remove current node from path and mark as not visited
      currentPath.pop();
      visited.delete(currentUser);
    }

    // Start DFS from the start user
    dfs(start, end);

    // Sort paths by length (shortest first)
    allFoundPaths.sort((a, b) => a.path.length - b.path.length);

    return allFoundPaths;
  };

  // Special function to find paths that start and end with the same user (cycles)
  const findSelfLoopPaths = (user) => {
    if (!adjacencyList) return [];

    const paths = [];
    const MAX_PATHS = 15;
    const MAX_CYCLE_LENGTH = 6;

    // First, check for direct self-transactions
    const directSelfLoops = adjacencyList[user].filter(
      (neighbor) => neighbor.target === user
    );

    // Add direct self-loops to paths
    directSelfLoops.forEach((neighbor) => {
      paths.push({
        path: [user, user],
        transactions: [neighbor.transaction],
      });
    });

    // Then find cycles through other nodes using DFS
    const visited = new Set();

    function findCycles(
      currentUser,
      startUser,
      depth,
      currentPath = [],
      transactions = []
    ) {
      // Stop if we've found enough paths
      if (paths.length >= MAX_PATHS) return;

      // Stop if we're going too deep
      if (depth > MAX_CYCLE_LENGTH) return;

      // Add current user to path and mark as visited
      currentPath.push(currentUser);
      visited.add(currentUser);

      // Check neighbors for cycles back to start
      for (const neighbor of adjacencyList[currentUser]) {
        // If we found our way back to the start and path is at least length 3 (to avoid direct self-loops)
        if (neighbor.target === startUser && currentPath.length > 1) {
          const cyclePath = [...currentPath, startUser];
          const cycleTransactions = [...transactions, neighbor.transaction];

          const newPath = {
            path: cyclePath,
            transactions: cycleTransactions,
          };

          // Add unique, non-redundant cycles
          if (!hasRedundantCycles(cyclePath) && isPathUnique(newPath, paths)) {
            paths.push(newPath);
          }
        }
        // Otherwise, continue exploring if neighbor not visited
        else if (!visited.has(neighbor.target)) {
          findCycles(neighbor.target, startUser, depth + 1, currentPath, [
            ...transactions,
            neighbor.transaction,
          ]);
        }
      }

      // Backtrack
      currentPath.pop();
      visited.delete(currentUser);
    }

    // Start the cycle finding process
    findCycles(user, user, 0, [], []);

    // Sort by path length
    paths.sort((a, b) => a.path.length - b.path.length);

    return paths;
  };

  // Check for paths between selected users
  const checkPaths = () => {
    if (!user1 || !user2) {
      alert("Please select both users");
      return;
    }

    if (!adjacencyList) return;

    const paths = findAllPaths(user1, user2);
    setAllPaths(paths);

    if (paths.length > 0) {
      setSelectedPathIndex(0);
      createPathGraph(paths[0].path, paths[0].transactions);
    } else {
      setGraphData(null);
    }
  };

  // Create a filtered graph showing only the selected path
  const createPathGraph = (pathUsers, pathTransactions) => {
    if (!pathUsers || pathUsers.length < 2) return;

    // Create a map to track unique persons (senders/receivers)
    const uniquePersons = new Map();

    // Track suspicious persons
    const suspiciousPersons = new Set();

    // Track reasons for suspicious activity by person
    const personReasons = new Map();

    // Identify suspicious persons in the path and collect reasons
    pathUsers.forEach((user) => {
      const suspiciousTransactions = transactionsData.filter(
        (t) =>
          (t.senderName === user || t.receiverName === user) &&
          t.label === "suspicious"
      );

      if (suspiciousTransactions.length > 0) {
        suspiciousPersons.add(user);

        // Initialize reason set if it doesn't exist
        if (!personReasons.has(user)) {
          personReasons.set(user, new Set());
        }

        // Add each reason to the person's set
        suspiciousTransactions.forEach((transaction) => {
          if (transaction.reasons && transaction.reasons.length > 0) {
            transaction.reasons.forEach((reason) => {
              personReasons.get(user).add(reason);
            });
          }
        });
      }
    });

    // Create nodes for each user in the path
    pathUsers.forEach((user) => {
      uniquePersons.set(user, {
        id: user,
        group: suspiciousPersons.has(user) ? 0 : 2,
        suspicious: suspiciousPersons.has(user),
        isSource: user === user1,
        isTarget: user === user2,
        // Add reasons array if this is a suspicious person
        reasons: personReasons.has(user)
          ? Array.from(personReasons.get(user))
          : [],
      });
    });

    // Create links between consecutive users in the path based on actual transactions
    const links = [];
    for (let i = 0; i < pathUsers.length - 1; i++) {
      const source = pathUsers[i];
      const target = pathUsers[i + 1];

      // Find the transaction between these users from our path transactions
      const transaction = pathTransactions[i] || {
        amount: "0",
        label: "clean",
      };

      links.push({
        source: source,
        target: target,
        amount: transaction.amount || "0",
        timestamp: transaction.timestamp || "",
        transactionId: transaction.transactionId || "",
        remarks: transaction.remarks || "Path Connection",
        isSuspicious: transaction.label === "suspicious",
      });
    }

    setGraphData({
      nodes: Array.from(uniquePersons.values()),
      links: links,
    });
  };

  // Select a different path to visualize
  const selectPath = (index) => {
    if (index >= 0 && index < allPaths.length) {
      setSelectedPathIndex(index);
      createPathGraph(allPaths[index].path, allPaths[index].transactions);
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
    if (!graphData) return null;

    return (
      <ForceGraph3D
        ref={ref}
        graphData={graphData}
        nodeLabel={(node) => {
          // For suspicious nodes, show name, emoji and reasons
          if (node.suspicious && node.reasons && node.reasons.length > 0) {
            return `${node.id}\n⚠️ ${node.reasons.join(", ")}`;
          }
          // For non-suspicious nodes, show ID
          return node.id;
        }}
        nodeColor={(node) => {
          if (node.isSource) return "#ff8c00"; // Source node - orange
          if (node.isTarget) return "#00ff00"; // Target node - green
          return node.suspicious ? "red" : "#00aaff"; // Other nodes
        }}
        backgroundColor="#000011"
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        onNodeClick={(node) => handleNodeClick(node, ref)}
        linkColor={(link) =>
          link.isSuspicious ? "rgba(255, 0, 0, 0.5)" : "rgba(255, 255, 0, 0.5)"
        }
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkWidth={(link) => (link.isSuspicious ? 2 : 1.5)}
        nodeThreeObject={(node) => {
          const sprite = new SpriteText(node.id);
          if (node.isSource)
            sprite.color = "#ff8c00"; // Source node - orange
          else if (node.isTarget)
            sprite.color = "#00ff00"; // Target node - green
          else sprite.color = node.suspicious ? "red" : "#00aaff";
          sprite.textHeight = fullscreen ? 8 : 6;
          return sprite;
        }}
        linkThreeObjectExtend={true}
        linkThreeObject={(link) => {
          // Add amount text to the link
          const sprite = new SpriteText(
            `Rs ${Number(link.amount).toLocaleString()}`
          );

          // Color transaction amount text
          sprite.color = link.isSuspicious ? "#ffcccc" : "lightgreen";
          sprite.textHeight = fullscreen ? 5 : 4;
          sprite.fontWeight = "bold";
          sprite.backgroundColor = link.isSuspicious
            ? "rgba(50, 0, 0, 0.2)"
            : "rgba(50, 50, 0, 0.2)";
          sprite.padding = 2;
          sprite.borderRadius = 2;

          return sprite;
        }}
        linkPositionUpdate={(sprite, { start, end }) => {
          // Position the text in the middle of the link
          const middlePos = Object.assign(
            ...["x", "y", "z"].map((c) => ({
              [c]: start[c] + (end[c] - start[c]) / 2,
            }))
          );

          // Position sprite
          Object.assign(sprite.position, middlePos);

          // Make text always face the camera
          if (sprite.material) {
            sprite.material.depthWrite = false;
          }
        }}
        controlType="orbit"
        rendererConfig={{
          antialias: true,
          alpha: true,
        }}
        d3Force={{
          link: (d3) =>
            d3
              .forceLink()
              .id((d) => d.id)
              .distance(() => 70),
          charge: () => -400,
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

  return (
    <MainCard
      title={
        <Typography variant="h3">
          DFS Algorithm - Multiple Path Detection
        </Typography>
      }
    >
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Find All Paths Between Users
        </Typography>

        {selfLoopsExist && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Self-transactions detected in the dataset. You can search for paths
            where a person sends money to themselves.
          </Alert>
        )}

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth>
              <InputLabel id="user1-label">Source User</InputLabel>
              <Select
                labelId="user1-label"
                id="user1"
                value={user1}
                label="Source User"
                onChange={(e) => setUser1(e.target.value)}
              >
                {userList.map((user) => (
                  <MenuItem key={user} value={user}>
                    {user}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={5}>
            <FormControl fullWidth>
              <InputLabel id="user2-label">Destination User</InputLabel>
              <Select
                labelId="user2-label"
                id="user2"
                value={user2}
                label="Destination User"
                onChange={(e) => setUser2(e.target.value)}
              >
                {userList.map((user) => (
                  <MenuItem key={user} value={user}>
                    {user}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<SearchIcon />}
              onClick={checkPaths}
              disabled={!user1 || !user2}
            >
              Find Paths
            </Button>
          </Grid>

          {allPaths.length === 0 && user1 && user2 && (
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: "error.light",
                  color: "error.contrastText",
                }}
              >
                <Typography variant="h6">
                  No path exists between these users.
                </Typography>
                {user1 === user2 && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    No self-transactions or cyclic paths found for this user.
                  </Typography>
                )}
              </Paper>
            </Grid>
          )}

          {allPaths.length > 0 && (
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: "success.light",
                  color: "success.contrastText",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {allPaths.length} Path{allPaths.length > 1 ? "s" : ""} Found!
                </Typography>

                {user1 === user2 && allPaths.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Showing cyclic paths where {user1} sends money to themself
                    either directly or through others.
                  </Alert>
                )}

                <Accordion defaultExpanded>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="paths-content"
                    id="paths-header"
                  >
                    <Typography>Select a path to visualize</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Tabs
                      value={selectedPathIndex}
                      onChange={(e, newValue) => selectPath(newValue)}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{ mb: 2 }}
                    >
                      {allPaths.map((_, index) => (
                        <Tab key={index} label={`Path ${index + 1}`} />
                      ))}
                    </Tabs>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      {allPaths[selectedPathIndex]?.path.map((node, index) => (
                        <React.Fragment key={node + index}>
                          <Chip
                            label={node}
                            color={
                              index === 0
                                ? "warning"
                                : index ===
                                    allPaths[selectedPathIndex].path.length - 1
                                  ? "success"
                                  : "primary"
                            }
                          />
                          {index <
                            allPaths[selectedPathIndex].path.length - 1 && (
                            <Typography variant="body1">→</Typography>
                          )}
                        </React.Fragment>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>

      {graphData && (
        <Box sx={{ mt: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h4">Path Visualization</Typography>
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
          </Stack>
          <Box sx={{ height: "600px", width: "100%", position: "relative" }}>
            {renderGraph(false, graphRef)}
          </Box>
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
