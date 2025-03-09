import MainCard from "components/MainCard";
import ForceGraph3D from "react-force-graph-3d";
import { useState, useEffect, useRef, useCallback } from "react";
import SpriteText from "three-spritetext";
import transactionsData from "../../../transactions.json"; // Adjust path as needed
import {
  Stack,
  Box,
  Typography,
  IconButton,
  Dialog,
  Divider,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
// Import components
import DFSPage from "./DFS";
import MultipleSpanningTree from "./multiplespanningtree";

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
      const suspiciousTransactions = new Set();

      // First pass: identify suspicious transactions only
      transactionsData.forEach((transaction) => {
        // Mark participants in suspicious transactions
        if (transaction.label === "suspicious") {
          suspiciousPersons.add(transaction.senderName);
          suspiciousPersons.add(transaction.receiverName);
          suspiciousTransactions.add(transaction.transactionId);
        }
      });

      // Create nodes for all persons without propagation
      transactionsData.forEach((transaction) => {
        if (!uniquePersons.has(transaction.senderName)) {
          uniquePersons.set(transaction.senderName, {
            id: transaction.senderName,
            group: suspiciousPersons.has(transaction.senderName) ? 0 : 1,
            account: transaction.senderAccount,
            suspicious: suspiciousPersons.has(transaction.senderName),
          });
        }

        if (!uniquePersons.has(transaction.receiverName)) {
          uniquePersons.set(transaction.receiverName, {
            id: transaction.receiverName,
            group: suspiciousPersons.has(transaction.receiverName) ? 0 : 2,
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
        // Only mark links as suspicious if the transaction itself is labeled suspicious
        isSuspicious: transaction.label === "suspicious",
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
        // Color nodes based on suspicious flag
        nodeColor={(node) => (node.suspicious ? "red" : "#00aaff")}
        backgroundColor="#000011"
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        onNodeClick={(node) => handleNodeClick(node, ref)}
        // Color links based ONLY on whether the transaction is suspicious
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
              .distance(() => 60), // Increased from 25 to 60 for wider spacing between connected nodes
          charge: () => -350, // Increased from -180 to -350 for stronger node repulsion
          center: (d3, alpha) => {
            // Even lighter centering force to allow nodes to spread out more
            const centerStrength = 0.02; // Reduced from 0.05
            graphData.nodes.forEach((node) => {
              node.vx += (0 - node.x) * centerStrength * alpha;
              node.vy += (0 - node.y) * centerStrength * alpha;
              node.vz += (0 - node.z) * centerStrength * alpha;
            });
          },
        }}
        cooldownTime={5000} // Increased for longer, more natural simulation
        cooldownTicks={200} // Increased to allow more physics steps before cooling down
        // Don't manually fix positions - let physics handle it
        onEngineStop={() => {
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

      {/* Add Divider before DFS component */}
      <Divider sx={{ my: 4 }} />

      {/* Add DFS Component */}
      <DFSPage />

      {/* Add Divider before Multiple Spanning Tree component */}
      <Divider sx={{ my: 4 }} />

      {/* Add Multiple Spanning Tree Component */}
      <MultipleSpanningTree />

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
