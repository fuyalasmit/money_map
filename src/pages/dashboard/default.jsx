// material-ui
import Grid from '@mui/material/Grid2';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import ReportAreaChart from 'sections/dashboard/default/AnalyticsChart';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';
import SaleReportCard from 'sections/dashboard/default/SaleReportCard';
import OrdersTable from 'sections/dashboard/default/RecentTransactions.jsx';

// Import data from helper
import {
  transactionsCount,
  suspiciousTransactionsCount,
} from '../../utils/fetchTransactions.js';

//import from threeGridTransactions.js
import { getAnalytics } from '../../utils/threeGridTransactions.js';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const analytics = getAnalytics();
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* Dashboard Grid */}
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5">Dashboard</Typography>
      </Grid>

      {/* Total Counts */}
      <Grid
        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        sx={{
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid',
        }}
      >
        <AnalyticEcommerce
          title="Total Users"
          count={analytics.totalUsers.count}
          percentage={analytics.totalUsers.percentage}
          extra={analytics.totalUsers.extra}
          isLoss={false} // Total users can't decrease
          color={analytics.totalUsers.percentage > 0 ? 'success' : 'warning'}
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        sx={{
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid',
        }}
      >
        <AnalyticEcommerce
          title="Total Transaction"
          count={analytics.totalTransaction.count}
          percentage={analytics.totalTransaction.percentage}
          extra={analytics.totalTransaction.extra}
          isLoss={analytics.totalTransaction.percentage < 0}
          color={
            analytics.totalTransaction.percentage >= 0 ? 'success' : 'error'
          }
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        sx={{
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid',
        }}
      >
        <AnalyticEcommerce
          title="Suspicious Transaction"
          count={analytics.suspiciousTransaction.count}
          percentage={analytics.suspiciousTransaction.percentage}
          extra={analytics.suspiciousTransaction.extra}
          isLoss={analytics.suspiciousTransaction.percentage < 0}
          color={
            analytics.suspiciousTransaction.percentage >= 0
              ? 'warning'
              : 'error'
          }
        />
      </Grid>

      <Grid
        sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }}
        size={{ md: 8 }}
      />
      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Analytics Report</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
            <ListItemButton divider>
              <ListItemText primary="Transaction" />
              <Typography variant="h5">{transactionsCount}</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Suspicious Transaction" />
              <Typography variant="h5">
                {suspiciousTransactionsCount}
              </Typography>
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary="Company Risk" />
              <Typography variant="h5">
                {
                  //if more than 50% transactions are suspicious
                  suspiciousTransactionsCount / transactionsCount >= 0.5
                    ? 'High'
                    : 'Low'
                }
              </Typography>
            </ListItemButton>
          </List>
          <ReportAreaChart />
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <SaleReportCard />
      </Grid>
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Recent Transactions</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <OrdersTable />
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid />
        </Grid>
      </Grid>
    </Grid>
  );
}
