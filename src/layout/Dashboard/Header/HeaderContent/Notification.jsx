import { useRef, useState } from "react";

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

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function Notification() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const anchorRef = useRef(null);
  const [read, setRead] = useState(3); // Increased to 3 notifications
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
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
                            onClick={() => setRead(0)}
                          >
                            <CheckCircleOutlined
                              style={{ fontSize: "1.15rem" }}
                            />
                          </IconButton>
                        </Tooltip>
                      )}
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
                    <ListItem
                      component={ListItemButton}
                      divider
                      selected={read > 0}
                      secondaryAction={
                        <Typography variant="caption" noWrap>
                          Just now
                        </Typography>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{ color: "error.main", bgcolor: "error.lighter" }}
                        >
                          <WarningOutlined />
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
                            detected from Krishna Davda to Malik Ashraf.
                          </Typography>
                        }
                        secondary="High priority alert"
                      />
                    </ListItem>
                    <ListItem
                      component={ListItemButton}
                      divider
                      selected={read > 1}
                      secondaryAction={
                        <Typography variant="caption" noWrap>
                          2 hours ago
                        </Typography>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            color: "primary.main",
                            bgcolor: "primary.lighter",
                          }}
                        >
                          <DollarOutlined />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="h6">
                            Large transaction of{" "}
                            <Typography component="span" variant="subtitle1">
                              ₹250,000
                            </Typography>{" "}
                            detected.
                          </Typography>
                        }
                        secondary="Transaction ID: XYZ123456789"
                      />
                    </ListItem>
                    <ListItem
                      component={ListItemButton}
                      divider
                      selected={read > 2}
                      secondaryAction={
                        <Typography variant="caption" noWrap>
                          5 hours ago
                        </Typography>
                      }
                    >
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
                        secondary="5 suspicious transactions identified"
                      />
                    </ListItem>
                    <ListItem
                      component={ListItemButton}
                      divider
                      secondaryAction={
                        <Typography variant="caption" noWrap>
                          Yesterday
                        </Typography>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            color: "warning.main",
                            bgcolor: "warning.lighter",
                          }}
                        >
                          <AlertOutlined />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="h6">
                            <Typography component="span" variant="subtitle1">
                              System alert:
                            </Typography>{" "}
                            Unusual pattern of transactions detected between
                            multiple accounts.
                          </Typography>
                        }
                        secondary="Please review transaction graph"
                      />
                    </ListItem>
                    <ListItemButton
                      sx={{ textAlign: "center", py: `${12}px !important` }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" color="primary">
                            View All Alerts
                          </Typography>
                        }
                      />
                    </ListItemButton>
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
