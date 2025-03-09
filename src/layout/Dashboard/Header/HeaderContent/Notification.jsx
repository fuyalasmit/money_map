import { useRef, useState, useEffect } from "react";
import { useTransactionData } from "utils/getTransactions";

// material-ui
import useMediaQuery from "@mui/material/useMediaQuery";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// project imports
import MainCard from "components/MainCard";
import IconButton from "components/@extended/IconButton";
import Transitions from "components/@extended/Transitions";

// assets
import BellOutlined from "@ant-design/icons/BellOutlined";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import WarningOutlined from "@ant-design/icons/WarningOutlined";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import AlertOutlined from "@ant-design/icons/AlertOutlined";
import SafetyOutlined from "@ant-design/icons/SafetyOutlined";

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: "1rem",
};

const actionSX = {
  mt: "6px",
  ml: 1,
  top: "auto",
  right: "auto",
  alignSelf: "flex-start",
  transform: "none",
};

// Helper function to format amounts with comma separators and currency symbol
const formatAmount = (amount) => {
  return `Rs ${parseInt(amount).toLocaleString()}`;
};

// Helper function to format relative time
const getRelativeTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffMinutes < 24 * 60) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (diffMinutes < 7 * 24 * 60) {
    const days = Math.floor(diffMinutes / (24 * 60));
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Helper function to get icon color based on reason
const getIconForReason = (reason) => {
  switch (reason) {
    case "Large Amount":
      return {
        color: "warning.main",
        bgcolor: "warning.lighter",
        icon: DollarOutlined,
      };
    case "High Velocity":
      return {
        color: "error.main",
        bgcolor: "error.lighter",
        icon: WarningOutlined,
      };
    case "Structuring":
      return {
        color: "error.main",
        bgcolor: "error.lighter",
        icon: AlertOutlined,
      };
    case "Temporal Cycle":
      return {
        color: "primary.main",
        bgcolor: "primary.lighter",
        icon: AlertOutlined,
      };
    default:
      return {
        color: "error.main",
        bgcolor: "error.lighter",
        icon: WarningOutlined,
      };
  }
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function Notification() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const { transactions, suspiciousTransactionsCount, refetch } =
    useTransactionData();

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [read, setRead] = useState(0);

  // Process transactions to create notifications
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Filter suspicious transactions and sort by timestamp (newest first)
      const suspiciousTransactions = transactions
        .filter((tx) => tx.label === "suspicious")
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 4);

      setNotifications(suspiciousTransactions);
      setRead(suspiciousTransactions.length);
    }
  }, [transactions]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleMarkAllRead = () => {
    setRead(0);
  };

  const refreshTransactions = () => {
    refetch();
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={(theme) => ({
          color: "text.primary",
          bgcolor: open ? "grey.100" : "transparent",
          ...theme.applyStyles("dark", {
            bgcolor: open ? "background.default" : "transparent",
          }),
        })}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? "profile-grow" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={read} color="error">
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={downMD ? "bottom" : "bottom-end"}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            { name: "offset", options: { offset: [downMD ? -5 : 0, 9] } },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="grow"
            position={downMD ? "top" : "top-right"}
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={(theme) => ({
                boxShadow: theme.customShadows.z1,
                width: "100%",
                minWidth: 285,
                maxWidth: { xs: 285, md: 420 },
              })}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notifications"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {read > 0 && (
                        <Tooltip title="Mark all as read">
                          <IconButton
                            color="success"
                            size="small"
                            onClick={handleMarkAllRead}
                          >
                            <CheckCircleOutlined
                              style={{ fontSize: "1.15rem" }}
                            />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Refresh">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={refreshTransactions}
                        >
                          <SafetyOutlined style={{ fontSize: "1.15rem" }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      "& .MuiListItemButton-root": {
                        py: 0.5,
                        px: 2,
                        "&.Mui-selected": {
                          bgcolor: "grey.50",
                          color: "text.primary",
                        },
                        "& .MuiAvatar-root": avatarSX,
                        "& .MuiListItemSecondaryAction-root": {
                          ...actionSX,
                          position: "relative",
                        },
                      },
                    }}
                  >
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => {
                        const iconInfo =
                          notification.reasons &&
                          notification.reasons.length > 0
                            ? getIconForReason(notification.reasons[0])
                            : getIconForReason("default");
                        const IconComponent = iconInfo.icon;

                        return (
                          <ListItem
                            key={notification.id}
                            component={ListItemButton}
                            divider
                            selected={index < read}
                            secondaryAction={
                              <Typography variant="caption" noWrap>
                                {getRelativeTime(notification.timestamp)}
                              </Typography>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  color: iconInfo.color,
                                  bgcolor: iconInfo.bgcolor,
                                }}
                              >
                                <IconComponent />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="h6">
                                  <Typography
                                    component="span"
                                    variant="subtitle1"
                                    sx={{ color: "error.main" }}
                                  >
                                    Suspicious transaction
                                  </Typography>{" "}
                                  detected from {notification.sender} to{" "}
                                  {notification.receiver}.
                                </Typography>
                              }
                              secondary={
                                <>
                                  {notification.reasons &&
                                  notification.reasons.length > 0
                                    ? `Reason: ${notification.reasons.join(", ")}`
                                    : "High priority alert"}{" "}
                                  • Amount: {formatAmount(notification.amount)}
                                </>
                              }
                            />
                          </ListItem>
                        );
                      })
                    ) : (
                      <ListItem component={ListItemButton} divider>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              color: "success.main",
                              bgcolor: "success.lighter",
                            }}
                          >
                            <SafetyOutlined />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="h6">
                              All transactions appear normal
                            </Typography>
                          }
                          secondary="No suspicious activities detected"
                        />
                      </ListItem>
                    )}

                    <ListItem component={ListItemButton} divider>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            color: "success.main",
                            bgcolor: "success.lighter",
                          }}
                        >
                          <SafetyOutlined />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="h6">
                            Transaction analysis completed &nbsp;
                            <Typography
                              component="span"
                              variant="subtitle1"
                              sx={{ color: "success.main" }}
                            >
                              successfully
                            </Typography>{" "}
                          </Typography>
                        }
                        secondary={`${suspiciousTransactionsCount} suspicious transactions identified`}
                      />
                    </ListItem>
                    {/* View All Alerts button removed */}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
