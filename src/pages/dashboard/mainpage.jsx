import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Paper,
  Alert,
  Collapse,
  Divider,
  Grid,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CodeIcon from "@mui/icons-material/Code";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "axios";
import { styled } from "@mui/material/styles";

// Create a hidden file input that's triggered by our styled button
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const MainPage = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFormat, setShowFormat] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);

  // Updated to match the required simpler format
  const sampleFormat = {
    senderName: "John Doe",
    senderAccount: "123456789",
    receiverName: "Jane Smith",
    receiverAccount: "987654321",
    remarks: "Monthly rent payment",
    amount: "15000",
    timestamp: "2025-03-10T06:44:02.013Z",
    transactionId: "aiGU3ABv3lFR",
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type !== "application/json") {
      setError("Please upload a JSON file");
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError("");
    setAnalyzed(false);
    setUploadedData(null);
  };

  // Just read and prepare the file data, don't analyze yet
  const handleFileUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    setAnalyzed(false);

    try {
      // Read the file content
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = JSON.parse(e.target.result);

          // Basic validation of the JSON structure
          if (!Array.isArray(content)) {
            throw new Error(
              "Uploaded file must contain an array of transactions"
            );
          }

          // Validate each transaction object with required fields only
          const requiredFields = [
            "senderName",
            "senderAccount",
            "receiverName",
            "receiverAccount",
            "amount",
            "timestamp",
            "transactionId",
            "remarks",
          ];

          const hasValidFormat = content.every((item) =>
            requiredFields.every((field) => field in item)
          );

          if (!hasValidFormat) {
            throw new Error(
              "Some transactions don't match the required format"
            );
          }

          // Store the raw uploaded data
          setUploadedData(content);

          // Store raw data in localStorage for backup
          localStorage.setItem(
            "rawUploadedTransactions",
            JSON.stringify(content)
          );

          setSuccess(
            `File loaded successfully with ${content.length} transactions. Click 'Analyze Transactions' to process the data.`
          );

          // Dispatch a fileUploaded event for notifications
          window.dispatchEvent(
            new CustomEvent("fileUploaded", {
              detail: {
                fileName: file.name,
                fileSize: `${(file.size / 1024).toFixed(2)} KB`,
              },
            })
          );
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          setError(`Invalid JSON format: ${parseError.message}`);
          setUploadedData(null);
        }
        setIsUploading(false);
      };

      reader.onerror = () => {
        setError("Error reading file");
        setIsUploading(false);
        setUploadedData(null);
      };

      reader.readAsText(file);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Error uploading file: " + err.message);
      setIsUploading(false);
      setUploadedData(null);
    }
  };

  // Get demo data but don't analyze yet
  const useDemoFile = async () => {
    setIsLoadingDemo(true);
    setError("");
    setSuccess("");
    setAnalyzed(false);

    try {
      // Fetch the demo transactions from the server
      const response = await axios.get(
        "http://localhost:5001/get-demo-transactions"
      );

      if (response.data && Array.isArray(response.data)) {
        // Store the raw demo data
        setUploadedData(response.data);

        // Store in localStorage as raw data
        localStorage.setItem(
          "rawUploadedTransactions",
          JSON.stringify(response.data)
        );

        setSuccess(
          `Successfully loaded ${response.data.length} demo transactions. Click 'Analyze Transactions' to process the data.`
        );

        // Dispatch a fileUploaded event for notifications
        window.dispatchEvent(
          new CustomEvent("fileUploaded", {
            detail: {
              fileName: "transactions.json (Demo)",
              fileSize: "Demo Data",
            },
          })
        );
      } else {
        throw new Error("Invalid demo data format");
      }
    } catch (err) {
      console.error("Error loading demo file:", err);
      setError(
        "Failed to load demo transactions: " +
          (err.response?.data?.error || err.message)
      );
      setUploadedData(null);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // Now this is the key function - sending data to server for analysis
  const handleAnalyze = async () => {
    // If no uploadedData, try to get it from localStorage
    const dataToAnalyze =
      uploadedData ||
      (() => {
        try {
          const storedData = localStorage.getItem("rawUploadedTransactions");
          return storedData ? JSON.parse(storedData) : null;
        } catch (e) {
          return null;
        }
      })();

    if (!dataToAnalyze) {
      setError("No transactions found. Please upload a file first.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setSuccess("");

    try {
      // Send the raw transactions to the server for analysis
      const response = await axios.post(
        "http://localhost:5001/analyze-transactions",
        dataToAnalyze
      );

      if (response.data && response.data.analyzedTransactions) {
        // Store the analyzed transactions from the server in localStorage
        localStorage.setItem(
          "uploadedTransactions",
          JSON.stringify(response.data.analyzedTransactions)
        );

        setAnalyzed(true);

        // Create a notification with details about suspicious transactions
        if (response.data.stats && response.data.stats.suspicious > 0) {
          const patterns = Object.keys(
            response.data.stats.byMethod || {}
          ).filter((method) => response.data.stats.byMethod[method] > 0);

          window.dispatchEvent(
            new CustomEvent("transactionsAnalyzed", {
              detail: {
                suspicious: true,
                count: response.data.stats.suspicious,
                patterns: patterns,
              },
            })
          );
        }

        setSuccess(
          `Analysis complete! ${response.data.stats.suspicious} suspicious transactions identified out of ${response.data.stats.total} total transactions.`
        );
      } else {
        throw new Error("Invalid response from server");
      }

      // Trigger refresh of components using transaction data
      setTimeout(() => {
        window.dispatchEvent(new Event("transactionsUpdated"));
      }, 1000);
    } catch (error) {
      console.error("Error analyzing transactions:", error);
      setError(
        "Failed to analyze transactions: " +
          (error.response?.data?.error || error.message)
      );
      setAnalyzed(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Container maxWidth="xl" disableGutters>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Upload Transaction
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box sx={{ mt: 6, mb: 2 }}>
          <Typography variant="h4" gutterBottom align="center">
            Transaction Data Upload
          </Typography>
          <Typography variant="body1" paragraph align="center">
            Upload your transaction data as a JSON file to visualize and analyze
            money flow patterns.
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ py: 1.5 }}
              >
                Select JSON File
                <VisuallyHiddenInput
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                />
              </Button>
              {file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {file.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FileDownloadIcon />}
                fullWidth
                sx={{ py: 1.5 }}
                onClick={useDemoFile}
                disabled={isLoadingDemo}
              >
                {isLoadingDemo ? "Loading..." : "Use Demo File"}
              </Button>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Load sample transactions.json
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CodeIcon />}
              onClick={() => setShowFormat(!showFormat)}
              fullWidth
            >
              {showFormat ? "Hide" : "Show"} Expected JSON Format
            </Button>
            <Collapse in={showFormat}>
              <Paper
                variant="outlined"
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "grey.100",
                  maxHeight: "300px",
                  overflow: "auto",
                  fontFamily: "monospace",
                }}
              >
                <pre>{JSON.stringify(sampleFormat, null, 2)}</pre>
              </Paper>
            </Collapse>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={handleFileUpload}
              variant="contained"
              color="primary"
              disabled={!file || isUploading}
              sx={{ flex: 1 }}
            >
              {isUploading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1, color: "white" }} />
                  Loading...
                </>
              ) : (
                "Upload File"
              )}
            </Button>

            <Button
              onClick={handleAnalyze}
              variant="contained"
              color="secondary"
              startIcon={
                isAnalyzing ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <AnalyticsIcon />
                )
              }
              disabled={
                (!uploadedData &&
                  !localStorage.getItem("rawUploadedTransactions")) ||
                isAnalyzing
              }
              sx={{ flex: 1 }}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Transactions"}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          {analyzed && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Analysis complete! You can now view the visualizations and explore
              the detected patterns.
            </Alert>
          )}
        </Paper>
      </Container>
    </Container>
  );
};

export default MainPage;
