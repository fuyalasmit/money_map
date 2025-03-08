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

      // Process all transactions to identify unique people
      transactionsData.forEach((transaction) => {
        if (!uniquePersons.has(transaction.senderName)) {
          uniquePersons.set(transaction.senderName, {
            id: transaction.senderName,
            group: 1, // Senders group
            account: transaction.senderAccount,
          });
        }

        if (!uniquePersons.has(transaction.receiverName)) {
          uniquePersons.set(transaction.receiverName, {
            id: transaction.receiverName,
            group: 2, // Receivers group
            account: transaction.receiverAccount,
          });
        }
      });

      // Create nodes from unique persons
      const nodes = Array.from(uniquePersons.values());

      // Create links from transactions
      const links = transactionsData.map((transaction) => ({
        source: transaction.senderName,
        target: transaction.receiverName,
        amount: transaction.amount,
        timestamp: transaction.timestamp,
        transactionId: transaction.transactionId,
        remarks: transaction.remarks,
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
        nodeAutoColorBy="group"
        backgroundColor="#000011"
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        nodeThreeObject={(node) => {
          const sprite = new SpriteText(node.id);
          sprite.color = node.color;
          sprite.textHeight = fullscreen ? 8 : 6; // Larger text in fullscreen
          return sprite;
        }}
        linkThreeObjectExtend={true}
        linkThreeObject={(link) => {
          // Add amount text to the link
          const sprite = new SpriteText(
            `₹${Number(link.amount).toLocaleString()}`
          );
          sprite.color = "lightgreen";
          sprite.textHeight = fullscreen ? 4 : 3; // Larger text in fullscreen
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
