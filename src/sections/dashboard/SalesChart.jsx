import { useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";
import MainCard from "components/MainCard";
import { useTransactionData } from "utils/getTransactions";

export default function SalesChart({ period }) {
  const theme = useTheme();
  const [showClean, setShowClean] = useState(true);
  const [showSuspicious, setShowSuspicious] = useState(true);

  const { transactions } = useTransactionData();

  const handleCleanChange = () => setShowClean(!showClean);
  const handleSuspiciousChange = () => setShowSuspicious(!showSuspicious);

  // Helper function to determine time units and labels based on period
  const getTimeUnits = (period) => {
    const now = new Date();
    if (period === "year") {
      return {
        units: Array.from({ length: 12 }, (_, i) => i),
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      };
    } else if (period === "month") {
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();
      return {
        units: Array.from({ length: daysInMonth }, (_, i) => i + 1),
        labels: Array.from({ length: daysInMonth }, (_, i) =>
          (i + 1).toString()
        ),
      };
    } else if (period === "today") {
      return {
        units: Array.from({ length: 24 }, (_, i) => i),
        labels: Array.from({ length: 24 }, (_, i) =>
          i.toString().padStart(2, "0")
        ),
      };
    }
    return { units: [], labels: [] };
  };

  // Filter transactions based on the selected period
  const filterTransactions = (transactions, period) => {
    const now = new Date();
    return transactions.filter((tx) => {
      const txDate = new Date(tx.timestamp);
      if (period === "year") {
        return txDate.getFullYear() === now.getFullYear();
      } else if (period === "month") {
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth()
        );
      } else if (period === "today") {
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth() &&
          txDate.getDate() === now.getDate()
        );
      }
      return false;
    });
  };

  // Aggregate transaction counts based on period and units
  const aggregateData = (filteredTransactions, period, units) => {
    const cleanCounts = new Array(units.length).fill(0);
    const suspiciousCounts = new Array(units.length).fill(0);

    filteredTransactions.forEach((tx) => {
      const txDate = new Date(tx.timestamp);
      let index;
      if (period === "year") {
        index = txDate.getMonth();
      } else if (period === "month") {
        index = txDate.getDate() - 1; // Days start from 1
      } else if (period === "today") {
        index = txDate.getHours();
      }
      if (index >= 0 && index < units.length) {
        if (tx.label === "clean") {
          cleanCounts[index]++;
        } else if (tx.label === "suspicious") {
          suspiciousCounts[index]++;
        }
      }
    });

    return { cleanCounts, suspiciousCounts };
  };

  // Compute dynamic data
  const { units, labels } = getTimeUnits(period);
  const filteredTransactions = filterTransactions(transactions, period);
  const { cleanCounts, suspiciousCounts } = aggregateData(
    filteredTransactions,
    period,
    units
  );

  // Calculate total transaction amount for the selected period
  const totalAmount = filteredTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );
  const formattedTotal = `Rs ${(totalAmount / 10000000).toFixed(1)}Cr`;

  // Formatter for chart values
  const valueFormatter = (value) => `${value} Transactions`;

  // Dynamic chart data
  const data = [
    {
      data: cleanCounts,
      label: "Transparent Transaction",
      color: theme.palette.primary.main,
      valueFormatter,
    },
    {
      data: suspiciousCounts,
      label: "Suspicious Transaction",
      color: theme.palette.error.main,
      valueFormatter,
    },
  ];

  const axisFontStyle = { fontSize: 10, fill: theme.palette.text.secondary };

  return (
    <MainCard sx={{ mt: 1 }} content={false}>
      <Box sx={{ p: 2.5, pb: 0 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Box>
            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              Total Transaction
            </Typography>
            <Typography variant="h4">{formattedTotal}</Typography>
          </Box>

          <FormGroup>
            <Stack direction="row">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showClean}
                    onChange={handleCleanChange}
                    sx={{
                      "&.Mui-checked": { color: theme.palette.primary.main },
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.08
                        ),
                      },
                    }}
                  />
                }
                label="Transparent Transaction"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showSuspicious}
                    onChange={handleSuspiciousChange}
                    sx={{
                      "&.Mui-checked": { color: theme.palette.error.main },
                    }}
                  />
                }
                label="Suspicious Transaction"
              />
            </Stack>
          </FormGroup>
        </Stack>

        <BarChart
          height={380}
          grid={{ horizontal: true }}
          xAxis={[
            {
              data: labels,
              scaleType: "band",
              tickLabelStyle: { ...axisFontStyle, fontSize: 12 },
            },
          ]}
          yAxis={[
            {
              label: "Transaction Count",
              disableLine: true,
              disableTicks: true,
              tickMaxStep: 20,
              tickLabelStyle: axisFontStyle,
            },
          ]}
          series={data
            .filter(
              (series) =>
                (series.label === "Transparent Transaction" && showClean) ||
                (series.label === "Suspicious Transaction" && showSuspicious)
            )
            .map((series) => ({ ...series, type: "bar" }))}
          slotProps={{ legend: { hidden: true }, bar: { rx: 5, ry: 5 } }}
          axisHighlight={{ x: "none" }}
          margin={{ top: 30, left: 40, right: 10 }}
          tooltip={{ trigger: "item" }}
          sx={{
            "& .MuiBarElement-root:hover": { opacity: 0.6 },
            "& .MuiChartsAxis-directionX .MuiChartsAxis-tick, & .MuiChartsAxis-root line":
              { stroke: theme.palette.divider },
          }}
        />
      </Box>
    </MainCard>
  );
}
