import React, { useState, useEffect, useRef, useCallback } from "react";
import MainCard from "components/MainCard";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import {
  Stack,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  Paper,
  Divider,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";

export default function SuspiciousActivityPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [suspiciousTypes, setSuspiciousTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [graphData, setGraphData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const graphRef = useRef();
  const fsRef = useRef();

  // Descriptions for each suspicious activity type
  const patternDescriptions = {
    Structuring:
      "Multiple smaller transactions used to avoid detection thresholds. This pattern involves breaking large amounts into several smaller transfers, typically below ₹1,000, that together exceed ₹2,000 within a 24-hour period.",
    "Temporal Cycle":
      "Money flowing in a circular pattern through multiple accounts (e.g., A→B→C→A). These cycles typically complete within 7 days and involve transactions exceeding ₹1,000.",
    "High Velocity":
      "Rapid movement of funds through accounts with minimal holding time. Transactions where money is received and sent out again within 30 minutes suggest use of the account as a conduit rather than a destination.",
    "Fan Pattern":
      "Funds from one source spreading to multiple receivers (fan-out), then converging at a single destination (fan-in). This pattern indicates potential layering to obscure the money trail.",
    Periodic:
      "Regular, predictable transfer patterns suggesting automated or scheduled transactions. Requires at least 5 transactions with minimal time variation between transfers.",
    "Large Amount":
      "Single transactions exceeding the system threshold of ₹50,000, which may indicate significant financial activity requiring additional scrutiny.",
    Reciprocal:
      "Money quickly sent back to the original sender with minimal changes in amount. Transactions occurring within 30 minutes with less than ₹100 difference suggest potential wash trading.",
  };

  // Fetch transactions when component mounts
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5001/get-transactions");
        if (!response.ok) throw new Error("Failed to fetch transactions");

        const data = await response.json();

        // Filter only suspicious transactions
        const suspiciousData = data.filter((tx) => tx.label === "suspicious");
        setTransactions(suspiciousData);

        // Extract unique suspicious pattern types
        const uniqueTypes = new Set();
        suspiciousData.forEach((tx) => {
          if (tx.reasons && tx.reasons.length > 0) {
            tx.reasons.forEach((reason) => uniqueTypes.add(reason));
          }
        });

        setSuspiciousTypes(Array.from(uniqueTypes).sort());
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(
          "Failed to load suspicious transactions. Please try again later."
        );
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions when selected type changes
  useEffect(() => {
    if (selectedType) {
      const filtered = transactions.filter(
        (tx) => tx.reasons && tx.reasons.includes(selectedType)
      );
      setFilteredTransactions(filtered);
      setSelectedTransaction(""); // Reset selected transaction
    } else {
      setFilteredTransactions([]);
    }
  }, [selectedType, transactions]);

  // Generate graph data based on selected transaction and pattern type
  const generateGraphData = useCallback(() => {
    if (!selectedTransaction || !selectedType) return;

    setIsLoading(true);

    try {
      const selectedTx = transactions.find(
        (tx) => tx.transactionId === selectedTransaction
      );
      if (!selectedTx) {
        throw new Error("Transaction not found");
      }

      // Create nodes and links based on pattern type
      const nodes = [];
      const links = [];

      // All patterns will at least include the main transaction
      nodes.push({
        id: selectedTx.senderName,
        label: selectedTx.senderName,
        account: selectedTx.senderAccount,
        suspicious: true,
        group: 0,
      });

      nodes.push({
        id: selectedTx.receiverName,
        label: selectedTx.receiverName,
        account: selectedTx.receiverAccount,
        suspicious: true,
        group: 1,
      });

      links.push({
        source: selectedTx.senderName,
        target: selectedTx.receiverName,
        amount: selectedTx.amount,
        timestamp: selectedTx.timestamp,
        transactionId: selectedTx.transactionId,
        remarks: selectedTx.remarks,
        isSuspicious: true,
      });

      // Pattern-specific graph enrichment
      switch (selectedType) {
        case "Structuring": {
          // Find all transactions between same sender and receiver
          const relatedTxs = transactions.filter(
            (tx) =>
              tx.transactionId !== selectedTransaction &&
              tx.reasons &&
              tx.reasons.includes("Structuring") &&
              ((tx.senderName === selectedTx.senderName &&
                tx.receiverName === selectedTx.receiverName) ||
                (tx.senderName === selectedTx.receiverName &&
                  tx.receiverName === selectedTx.senderName))
          );

          // Add edges for related transactions
          relatedTxs.forEach((tx) => {
            links.push({
              source: tx.senderName,
              target: tx.receiverName,
              amount: tx.amount,
              timestamp: tx.timestamp,
              transactionId: tx.transactionId,
              remarks: tx.remarks,
              isSuspicious: true,
            });
          });
          break;
        }

        case "Temporal Cycle": {
          // Find transactions involved in the same cycle
          // For simplicity, we look for transactions from related parties
          const potentialCycleTxs = transactions.filter(
            (tx) =>
              tx.transactionId !== selectedTransaction &&
              tx.reasons &&
              tx.reasons.includes("Temporal Cycle") &&
              (tx.senderName === selectedTx.senderName ||
                tx.senderName === selectedTx.receiverName ||
                tx.receiverName === selectedTx.senderName ||
                tx.receiverName === selectedTx.receiverName)
          );

          // Add nodes and links for cycle transactions
          potentialCycleTxs.forEach((tx) => {
            // Add nodes if they don't exist
            if (!nodes.some((node) => node.id === tx.senderName)) {
              nodes.push({
                id: tx.senderName,
                label: tx.senderName,
                account: tx.senderAccount,
                suspicious: true,
                group: 0,
              });
            }

            if (!nodes.some((node) => node.id === tx.receiverName)) {
              nodes.push({
                id: tx.receiverName,
                label: tx.receiverName,
                account: tx.receiverAccount,
                suspicious: true,
                group: 1,
              });
            }

            // Add link
            links.push({
              source: tx.senderName,
              target: tx.receiverName,
              amount: tx.amount,
              timestamp: tx.timestamp,
              transactionId: tx.transactionId,
              remarks: tx.remarks,
              isSuspicious: true,
            });
          });
          break;
        }

        case "High Velocity": {
          // Find transactions involving the sender with high velocity
          // (incoming and outgoing within short timeframes)
          const velocityTxs = transactions.filter(
            (tx) =>
              tx.transactionId !== selectedTransaction &&
              tx.reasons &&
              tx.reasons.includes("High Velocity") &&
              (tx.senderName === selectedTx.senderName ||
                tx.receiverName === selectedTx.senderName)
          );

          // Add nodes and links
          velocityTxs.forEach((tx) => {
            // Add nodes if they don't exist
            if (!nodes.some((node) => node.id === tx.senderName)) {
              nodes.push({
                id: tx.senderName,
                label: tx.senderName,
                account: tx.senderAccount,
                suspicious: tx.senderName === selectedTx.senderName,
                group: tx.senderName === selectedTx.senderName ? 0 : 2,
              });
            }

            if (!nodes.some((node) => node.id === tx.receiverName)) {
              nodes.push({
                id: tx.receiverName,
                label: tx.receiverName,
                account: tx.receiverAccount,
                suspicious: tx.receiverName === selectedTx.senderName,
                group: tx.receiverName === selectedTx.senderName ? 0 : 2,
              });
            }

            // Add link
            links.push({
              source: tx.senderName,
              target: tx.receiverName,
              amount: tx.amount,
              timestamp: tx.timestamp,
              transactionId: tx.transactionId,
              remarks: tx.remarks,
              isSuspicious: true,
            });
          });
          break;
        }

        case "Fan Pattern": {
          // Find transactions where sender is involved in fan patterns
          const fanTxs = transactions.filter(
            (tx) =>
              tx.transactionId !== selectedTransaction &&
              tx.reasons &&
              tx.reasons.includes("Fan Pattern") &&
              tx.senderName === selectedTx.senderName
          );

          // Add nodes and links
          fanTxs.forEach((tx) => {
            // Add nodes if they don't exist
            if (!nodes.some((node) => node.id === tx.receiverName)) {
              nodes.push({
                id: tx.receiverName,
                label: tx.receiverName,
                account: tx.receiverAccount,
                suspicious: false,
                group: 2,
              });
            }

            // Add link
            links.push({
              source: tx.senderName,
              target: tx.receiverName,
              amount: tx.amount,
              timestamp: tx.timestamp,
              transactionId: tx.transactionId,
              remarks: tx.remarks,
              isSuspicious: true,
            });
          });

          // Look for additional fan-in transactions
          const fanInTxs = transactions.filter(
            (tx) =>
              tx.transactionId !== selectedTransaction &&
              tx.reasons &&
              tx.reasons.includes("Fan Pattern") &&
              fanTxs.some((f) => f.receiverName === tx.senderName)
          );

          fanInTxs.forEach((tx) => {
            // Add nodes if they don't exist
            if (!nodes.some((node) => node.id === tx.receiverName)) {
              nodes.push({
                id: tx.receiverName,
                label: tx.receiverName,
                account: tx.receiverAccount,
                suspicious: false,
                group: 3,
              });
            }

            // Add link
            links.push({
              source: tx.senderName,
              target: tx.receiverName,
              amount: tx.amount,
              timestamp: tx.timestamp,
              transactionId: tx.transactionId,
              remarks: tx.remarks,
              isSuspicious: true,
            });
          });
          break;
        }

        case "Periodic": {
          // Find periodic transactions between the same sender and receiver
          const periodicTxs = transactions.filter(
            (tx) =>
              tx.transactionId !== selectedTransaction &&
              tx.reasons &&
              tx.reasons.includes("Periodic") &&
              tx.senderName === selectedTx.senderName &&
              tx.receiverName === selectedTx.receiverName
          );

          // Add edges for related periodic transactions
          periodicTxs.forEach((tx) => {
            links.push({
              source: tx.senderName,
              target: tx.receiverName,
              amount: tx.amount,
              timestamp: tx.timestamp,
              transactionId: tx.transactionId,
              remarks: tx.remarks,
              isSuspicious: true,
            });
          });
          break;
        }

        case "Large Amount": {
          // This is already represented by the main transaction
          break;
        }

        case "Reciprocal": {
          // Find reciprocal transactions (money going back)
          const reciprocalTxs = transactions.filter(
            (tx) =>
              tx.transactionId !== selectedTransaction &&
              tx.reasons &&
              tx.reasons.includes("Reciprocal") &&
              tx.senderName === selectedTx.receiverName &&
              tx.receiverName === selectedTx.senderName
          );

          // Add edges for reciprocal transactions
          reciprocalTxs.forEach((tx) => {
            links.push({
              source: tx.senderName,
              target: tx.receiverName,
              amount: tx.amount,
              timestamp: tx.timestamp,
              transactionId: tx.transactionId,
              remarks: tx.remarks,
              isSuspicious: true,
            });
          });
          break;
        }

        default:
          // For any other patterns
          break;
      }

      setGraphData({ nodes, links });
    } catch (err) {
      console.error("Error generating graph:", err);
      setError("Failed to generate graph visualization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTransaction, selectedType, transactions]);

  // Handle node click to focus the camera on the clicked node
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
          if (node.suspicious) {
            return `${node.id}\n⚠️ ${selectedType}`;
          }
          // For non-suspicious nodes, show ID and account
          return `${node.id} (${node.account})`;
        }}
        // Color nodes based on suspicious flag
        nodeColor={(node) => (node.suspicious ? "red" : "#00aaff")}
        backgroundColor="#000011"
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        onNodeClick={(node) => handleNodeClick(node, ref)}
        // Color links based on whether the transaction is suspicious
        linkColor={(link) =>
          link.isSuspicious ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 255, 0, 0.5)"
        }
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkWidth={(link) => (link.isSuspicious ? 2 : 1)}
        nodeThreeObject={(node) => {
          const sprite = new SpriteText(node.id);
          // Color the label based on suspicious flag (same as node)
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

          // Color transaction amount text based on suspicious status
          sprite.color = link.isSuspicious ? "#ffcccc" : "lightgreen";

          // Make amount text larger and more visible
          sprite.textHeight = fullscreen ? 5 : 4;
          sprite.fontWeight = "bold";

          // Add slight background to improve readability
          sprite.backgroundColor = link.isSuspicious
            ? "rgba(50, 0, 0, 0.2)"
            : "rgba(0, 50, 0, 0.2)";
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
              .distance(() => 60),
          charge: () => -350,
          center: (d3, alpha) => {
            const centerStrength = 0.02;
            graphData.nodes.forEach((node) => {
              node.vx += (0 - node.x) * centerStrength * alpha;
              node.vy += (0 - node.y) * centerStrength * alpha;
              node.vz += (0 - node.z) * centerStrength * alpha;
            });
          },
        }}
        cooldownTime={5000}
        cooldownTicks={200}
        onEngineStop={() => {
          if (ref.current) {
            ref.current.zoomToFit(300, 500);
          }
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
            <Typography variant="h3">Suspicious Activity Analysis</Typography>
            {graphData && (
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
            )}
          </Stack>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <FormControl fullWidth>
            <InputLabel id="suspicious-type-label">
              Suspicious Activity Type
            </InputLabel>
            <Select
              labelId="suspicious-type-label"
              value={selectedType}
              label="Suspicious Activity Type"
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={isLoading || suspiciousTypes.length === 0}
            >
              {suspiciousTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="transaction-label">Select Transaction</InputLabel>
            <Select
              labelId="transaction-label"
              value={selectedTransaction}
              label="Select Transaction"
              onChange={(e) => setSelectedTransaction(e.target.value)}
              disabled={
                isLoading || filteredTransactions.length === 0 || !selectedType
              }
            >
              {filteredTransactions.map((tx) => (
                <MenuItem key={tx.transactionId} value={tx.transactionId}>
                  {tx.senderName} → {tx.receiverName} (₹
                  {parseFloat(tx.amount).toLocaleString()})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={generateGraphData}
            disabled={isLoading || !selectedTransaction || !selectedType}
            sx={{ height: { sm: 56 }, minWidth: 120 }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Visualize"}
          </Button>
        </Stack>

        {selectedType && (
          <Box sx={{ mb: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "rgba(255, 236, 179, 0.2)",
                border: "1px solid",
                borderColor: "warning.light",
                borderRadius: 1,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <WarningIcon color="warning" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography
                    variant="subtitle1"
                    color="warning.dark"
                    fontWeight="medium"
                  >
                    {selectedType} Pattern
                  </Typography>
                  <Typography variant="body2">
                    {patternDescriptions[selectedType] ||
                      "Suspicious activity detected in transaction pattern."}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    sx={{ mt: 1, display: "flex", alignItems: "center" }}
                  >
                    <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {filteredTransactions.length} suspicious{" "}
                    {filteredTransactions.length === 1
                      ? "transaction"
                      : "transactions"}{" "}
                    detected
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        )}

        <Box sx={{ height: "600px", width: "100%", position: "relative" }}>
          {isLoading && (
            <CircularProgress
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
          {graphData ? (
            renderGraph(false, graphRef)
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Typography variant="body1" color="textSecondary">
                {selectedTransaction
                  ? "Generating visualization..."
                  : "Select a suspicious activity type and transaction to visualize"}
              </Typography>
            </Box>
          )}
        </Box>
      </MainCard>

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
          {graphData && renderGraph(true, fsRef)}
        </Box>
      </Dialog>
    </>
  );
}
