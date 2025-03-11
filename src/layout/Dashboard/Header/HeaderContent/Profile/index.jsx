import PropTypes from "prop-types";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// material-ui
import { useTheme } from "@mui/material/styles";
import ButtonBase from "@mui/material/ButtonBase";
import CardContent from "@mui/material/CardContent";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// project imports
import ProfileTab from "./ProfileTab";
import SettingTab from "./SettingTab";
import Avatar from "components/@extended/Avatar";
import MainCard from "components/MainCard";
import Transitions from "components/@extended/Transitions";
import IconButton from "components/@extended/IconButton";

// assets
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import avatar1 from "assets/images/users/avatar-1.png";

// tab panel wrapper
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    "aria-controls": `profile-tabpanel-${index}`,
  };
}

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function Profile() {
  const theme = useTheme();
  const navigate = useNavigate();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "Asmit Phuyal",
    bio: "Bank Manager",
    profileImage: avatar1,
  });

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      // First check current user from auth
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);

        // Look for full details in the users array
        const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const userDetails = allUsers.find(
          (user) => user.email === parsedUser.email
        );

        if (userDetails) {
          setUserData({
            name:
              parsedUser.name ||
              userDetails.firstname + " " + userDetails.lastname,
            bio: userDetails.company || "User",
            profileImage: parsedUser.photo || userDetails.photo || avatar1,
          });
          return;
        }

        // Fall back to currentUser data
        setUserData({
          name: parsedUser.name,
          bio: "User",
          profileImage: parsedUser.photo || avatar1,
        });
        return;
      }

      // Fall back to userProfile if no currentUser
      const savedUser = localStorage.getItem("userProfile");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUserData({
          name: parsedUser.name,
          bio: parsedUser.bio,
          profileImage: parsedUser.profileImage || avatar1,
        });
      }
    };

    loadUserData();

    // Listen for storage events (for cross-tab synchronization)
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userProfileUpdated", loadUserData);

    // Set up interval to check for changes (only needed if multiple parts of app update profile)
    const intervalId = setInterval(loadUserData, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userProfileUpdated", loadUserData);
      clearInterval(intervalId);
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

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Handle profile update from ProfileTab
  const handleProfileUpdate = () => {
    // We'll reload user data when profile is updated
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      setUserData({
        name: parsedUser.name,
        bio: parsedUser.bio || "User",
        profileImage: parsedUser.photo || avatar1,
      });
    }
  };

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={(theme) => ({
          p: 0.25,
          bgcolor: open ? "grey.100" : "transparent",
          borderRadius: 1,
          "&:hover": { bgcolor: "secondary.lighter" },
          "&:focus-visible": {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2,
          },
          ...theme.applyStyles("dark", {
            bgcolor: open ? "background.default" : "transparent",
            "&:hover": { bgcolor: "secondary.light" },
          }),
        })}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? "profile-grow" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Stack direction="row" sx={{ gap: 1.25, alignItems: "center", p: 0.5 }}>
          <Avatar alt="profile user" src={userData.profileImage} size="sm" />
          <Typography variant="subtitle1" sx={{ textTransform: "capitalize" }}>
            {userData.name}
          </Typography>
        </Stack>
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 9],
              },
            },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="grow"
            position="top-right"
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={(theme) => ({
                boxShadow: theme.customShadows.z1,
                width: 290,
                minWidth: 240,
                maxWidth: { xs: 250, md: 290 },
              })}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid>
                        <Stack
                          direction="row"
                          sx={{ gap: 1.25, alignItems: "center" }}
                        >
                          <Avatar
                            alt="profile user"
                            src={userData.profileImage}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Stack>
                            <Typography variant="h6">
                              {userData.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {userData.bio}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid>
                        <Tooltip title="Logout">
                          <IconButton
                            size="large"
                            sx={{ color: "text.primary" }}
                            onClick={handleLogout}
                          >
                            <LogoutOutlined />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                      variant="fullWidth"
                      value={value}
                      onChange={handleChange}
                      aria-label="profile tabs"
                    >
                      <Tab
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          textTransform: "capitalize",
                          gap: 1.25,
                          "& .MuiTab-icon": {
                            marginBottom: 0,
                          },
                        }}
                        icon={<UserOutlined />}
                        label="Profile"
                        {...a11yProps(0)}
                      />
                      <Tab
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          textTransform: "capitalize",
                          gap: 1.25,
                          "& .MuiTab-icon": {
                            marginBottom: 0,
                          },
                        }}
                        icon={<SettingOutlined />}
                        label="Setting"
                        {...a11yProps(1)}
                      />
                    </Tabs>
                  </Box>
                  <TabPanel value={value} index={0} dir={theme.direction}>
                    <ProfileTab
                      handleLogout={handleLogout}
                      onProfileUpdate={handleProfileUpdate}
                    />
                  </TabPanel>
                  <TabPanel value={value} index={1} dir={theme.direction}>
                    <SettingTab />
                  </TabPanel>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number,
  index: PropTypes.number,
  other: PropTypes.any,
};
