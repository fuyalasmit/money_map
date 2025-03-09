import PropTypes from "prop-types";
import { useState } from "react";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import TableSortLabel from "@mui/material/TableSortLabel";
import { NumericFormat } from "react-number-format";
import Dot from "components/@extended/Dot";
import { useTransactionData } from "../../../utils/getTransactions";

// Define the mapping for transaction labels to status codes
const getLabelStatus = (label) => {
  switch (label) {
    case "suspicious":
      return 2; // Suspicious
    case "clean":
      return 1; // Approved
    default:
      return 0; // Pending
  }
};

// Create data entry from transaction, including timestamp
function createData(transactionId, senderName, receiverName, label, amount, timestamp) {
  return {
    tracking_no: transactionId,
    name: senderName,
    fat: receiverName,
    carbs: getLabelStatus(label),
    protein: amount,
    timestamp: timestamp,
  };
}

// Comparator helpers
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Custom linear search: iterates through transactions and returns matching ones
function linearSearch(transactionsArr, searchQuery) {
  const lowerQuery = searchQuery.toLowerCase();
  const results = [];
  for (let i = 0; i < transactionsArr.length; i++) {
    const tx = transactionsArr[i];
    if (
      tx.sender.toLowerCase().includes(lowerQuery) ||
      tx.receiver.toLowerCase().includes(lowerQuery)
    ) {
      results.push(tx);
    }
  }
  return results;
}

// Define table headers
const headCells = [
  { id: "tracking_no", align: "left", disablePadding: false, label: "Tracking No." },
  { id: "name", align: "left", disablePadding: true, label: "Sender" },
  { id: "fat", align: "right", disablePadding: false, label: "Receiver" },
  { id: "carbs", align: "left", disablePadding: false, label: "Status" },
  { id: "protein", align: "right", disablePadding: false, label: "Total Amount" },
];

// OrderTableHead component with sortable headers
function OrderTableHead({ order, orderBy, onRequestSort }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

OrderTableHead.propTypes = {
  order: PropTypes.string,
  orderBy: PropTypes.string,
  onRequestSort: PropTypes.func,
};

// OrderStatus component
function OrderStatus({ status }) {
  let color;
  let title;

  switch (status) {
    case 0:
      color = "warning";
      title = "Pending";
      break;
    case 1:
      color = "success";
      title = "Approved";
      break;
    case 2:
      color = "error";
      title = "Suspicious";
      break;
    default:
      color = "primary";
      title = "None";
  }

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
      <Dot color={color} />
      <Typography>{title}</Typography>
    </Stack>
  );
}

OrderStatus.propTypes = {
  status: PropTypes.number,
};

// Main OrderTable component
export default function OrderTable() {
  const { transactions } = useTransactionData();
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("timestamp"); // Default sort by timestamp
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Actual query applied after button click

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearch = () => {
    setSearchQuery(searchTerm.trim());
  };

  // Compute rows using custom linear search and then sorting with insertion sort
  let filteredTransactions = searchQuery
    ? linearSearch(transactions, searchQuery)
    : transactions;

  let rows = filteredTransactions
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
    .map((tx) => createData(tx.id, tx.sender, tx.receiver, tx.label, tx.amount, tx.timestamp));

  // Sort rows using the comparator
  rows = rows.sort(getComparator(order, orderBy));

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ m: 1 }}>
        <TextField
          label="Search by name"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Stack>
      <TableContainer
        sx={{
          width: "100%",
          overflowX: "auto",
          position: "relative",
          display: "block",
          maxWidth: "100%",
          "& td, & th": { whiteSpace: "nowrap" },
        }}
      >
        <Table aria-labelledby="tableTitle">
          <OrderTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
          <TableBody>
            {rows.map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`;
              return (
                <TableRow
                  hover
                  role="checkbox"
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  tabIndex={-1}
                  key={row.tracking_no}
                >
                  <TableCell component="th" id={labelId} scope="row">
                    <Link color="secondary">{row.tracking_no}</Link>
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.fat}</TableCell>
                  <TableCell>
                    <OrderStatus status={row.carbs} />
                  </TableCell>
                  <TableCell align="right">
                    <NumericFormat
                      value={row.protein}
                      displayType="text"
                      thousandSeparator
                      prefix="Rs "
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
