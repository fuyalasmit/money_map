
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MainCard from 'components/MainCard';
import axios from 'axios';

const generateTransactionId = (length = 12) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export default function SamplePage() {
  const [formData, setFormData] = useState({
    senderName: '',
    senderAccount: '',
    receiverName: '',
    receiverAccount: '',
    remarks: '',
    amount: '',
  });

  const [transactions, setTransactions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const transactionId = generateTransactionId();
    const dataWithTimestamp = {
      ...formData,
      timestamp: new Date().toISOString(),
      transactionId: transactionId,
    };

    try {
      await axios.post(
        "http://localhost:5001/save-transaction",
        dataWithTimestamp
      );
      alert(`Money sent successfully! Transaction ID: ${transactionId}`);
      setFormData({
        senderName: '',
        senderAccount: '',
        receiverName: '',
        receiverAccount: '',
        remarks: '',
        amount: '',
      });
      fetchTransactions();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to send money. Please try again.");
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5001/get-transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAnalyze = async () => {
    try {
      await axios.post('http://localhost:5001/analyze-transactions');
      alert('Transactions analyzed successfully');
      fetchTransactions();
    } catch (error) {
      console.error('Error analyzing transactions:', error);
      alert('Failed to analyze transactions');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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
        style={{ marginTop: '10px' }}
      >
        Analyze Transactions
      </Button>
      
    </MainCard>
  );
}
