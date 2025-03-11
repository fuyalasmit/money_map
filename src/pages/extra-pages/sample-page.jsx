import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import MainCard from "components/MainCard";
import axios from "axios";
import { Alert, Snackbar } from "@mui/material";

// Import our custom hook instead of using a direct fetch
import { useTransactionData } from "../../utils/getTransactions";

const generateTransactionId = (length = 12) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export default function SamplePage() {
  // Replace the useState and manual fetch with our hook
  const { transactions, loading, error, refetch } = useTransactionData();

  const [formData, setFormData] = useState({
    senderName: "",
    senderAccount: "",
    receiverName: "",
    receiverAccount: "",
    remarks: "",
    amount: "",
  });
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [openAlert, setOpenAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setOpenAlert(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const transactionId = generateTransactionId();
    const newTransaction = {
      ...formData,
      timestamp: new Date().toISOString(),
      transactionId: transactionId,
      label: "clean", // Default label
      reasons: [], // Default empty reasons array
    };

    try {
      // First, get existing transactions from localStorage
      let existingTransactions = [];
      const storedData = localStorage.getItem("rawUploadedTransactions");

      if (storedData) {
        try {
          existingTransactions = JSON.parse(storedData);
          // Ensure it's an array
          if (!Array.isArray(existingTransactions)) {
            existingTransactions = [];
          }
        } catch (error) {
          console.error("Error parsing stored transactions:", error);
          existingTransactions = [];
        }
      }

      // Add the new transaction to the array
      existingTransactions.push(newTransaction);

      // Save back to localStorage
      localStorage.setItem(
        "rawUploadedTransactions",
        JSON.stringify(existingTransactions)
      );

      // Also save to uploadedTransactions for immediate use
      localStorage.setItem(
        "uploadedTransactions",
        JSON.stringify(existingTransactions)
      );

      // Optionally, send to server for analysis (comment out if not needed)
      await axios.post(
        "http://localhost:5001/save-transaction",
        newTransaction
      );

      // Create a notification for the new transaction
      window.dispatchEvent(new Event("transactionsUpdated"));

      showAlert(`Money sent successfully! Transaction ID: ${transactionId}`);

      // Reset form
      setFormData({
        senderName: "",
        senderAccount: "",
        receiverName: "",
        receiverAccount: "",
        remarks: "",
        amount: "",
      });

      // Use refetch from the hook to update the UI
      refetch();
    } catch (error) {
      console.error("Error saving transaction:", error);
      showAlert("Failed to send money. Please try again.", "error");
    }
  };

  const handleAnalyze = async () => {
    try {
      // Get transactions from localStorage
      const storedData = localStorage.getItem("rawUploadedTransactions");
      if (!storedData) {
        showAlert("No transactions found to analyze", "warning");
        return;
      }

      const localTransactions = JSON.parse(storedData);

      // Send to server for analysis
      const response = await axios.post(
        "http://localhost:5001/analyze-transactions",
        localTransactions
      );

      // Update localStorage with analyzed transactions
      if (response.data && response.data.analyzedTransactions) {
        localStorage.setItem(
          "uploadedTransactions",
          JSON.stringify(response.data.analyzedTransactions)
        );

        // Notify about suspicious transactions if any
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
      }

      showAlert("Transactions analyzed successfully");

      // Trigger refresh of components using transaction data
      setTimeout(() => {
        window.dispatchEvent(new Event("transactionsUpdated"));
      }, 1000);

      // Use refetch from the hook
      refetch();
    } catch (error) {
      console.error("Error analyzing transactions:", error);
      showAlert("Failed to analyze transactions", "error");
    }
  };

  return (
    <MainCard title="Send Money">
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Sender Name"
            name="senderName"
            value={formData.senderName}
            onChange={handleChange}
            fullWidth
            required
          />
          {/* Other form fields remain the same */}
          <TextField
            label="Sender Account Number"
            name="senderAccount"
            value={formData.senderAccount}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Receiver Name"
            name="receiverName"
            value={formData.receiverName}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Receiver Account Number"
            name="receiverAccount"
            value={formData.receiverAccount}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
            required
            type="number"
          />
          <TextField
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary">
            Send
          </Button>
        </Stack>
      </form>

      <Button
        onClick={handleAnalyze}
        variant="contained"
        color="secondary"
        style={{ marginTop: "10px" }}
      >
        Analyze Transactions
      </Button>

      {/* You can show loading state or error messages */}
      {loading && <p>Loading transactions...</p>}
      {error && <p>Error loading transactions: {error.message}</p>}

      {/* Optional: Display transaction count */}
      <p style={{ marginTop: "20px" }}>
        Total Transactions: {transactions.length}
      </p>

      {/* Alert for notifications */}
      <Snackbar
        open={openAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </MainCard>
  );
}
