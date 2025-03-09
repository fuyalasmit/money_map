// material-ui
import { useTheme } from "@mui/material/styles";

import { chartsGridClasses, LineChart } from "@mui/x-charts";

import {
  useTransactionData,
  monthlyLabels,
} from "../../../utils/getTransactions";

// data.forEach((item) => console.log(item));

// ==============================|| REPORT AREA CHART ||============================== //

export default function ReportAreaChart() {
  const theme = useTheme();
  const axisFonstyle = { fill: theme.palette.text.secondary };

  const { monthlyDataSus } = useTransactionData();

  const labels = monthlyLabels.slice(5, 11);
  const data = monthlyDataSus.slice(5, 11);
  return (
    <LineChart
      grid={{ horizontal: true }}
      xAxis={[
        {
          data: labels,
          scaleType: "point",
          disableLine: true,
          disableTicks: true,
          tickLabelStyle: axisFonstyle,
        },
      ]}
      yAxis={[{ tickMaxStep: 10 }]}
      leftAxis={null}
      series={[
        {
          data,
          showMark: false,
          id: "ReportAreaChart",
          color: theme.palette.warning.main,
          label: "Series 1",
        },
      ]}
      slotProps={{ legend: { hidden: true } }}
      height={340}
      margin={{ top: 30, bottom: 50, left: 20, right: 20 }}
      sx={{
        "& .MuiLineElement-root": { strokeWidth: 1 },
        [`& .${chartsGridClasses.line}`]: { strokeDasharray: "5 3" },
      }}
    />
  );
}
