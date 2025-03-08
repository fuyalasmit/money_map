import MainCard from "components/MainCard";
import ForceGraph3D from "react-force-graph-3d";
import { useState, useEffect, useRef, useCallback } from "react";
import SpriteText from "three-spritetext";
import transactionsData from "../../../transactions.json"; // Adjust path as needed
import { Stack, Box, Typography, IconButton, Dialog } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/Fullscreen";

// ==============================|| GRAPH PAGE ||============================== //

export default function GraphPage() {
  const [graphData, setGraphData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const fsRef = useRef();
  const graphRef = useRef();
  const rotationIntervalRef = useRef(null);

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

  // Add camera orbit animation when the graph initially loads
  useEffect(() => {
    if (!graphRef.current || !graphData || isAnimating) return;

    setIsAnimating(true);

    // Animation timing constants
    const totalDuration = 1000; // 1 second total
    const zoomOutTime = 200; // ms for zoom out
    const rotateTime = 600; // ms for rotation
    const zoomInTime = 200; // ms for zoom in

    const orbitDistance = 300; // Distance for orbit view
    let angle = 0;

    try {
      // Phase 1: Quick zoom out
      graphRef.current.cameraPosition({ z: orbitDistance }, null, zoomOutTime);

      // Phase 2: Start rotation after zoom out completes
      setTimeout(() => {
        rotationIntervalRef.current = setInterval(() => {
          if (graphRef.current) {
            graphRef.current.cameraPosition({
              x: orbitDistance * Math.sin(angle),
              z: orbitDistance * Math.cos(angle),
            });
            angle += Math.PI / 30; // Speed of rotation
          }
        }, 10);

        // Phase 3: Stop rotation and zoom in
        setTimeout(() => {
          if (rotationIntervalRef.current) {
            clearInterval(rotationIntervalRef.current);
          }

          // Final zoom in to properly fit
          if (graphRef.current) {
            graphRef.current.zoomToFit(250, zoomInTime);
          }

          // Animation complete
          setTimeout(() => {
            setIsAnimating(false);
          }, zoomInTime);
        }, rotateTime);
      }, zoomOutTime);
    } catch (err) {
      console.error("Animation error:", err);
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
      setIsAnimating(false);
    }

    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, [graphData]);

  // Set initial camera position after graph loads
  useEffect(() => {
    // For both graphs
    const setupCamera = (ref) => {
      if (ref.current && graphData) {
        // Set a closer initial camera position
        ref.current.cameraPosition({ z: 120 });
      }
    };

    if (graphRef.current && graphData) {
      setupCamera(graphRef);
    }

    if (fsRef.current && isFullscreen) {
      setupCamera(fsRef);
    }
  }, [graphData, isFullscreen]);

  if (!graphData) return <div>Loading...</div>;

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Render the graph component
  const renderGraph = (fullscreen = false, ref) => {
    return (
      <ForceGraph3D
        ref={ref}
        graphData={graphData}
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
          link.isSuspicious ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 170, 255, 0.5)"
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
        d3Force={{
          link: (d3) =>
            d3
              .forceLink()
              .id((d) => d.id)
              .distance(() => 25), // Reduced from 40 to 25 to keep nodes closer together
          charge: () => -180, // Increased from -120 to -180 for stronger attraction
          center: (d3, alpha) => {
            // Stronger centering force
            const centerStrength = 0.15;
            graphData.nodes.forEach((node) => {
              node.vx += (0 - node.x) * centerStrength * alpha;
              node.vy += (0 - node.y) * centerStrength * alpha;
              node.vz += (0 - node.z) * centerStrength * alpha;
            });
          },
        }}
        cooldownTime={2000}
        cooldownTicks={100} // Limit the simulation ticks for better performance
        // Automatically fit to canvas when the simulation stops
        onEngineStop={() => {
          // Only auto-fit if not during animation
          if (!isAnimating && ref.current) {
            ref.current.zoomToFit(300, 500);
          }
        }}
        enableNavigationControls={!isAnimating} // Disable controls during animation
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
          {renderGraph(false, graphRef)}
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
          {renderGraph(true, fsRef)}
        </Box>
      </Dialog>
    </>
  );
}
