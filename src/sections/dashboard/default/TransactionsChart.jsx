import PropTypes from "prop-types";
import { useState } from "react";

// material-ui
import { alpha, useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { LineChart } from "@mui/x-charts/LineChart";

// Import data from helper

import {
  useTransactionData,
  monthlyLabels,
  weeklyLabels,
} from "../../../utils/getTransactions";

function Legend({ items, onToggle }) {
  return (
    <Stack
      direction="row"
      sx={{
        gap: 2,
        alignItems: "center",
        justifyContent: "center",
        mt: 2.5,
        mb: 1.5,
      }}
    >
      {items.map((item) => (
        <Stack
          key={item.label}
          direction="row"
          sx={{ gap: 1.25, alignItems: "center", cursor: "pointer" }}
          onClick={() => onToggle(item.label)}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: item.visible ? item.color : "grey.500",
              borderRadius: "50%",
            }}
          />
          <Typography variant="body2" color="text.primary">
            {item.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

// ==============================|| INCOME AREA CHART ||============================== //

export default function IncomeAreaChart({ view }) {
  const theme = useTheme();

  const [visibility, setVisibility] = useState({
    Suspicious: true,
    Total: true,
  });
  const { monthlyDataSus, weeklyDataSus, monthlyDataTotal, weeklyDataTotal } =
    useTransactionData();

  const labels = view === "monthly" ? monthlyLabels : weeklyLabels;
  const data1 = view === "monthly" ? monthlyDataSus : weeklyDataSus;
  const data2 = view === "monthly" ? monthlyDataTotal : weeklyDataTotal;

  const line = theme.palette.divider;

  const toggleVisibility = (label) => {
    setVisibility((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const visibleSeries = [
    {
      data: data1,
      label: "Suspicious Transactions",
      showMark: false,
      area: true,
      id: "Germany",
      color: theme.palette.error.main, // Red color
      visible: visibility["Suspicious"],
    },
    {
      data: data2,
      label: "Total Transactions",
      showMark: false,
      area: true,
      id: "UK",
      color: theme.palette.primary.dark, // Dark green color
      visible: visibility["Total"],
    },
  ];

  const axisFonstyle = { fontSize: 10, fill: theme.palette.text.secondary };

  return (
    <>
      <LineChart
        grid={{ horizontal: true }}
        xAxis={[
          {
            scaleType: "point",
            data: labels,
            disableLine: true,
            tickLabelStyle: axisFonstyle,
          },
        ]}
        yAxis={[
          {
            disableLine: true,
            disableTicks: true,
            tickLabelStyle: axisFonstyle,
          },
        ]}
        height={450}
        margin={{ top: 40, bottom: 20, right: 20 }}
        series={visibleSeries
          .filter((series) => series.visible)
          .map((series) => ({
            type: "line",
            data: series.data,
            label: series.label,
            showMark: series.showMark,
            area: series.area,
            id: series.id,
            color: series.color,
            stroke: series.color,
            strokeWidth: 2,
          }))}
        slotProps={{ legend: { hidden: true } }}
        sx={{
          "& .MuiAreaElement-series-Germany": {
            fill: "url('#myGradient1')",
            strokeWidth: 2,
            opacity: 0.8,
          },
          "& .MuiAreaElement-series-UK": {
            fill: "url('#myGradient2')",
            strokeWidth: 2,
            opacity: 0.8,
          },
          "& .MuiChartsAxis-directionX .MuiChartsAxis-tick": { stroke: line },
        }}
      >
        <defs>
          <linearGradient id="myGradient1" gradientTransform="rotate(90)">
            <stop
              offset="10%"
              stopColor={alpha(theme.palette.error.main, 0.4)}
            />
            <stop
              offset="90%"
              stopColor={alpha(theme.palette.background.default, 0.4)}
            />
          </linearGradient>
          <linearGradient id="myGradient2" gradientTransform="rotate(90)">
            <stop
              offset="10%"
              stopColor={alpha(theme.palette.primary.dark, 0.4)}
            />
            <stop
              offset="90%"
              stopColor={alpha(theme.palette.background.default, 0.4)}
            />
          </linearGradient>
        </defs>
      </LineChart>
      <Legend items={visibleSeries} onToggle={toggleVisibility} />
    </>
  );
}

Legend.propTypes = { items: PropTypes.array, onToggle: PropTypes.func };

IncomeAreaChart.propTypes = { view: PropTypes.oneOf(["monthly", "weekly"]) };
