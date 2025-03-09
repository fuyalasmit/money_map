import { useState } from "react";
import { useNavigate } from "react-router-dom";

// material-ui
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";

// assets
import QuestionCircleOutlined from "@ant-design/icons/QuestionCircleOutlined";
import LockOutlined from "@ant-design/icons/LockOutlined";
import UnorderedListOutlined from "@ant-design/icons/UnorderedListOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import SafetyOutlined from "@ant-design/icons/SafetyOutlined";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import ClockCircleOutlined from "@ant-design/icons/ClockCircleOutlined";
import DashboardOutlined from "@ant-design/icons/DashboardOutlined";
import AlertOutlined from "@ant-design/icons/AlertOutlined";
import FileSearchOutlined from "@ant-design/icons/FileSearchOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";

// Mock login history data
const loginHistory = [
  {
    id: 1,
    action: "Login",
    user: "Asmit Phuyal",
    timestamp: "2023-03-09 09:30:45",
    ipAddress: "192.168.1.101",
  },
  {
    id: 2,
    action: "Logout",
    user: "Asmit Phuyal",
    timestamp: "2023-03-09 16:45:12",
    ipAddress: "192.168.1.101",
  },
  {
    id: 3,
    action: "Login",
    user: "Asmit Phuyal",
    timestamp: "2023-03-10 08:15:33",
    ipAddress: "192.168.1.105",
  },
  {
    id: 4,
    action: "Login",
    user: "Asmit Phuyal",
    timestamp: "2023-03-15 10:22:18",
    ipAddress: "192.168.1.110",
  },
  {
    id: 5,
    action: "Logout",
    user: "Asmit Phuyal",
    timestamp: "2023-03-15 17:30:45",
    ipAddress: "192.168.1.110",
  },
];

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

export default function SettingTab() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openPrivacyDialog, setOpenPrivacyDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [openHelpDialog, setOpenHelpDialog] = useState(false);

  // Dialog handlers
  const handleOpenPrivacyDialog = () => setOpenPrivacyDialog(true);
  const handleClosePrivacyDialog = () => setOpenPrivacyDialog(false);

  const handleOpenHistoryDialog = () => setOpenHistoryDialog(true);
  const handleCloseHistoryDialog = () => setOpenHistoryDialog(false);

  const handleOpenHelpDialog = () => setOpenHelpDialog(true);
  const handleCloseHelpDialog = () => setOpenHelpDialog(false);

  const handleListItemClick = (index, route = "") => {
    setSelectedIndex(index);

    if (route && route !== "") {
      navigate(route);
    }
  };

  return (
    <>
      <List
        component="nav"
        sx={{ p: 0, "& .MuiListItemIcon-root": { minWidth: 32 } }}
      >
        <ListItemButton onClick={handleOpenHelpDialog}>
          <ListItemIcon>
            <QuestionCircleOutlined />
          </ListItemIcon>
          <ListItemText primary="Help & Support" />
        </ListItemButton>

        <ListItemButton onClick={handleOpenPrivacyDialog}>
          <ListItemIcon>
            <LockOutlined />
          </ListItemIcon>
          <ListItemText primary="Privacy Center" />
        </ListItemButton>

        <ListItemButton onClick={handleOpenHistoryDialog}>
          <ListItemIcon>
            <UnorderedListOutlined />
          </ListItemIcon>
          <ListItemText primary="Activity History" />
        </ListItemButton>
      </List>

      {/* Help & Support Dialog */}
      <Dialog
        open={openHelpDialog}
        onClose={handleCloseHelpDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <QuestionCircleOutlined
              style={{ marginRight: 8, color: "#1976d2", fontSize: "1.25rem" }}
            />
            <Typography variant="h5">MoneyMap Help & Support</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert
            icon={<InfoCircleOutlined />}
            severity="info"
            sx={{ mb: 3, "& .MuiAlert-icon": { alignItems: "center" } }}
          >
            Welcome to MoneyMap - Your financial transaction monitoring and
            anti-money laundering solution.
          </Alert>

          <Card sx={{ mb: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <DashboardOutlined
                  style={{ marginRight: 8, color: "#1976d2" }}
                />
                What is MoneyMap?
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                MoneyMap is a powerful tool designed to help financial
                institutions monitor transactions, detect suspicious activities,
                and prevent money laundering. The system analyzes transaction
                patterns to identify potential risks and compliance issues in
                real-time.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <AlertOutlined style={{ marginRight: 8, color: "#ff9800" }} />
                Key Features
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box component="ul" sx={{ ml: 2, mb: 0 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Real-time transaction monitoring
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Suspicious activity detection
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Interactive transaction visualization
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box component="ul" sx={{ ml: 2, mb: 0 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Pattern recognition algorithms
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Detailed transaction history
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Comprehensive reporting tools
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <FileSearchOutlined
                  style={{ marginRight: 8, color: "#1976d2" }}
                />
                How to Use MoneyMap
              </Typography>

              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Dashboard Overview:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                The main dashboard displays transaction metrics, recent
                activities, and suspicious transaction alerts. You can filter
                data by date ranges and view transaction trends through
                interactive charts.
              </Typography>

              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Transaction Analysis:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                To analyze suspicious transactions, navigate to the "Suspicious
                Activity" section where you can investigate flagged
                transactions, view transaction networks, and drill down into
                specific patterns that triggered alerts.
              </Typography>

              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Profile Management:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Use the profile menu in the top-right corner to edit your
                profile information, view login history, and adjust privacy
                settings. You can upload a profile picture and update your
                personal details.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <UserOutlined style={{ marginRight: 8, color: "#1976d2" }} />
                Support Contact
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                For additional help or support requests, please contact:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Email: support@moneymap.example.com
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Phone: +1 (555) 123-4567
                </Typography>
                <Typography variant="body2">
                  Hours: Monday-Friday, 9:00 AM - 5:00 PM EST
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHelpDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Privacy Center Dialog */}
      <Dialog
        open={openPrivacyDialog}
        onClose={handleClosePrivacyDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SafetyOutlined
              style={{ marginRight: 8, color: "#1976d2", fontSize: "1.25rem" }}
            />
            <Typography variant="h5">Privacy Center</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert
            icon={<InfoCircleOutlined />}
            severity="info"
            sx={{ mb: 3, "& .MuiAlert-icon": { alignItems: "center" } }}
          >
            Your privacy and data security are important to us. This section
            explains how MoneyMap handles your data.
          </Alert>

          <Card sx={{ mb: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <SafetyOutlined style={{ marginRight: 8, color: "#1976d2" }} />
                Data Collection
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                MoneyMap collects transaction data, user account information,
                and system usage statistics to provide and improve its services.
                This includes financial transactions, login history, and system
                interactions.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <SafetyOutlined style={{ marginRight: 8, color: "#1976d2" }} />
                Data Usage
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                We use this data to detect suspicious activities, analyze
                transaction patterns, and improve our fraud detection
                algorithms. Your data helps us keep the financial system secure
                and identify potential money laundering attempts.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <CheckCircleOutlined
                  style={{ marginRight: 8, color: "#4caf50" }}
                />
                Data Protection
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                All data is encrypted in transit and at rest. Access is
                restricted to authorized personnel only, and we implement strict
                security controls to prevent unauthorized access. Your financial
                data is never shared with third parties without explicit legal
                requirements.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Rights
              </Typography>
              <Box component="ul" sx={{ ml: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Access your personal data
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Request corrections to inaccurate data
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Request deletion of your data under certain circumstances
                </Typography>
                <Typography component="li" variant="body2">
                  Receive an export of your data
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrivacyDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activity History Dialog */}
      <Dialog
        open={openHistoryDialog}
        onClose={handleCloseHistoryDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ClockCircleOutlined
              style={{ marginRight: 8, color: "#1976d2", fontSize: "1.25rem" }}
            />
            <Typography variant="h5">Activity History</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert
            icon={<InfoCircleOutlined />}
            severity="info"
            sx={{ mb: 3, "& .MuiAlert-icon": { alignItems: "center" } }}
          >
            This log shows all login and logout activities in the system.
          </Alert>

          <TableContainer component={Paper} variant="outlined">
            <Table aria-label="activity history table">
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.lighter" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loginHistory.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {row.action === "Login" ? (
                          <CheckCircleOutlined
                            style={{ marginRight: 8, color: "#4caf50" }}
                          />
                        ) : (
                          <ClockCircleOutlined
                            style={{ marginRight: 8, color: "#2196f3" }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          color={
                            row.action === "Login"
                              ? "success.main"
                              : "info.main"
                          }
                          sx={{ fontWeight: 500 }}
                        >
                          {row.action}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.user}</TableCell>
                    <TableCell>{row.timestamp}</TableCell>
                    <TableCell>{row.ipAddress}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
