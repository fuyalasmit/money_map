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
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

// project imports
import MainCard from "components/MainCard";
import CustomIconButton from "components/@extended/IconButton";
import Transitions from "components/@extended/Transitions";

// assets
import BellOutlined from "@ant-design/icons/BellOutlined";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import WarningOutlined from "@ant-design/icons/WarningOutlined";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import AlertOutlined from "@ant-design/icons/AlertOutlined";
import SafetyOutlined from "@ant-design/icons/SafetyOutlined";
import FileOutlined from "@ant-design/icons/FileOutlined";
import CloudUploadOutlined from "@ant-design/icons/CloudUploadOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";

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

const closeButtonSX = {
  position: "absolute",
  right: 8,
  top: 8,
  color: "grey.500",
  "&:hover": {
    color: "error.main",
  },
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
    case "Fan Pattern":
      return {
        color: "secondary.main",
        bgcolor: "secondary.lighter",
        icon: AlertOutlined,
      };
    case "Periodic":
      return {
        color: "info.main",
        bgcolor: "info.lighter",
        icon: AlertOutlined,
      };
    case "Reciprocal":
      return {
        color: "warning.dark",
        bgcolor: "warning.lighter",
        icon: AlertOutlined,
      };
    case "File Upload":
      return {
        color: "info.main",
        bgcolor: "info.lighter",
        icon: CloudUploadOutlined,
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
        .slice(0, 10); // Increased from 4 to show more transactions

      // Convert transactions to notifications
      const newNotifications = suspiciousTransactions.map((tx) => ({
        id: tx.id || tx.transactionId,
        type: "suspicious",
        timestamp: tx.timestamp,
        sender: tx.sender || tx.senderName,
        receiver: tx.receiver || tx.receiverName,
        senderAccount: tx.senderAccount,
        receiverAccount: tx.receiverAccount,
        amount: tx.amount,
        reasons: tx.reasons || [],
        read: false,
      }));

      // Check if there are actually new notifications
      if (newNotifications.length > 0) {
        // Only update if we have new notifications
        setNotifications((prev) => {
          // Filter out existing notifications with the same ID
          const existingIds = new Set(prev.map((n) => n.id));
          const filteredNew = newNotifications.filter(
            (n) => !existingIds.has(n.id)
          );

          if (filteredNew.length > 0) {
            // Update unread count
            setRead((prevRead) => prevRead + filteredNew.length);

            // Combine new notifications with existing ones, keeping order
            return [...filteredNew, ...prev].slice(0, 15); // Limit to 15 notifications
          }
          return prev;
        });
      }
    }
  }, [transactions]);

  // Listen for file upload events
  useEffect(() => {
    const handleFileUploaded = (event) => {
      const fileData = event.detail;

      // Create a new notification for file upload
      const newNotification = {
        id: `file-${Date.now()}`,
        type: "file",
        timestamp: new Date().toISOString(),
        fileName: fileData.fileName || "Transaction data",
        fileSize: fileData.fileSize || "Unknown size",
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 15));
      setRead((prevRead) => prevRead + 1);
    };

    // Listen for suspicious transaction detection events
    const handleSuspiciousDetected = (event) => {
      const txData = event.detail;

      // Create a new notification for suspicious detection
      const newNotification = {
        id: `suspicious-${Date.now()}`,
        type: "detection",
        timestamp: new Date().toISOString(),
        count: txData.count || 1,
        patterns: txData.patterns || ["Unknown"],
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 15));
      setRead((prevRead) => prevRead + 1);
    };

    // Dispatch a custom event when transactions are analyzed by the server
    const handleTransactionsAnalyzed = (event) => {
      if (event?.detail?.suspicious) {
        const patterns = event.detail.patterns || [];
        const count = event.detail.count || 1;

        const newNotification = {
          id: `analysis-${Date.now()}`,
          type: "detection",
          timestamp: new Date().toISOString(),
          count: count,
          patterns: patterns,
          read: false,
        };

        setNotifications((prev) => [newNotification, ...prev].slice(0, 15));
        setRead((prevRead) => prevRead + 1);
      }
    };

    // Add event listeners
    window.addEventListener("fileUploaded", handleFileUploaded);
    window.addEventListener("suspiciousDetected", handleSuspiciousDetected);
    window.addEventListener("transactionsAnalyzed", handleTransactionsAnalyzed);

    return () => {
      // Clean up event listeners
      window.removeEventListener("fileUploaded", handleFileUploaded);
      window.removeEventListener(
        "suspiciousDetected",
        handleSuspiciousDetected
      );
      window.removeEventListener(
        "transactionsAnalyzed",
        handleTransactionsAnalyzed
      );
    };
  }, []);

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
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const handleDismissAll = () => {
    setNotifications([]);
    setRead(0);
  };

  const handleDismissNotification = (id) => (event) => {
    event.stopPropagation(); // Prevent the notification click event
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      // If it's unread, decrease the read count
      if (notification && !notification.read) {
        setRead((prevRead) => Math.max(0, prevRead - 1));
      }
      return prev.filter((notification) => notification.id !== id);
    });
  };

  const refreshTransactions = () => {
    refetch();
  };

  // Render different notification types
  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case "file":
        return (
          <>
            <ListItemAvatar>
              <Avatar sx={{ color: "info.main", bgcolor: "info.lighter" }}>
                <FileOutlined />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="h6">
                  <Typography
                    component="span"
                    variant="subtitle1"
                    sx={{ color: "info.main" }}
                  >
                    File uploaded
                  </Typography>{" "}
                  successfully
                </Typography>
              }
              secondary={`${notification.fileName} • ${getRelativeTime(notification.timestamp)}`}
            />
            <IconButton
              size="small"
              onClick={handleDismissNotification(notification.id)}
              sx={closeButtonSX}
            >
              <CloseOutlined />
            </IconButton>
          </>
        );

      case "detection":
        return (
          <>
            <ListItemAvatar>
              <Avatar
                sx={{ color: "warning.main", bgcolor: "warning.lighter" }}
              >
                <AlertOutlined />
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
                    {notification.count} suspicious{" "}
                    {notification.count > 1 ? "transactions" : "transaction"}
                  </Typography>{" "}
                  detected
                </Typography>
              }
              secondary={`Patterns: ${notification.patterns.join(", ")} • ${getRelativeTime(notification.timestamp)}`}
            />
            <IconButton
              size="small"
              onClick={handleDismissNotification(notification.id)}
              sx={closeButtonSX}
            >
              <CloseOutlined />
            </IconButton>
          </>
        );

      default:
        // Suspicious transaction notification
        const iconInfo =
          notification.reasons && notification.reasons.length > 0
            ? getIconForReason(notification.reasons[0])
            : getIconForReason("default");
        const IconComponent = iconInfo.icon;

        // Ensure we have sender and receiver information
        const sender = notification.sender || "Unknown";
        const receiver = notification.receiver || "Unknown";
        const amount = notification.amount || 0;

        return (
          <>
            <ListItemAvatar>
              <Avatar sx={{ color: iconInfo.color, bgcolor: iconInfo.bgcolor }}>
                <IconComponent />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="h6" sx={{ pr: 4 }}>
                  <Typography
                    component="span"
                    variant="subtitle1"
                    sx={{ color: "error.main" }}
                  >
                    Suspicious transaction
                  </Typography>{" "}
                  from <b>{sender}</b> to <b>{receiver}</b>
                </Typography>
              }
              secondary={
                <>
                  {notification.reasons && notification.reasons.length > 0
                    ? `Reason: ${notification.reasons.join(", ")}`
                    : "High priority alert"}{" "}
                  • Amount: {formatAmount(amount)}
                </>
              }
            />
            <IconButton
              size="small"
              onClick={handleDismissNotification(notification.id)}
              sx={closeButtonSX}
            >
              <CloseOutlined />
            </IconButton>
          </>
        );
    }
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <CustomIconButton
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
      </CustomIconButton>
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
                maxHeight: "80vh", // Limit height to 80% of viewport
              })}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notifications"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <Stack direction="row" spacing={0.5}>
                      {read > 0 && (
                        <Tooltip title="Mark all as read">
                          <CustomIconButton
                            color="success"
                            size="small"
                            onClick={handleMarkAllRead}
                          >
                            <CheckCircleOutlined
                              style={{ fontSize: "1.15rem" }}
                            />
                          </CustomIconButton>
                        </Tooltip>
                      )}
                      {notifications.length > 0 && (
                        <Tooltip title="Dismiss all">
                          <CustomIconButton
                            color="error"
                            size="small"
                            onClick={handleDismissAll}
                          >
                            <DeleteOutlined style={{ fontSize: "1.15rem" }} />
                          </CustomIconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Refresh">
                        <CustomIconButton
                          color="primary"
                          size="small"
                          onClick={refreshTransactions}
                        >
                          <SafetyOutlined style={{ fontSize: "1.15rem" }} />
                        </CustomIconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      maxHeight: "60vh", // Set max height for scrolling
                      overflowY: "auto", // Enable vertical scrolling
                      scrollbarWidth: "thin", // Firefox
                      "&::-webkit-scrollbar": {
                        // Webkit browsers
                        width: "6px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "#f1f1f1",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#888",
                        borderRadius: "3px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        background: "#555",
                      },
                      "& .MuiListItemButton-root": {
                        py: 0.5,
                        px: 2,
                        position: "relative",
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
                      notifications.map((notification, index) => (
                        <ListItem
                          key={notification.id}
                          component={ListItemButton}
                          divider
                          selected={!notification.read}
                          sx={{ paddingRight: 6 }} // Space for close button
                        >
                          {renderNotificationContent(notification)}
                        </ListItem>
                      ))
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
                              No notifications
                            </Typography>
                          }
                          secondary="All notifications have been dismissed"
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
