const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

app.post("/save-transaction", (req, res) => {
  const data = req.body;
  // Navigate to project root directory (3 levels up from current directory)
  const rootDir = path.resolve(__dirname, "../../..");
  const filePath = path.join(rootDir, "transactions.json");
  console.log("Saving transaction to:", filePath);

  // Check if file exists and read it
  let transactions = [];
  if (fs.existsSync(filePath)) {
    try {
      const fileData = fs.readFileSync(filePath);
      transactions = JSON.parse(fileData);
      // Ensure transactions is an array
      if (!Array.isArray(transactions)) {
        transactions = [];
      }
    } catch (err) {
      console.error("Error reading existing file:", err);
      // If there's an error reading, start with empty array
      transactions = [];
    }
  }

  // Add new transaction
  transactions.push(data);

  // Write updated transactions back to file
  fs.writeFile(filePath, JSON.stringify(transactions, null, 2), (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.send("File saved successfully");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
