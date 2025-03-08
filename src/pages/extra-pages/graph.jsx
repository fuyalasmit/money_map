import MainCard from "components/MainCard";
import ForceGraph3D from "react-force-graph-3d";
import { useState, useEffect, useRef } from "react";
import SpriteText from "three-spritetext";
import transactionsData from "../../../transactions.json"; // Adjust path as needed
import { Stack, Box, Typography, IconButton, Dialog } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/Fullscreen";

// ==============================|| GRAPH PAGE ||============================== //

export default function GraphPage() {
  const [graphData, setGraphData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false); // Added fullscreen state
  const fsRef = useRef(); // Reference for fullscreen graph

  useEffect(() => {
    // Transform transactions into graph data
    const processTransactions = () => {
      // Create a map to track unique persons (senders/receivers)
      const uniquePersons = new Map();

      // Track persons involved in suspicious transactions directly
      const suspiciousPersons = new Set();

      // Track all transactions for later analysis
      const personTransactions = new Map(); // Map of person -> array of transactions

      // First pass: identify all suspicious transactions and build transaction map
      transactionsData.forEach((transaction) => {
        // Track transaction by sender
        if (!personTransactions.has(transaction.senderName)) {
          personTransactions.set(transaction.senderName, []);
        }
        personTransactions.get(transaction.senderName).push(transaction);

        // Track transaction by receiver
        if (!personTransactions.has(transaction.receiverName)) {
          personTransactions.set(transaction.receiverName, []);
        }
        personTransactions.get(transaction.receiverName).push(transaction);

        // Mark participants in suspicious transactions
        if (transaction.label === "suspicious") {
          suspiciousPersons.add(transaction.senderName);
          suspiciousPersons.add(transaction.receiverName);
        }
      });

      // Second pass: expand suspicious status to receivers of money from suspicious senders
      let changed = true;
      while (changed) {
        changed = false;

        // Loop through all transactions
        transactionsData.forEach((transaction) => {
          // If sender is suspicious but receiver is not yet marked suspicious
          if (
            suspiciousPersons.has(transaction.senderName) &&
            !suspiciousPersons.has(transaction.receiverName)
          ) {
            suspiciousPersons.add(transaction.receiverName);
            changed = true;
          }
        });
      }

      // Create nodes for all persons
      transactionsData.forEach((transaction) => {
        if (!uniquePersons.has(transaction.senderName)) {
          uniquePersons.set(transaction.senderName, {
            id: transaction.senderName,
            group: suspiciousPersons.has(transaction.senderName) ? 0 : 1, // Group 0 for suspicious
            account: transaction.senderAccount,
            suspicious: suspiciousPersons.has(transaction.senderName),
          });
        }

        if (!uniquePersons.has(transaction.receiverName)) {
          uniquePersons.set(transaction.receiverName, {
            id: transaction.receiverName,
            group: suspiciousPersons.has(transaction.receiverName) ? 0 : 2, // Group 0 for suspicious
            account: transaction.receiverAccount,
            suspicious: suspiciousPersons.has(transaction.receiverName),
          });
        }
      });

      // Create nodes and links
      const nodes = Array.from(uniquePersons.values());
      const links = transactionsData.map((transaction) => ({
        source: transaction.senderName,
        target: transaction.receiverName,
        amount: transaction.amount,
        timestamp: transaction.timestamp,
        transactionId: transaction.transactionId,
        remarks: transaction.remarks,
        label: transaction.label,
        // Mark link as suspicious if transaction is labeled suspicious OR if the sender is suspicious
        isSuspicious:
          transaction.label === "suspicious" ||
          suspiciousPersons.has(transaction.senderName),
      }));

      return { nodes, links };
    };

    setGraphData(processTransactions());
  }, []);

  // Set initial zoom for fullscreen graph
  useEffect(() => {
    if (fsRef.current && isFullscreen) {
      // Set a small timeout to let the graph initialize first
      setTimeout(() => {
        fsRef.current.zoomToFit(400);
      }, 100);
    }
  }, [isFullscreen]);

  if (!graphData) return <div>Loading...</div>;

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Graph props for 3D view
  const graphProps = {
    graphData: graphData,
    nodeLabel: "id",
    nodeAutoColorBy: "group",
    backgroundColor: "#000011",
    onNodeDragEnd: (node) => {
      node.fx = node.x;
      node.fy = node.y;
      node.fz = node.z;
    },
    linkDirectionalArrowLength: 3.5,
    linkDirectionalArrowRelPos: 1,
  };

  // Render the graph component
  const renderGraph = (fullscreen = false, ref) => {
    return (
      <ForceGraph3D
        ref={ref}
        graphData={graphData}
        nodeLabel="id"
        // Use custom node coloring instead of automatic coloring
        nodeColor={(node) => (node.suspicious ? "red" : "#00aaff")} // Red for suspicious, Blue for clean
        backgroundColor="#000011"
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        // Color links based on suspicious flag
        linkColor={(link) =>
          link.isSuspicious ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 170, 255, 0.5)"
        }
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkWidth={(link) => (link.isSuspicious ? 2 : 1)} // Make suspicious links thicker
        nodeThreeObject={(node) => {
          const sprite = new SpriteText(node.id);
          // Set color explicitly based on suspicious flag
          sprite.color = node.suspicious ? "red" : "#00aaff";
          sprite.textHeight = fullscreen ? 8 : 6;
          return sprite;
        }}
        linkThreeObjectExtend={true}
        linkThreeObject={(link) => {
          // Add amount text to the link
          const sprite = new SpriteText(
            `₹${Number(link.amount).toLocaleString()}`
          );
          sprite.color = link.isSuspicious ? "#ffcccc" : "lightgreen"; // Light red for suspicious amounts
          sprite.textHeight = fullscreen ? 4 : 3;
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
        }}
        controlType="orbit"
        rendererConfig={{
          antialias: true,
          alpha: true,
        }}
      />
    );
  };

  return (
    <>
      <MainCard
        title={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Typography variant="h3">Transaction Network Graph</Typography>
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
        }
      >
        <Box sx={{ height: "600px", width: "100%", position: "relative" }}>
          {renderGraph(false)}
        </Box>
      </MainCard>

      {/* Fullscreen Dialog */}
      <Dialog
        fullScreen
        open={isFullscreen}
        onClose={toggleFullscreen}
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "#000011", // Match the graph background
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
    </>
  );
}
