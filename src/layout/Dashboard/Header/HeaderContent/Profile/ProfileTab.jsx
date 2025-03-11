import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
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
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";

// assets
import EditOutlined from "@ant-design/icons/EditOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import CameraOutlined from "@ant-design/icons/CameraOutlined";
import CalendarOutlined from "@ant-design/icons/CalendarOutlined";
import MailOutlined from "@ant-design/icons/MailOutlined";
import ClockCircleOutlined from "@ant-design/icons/ClockCircleOutlined";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";

// Default avatar image
import avatar1 from "assets/images/users/avatar-1.png";

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

export default function ProfileTab({ handleLogout, onProfileUpdate }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Get user data from registration/login information
  const getInitialUserData = () => {
    // First check if there's a current logged in user
    const currentUserJSON = localStorage.getItem("currentUser");
    if (!currentUserJSON) {
      return getDefaultUserData();
    }

    const currentUser = JSON.parse(currentUserJSON);

    // Look up full user details from the users array using the email
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const userDetails = allUsers.find(
      (user) => user.email === currentUser.email
    );

    if (userDetails) {
      // If we found the user in the users array, return their complete data
      return {
        name: userDetails.firstname + " " + userDetails.lastname,
        firstname: userDetails.firstname,
        lastname: userDetails.lastname,
        email: userDetails.email,
        bio: userDetails.company || "User",
        profileImage: userDetails.photo || avatar1,
        lastLogin: new Date().toLocaleString(),
        joinDate:
          new Date(userDetails.createdAt).toLocaleDateString() ||
          "January 15, 2023",
      };
    }

    // If we have currentUser but no full details, use the currentUser data
    return {
      name: currentUser.name,
      email: currentUser.email,
      bio: "User",
      profileImage: currentUser.photo || avatar1,
      lastLogin: new Date().toLocaleString(),
      joinDate: "January 15, 2023",
    };
  };

  // Default fallback user data
  const getDefaultUserData = () => {
    // Check if there's a previously saved profile
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }

    return {
      name: "Asmit Phuyal",
      email: "info@codedthemes.com",
      bio: "Bank Manager",
      profileImage: avatar1,
      lastLogin: new Date().toLocaleString(),
      joinDate: "January 15, 2023",
    };
  };

  // User data state
  const [userData, setUserData] = useState(getInitialUserData);

  // Update user data in both userProfile and the users array
  const updateUserData = (newData) => {
    // Store in userProfile for backward compatibility
    localStorage.setItem("userProfile", JSON.stringify(newData));

    // Also update the currentUser entry
    const currentUserJSON = localStorage.getItem("currentUser");
    if (currentUserJSON) {
      const currentUser = JSON.parse(currentUserJSON);
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...currentUser,
          name: newData.name,
          photo: newData.profileImage,
        })
      );
    }

    // Also update the user in the users array
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    if (currentUser.email) {
      const updatedUsers = allUsers.map((user) => {
        if (user.email === currentUser.email) {
          return {
            ...user,
            firstname: newData.firstname || newData.name.split(" ")[0],
            lastname: newData.lastname || newData.name.split(" ")[1] || "",
            photo: newData.profileImage,
            company: newData.bio,
          };
        }
        return user;
      });

      localStorage.setItem("users", JSON.stringify(updatedUsers));
    }

    setUserData(newData);

    // Notify parent component about profile update
    if (onProfileUpdate) {
      onProfileUpdate();
    }

    // Create a custom event to notify other components
    const event = new Event("userProfileUpdated");
    window.dispatchEvent(event);
  };

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    // Just ensure userProfile is set for backward compatibility
    localStorage.setItem("userProfile", JSON.stringify(userData));
  }, [userData]);

  // Handle dialog open/close
  const handleOpenEditDialog = () => setOpenEditDialog(true);
  const handleCloseEditDialog = () => setOpenEditDialog(false);
  const handleOpenViewDialog = () => setOpenViewDialog(true);
  const handleCloseViewDialog = () => setOpenViewDialog(false);

  // Handle profile image change with animation
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      // Start upload animation
      setIsUploading(true);
      setUploadSuccess(false);

      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        // Simulate network delay for upload effect
        setTimeout(() => {
          updateUserData({
            ...userData,
            profileImage: e.target.result,
          });

          setIsUploading(false);
          setUploadSuccess(true);

          // Reset success indicator after 2 seconds
          setTimeout(() => {
            setUploadSuccess(false);
          }, 2000);
        }, 800);
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleUpdateProfile = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const nameParts = formData.get("name").split(" ");
    const firstname = nameParts[0] || "";
    const lastname = nameParts.slice(1).join(" ") || "";

    const updatedData = {
      ...userData,
      name: formData.get("name") || userData.name,
      firstname,
      lastname,
      bio: formData.get("bio") || userData.bio,
    };

    updateUserData(updatedData);
    handleCloseEditDialog();
  };

  // Handle logout
  const onLogout = () => {
    if (handleLogout) {
      handleLogout();
    } else {
      // Default logout behavior - redirect to login page
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  };

  return (
    <>
      <List
        component="nav"
        sx={{ p: 0, "& .MuiListItemIcon-root": { minWidth: 32 } }}
      >
        <ListItemButton onClick={handleOpenEditDialog}>
          <ListItemIcon>
            <EditOutlined />
          </ListItemIcon>
          <ListItemText primary="Edit Profile" />
        </ListItemButton>

        <ListItemButton onClick={handleOpenViewDialog}>
          <ListItemIcon>
            <UserOutlined />
          </ListItemIcon>
          <ListItemText primary="View Profile" />
        </ListItemButton>

        <ListItemButton onClick={onLogout}>
          <ListItemIcon>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>

      {/* Edit Profile Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <form onSubmit={handleUpdateProfile}>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ position: "relative", mb: 2 }}>
                {/* Avatar with dynamic image */}
                <Avatar
                  src={userData.profileImage}
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid",
                    borderColor: "primary.light",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                  alt={userData.name}
                />

                {/* Upload animation overlay */}
                {isUploading && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      borderRadius: "50%",
                    }}
                  >
                    <CircularProgress size={40} color="primary" />
                  </Box>
                )}

                {/* Success checkmark animation */}
                <Fade in={uploadSuccess} timeout={500}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: uploadSuccess ? "flex" : "none",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(76, 175, 80, 0.3)",
                      borderRadius: "50%",
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 40, color: "#fff" }}
                    />
                  </Box>
                </Fade>

                {/* Hidden file input */}
                <input
                  accept="image/*"
                  type="file"
                  id="profile-image-upload"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />

                {/* Camera button */}
                <IconButton
                  component="span"
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUploading}
                  sx={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                    height: 36,
                    width: 36,
                    transition: "all 0.2s ease-in-out",
                    "&:active": {
                      transform: "scale(0.95)",
                    },
                  }}
                >
                  <CameraOutlined />
                </IconButton>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Click on the camera icon to change your profile picture
              </Typography>

              <Stack spacing={3} sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  defaultValue={userData.name}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Email"
                  defaultValue={userData.email}
                  InputProps={{ readOnly: true }}
                  disabled
                  helperText="Email cannot be changed"
                />

                <TextField
                  fullWidth
                  label="Role"
                  name="bio"
                  defaultValue={userData.bio}
                />
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="error">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<CheckCircleOutlined />}
            >
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Profile Details</DialogTitle>
        <DialogContent>
          <Card
            sx={{ boxShadow: 0, border: "1px solid", borderColor: "divider" }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Avatar
                  src={userData.profileImage}
                  sx={{
                    width: 140,
                    height: 140,
                    mb: 2,
                    border: "4px solid",
                    borderColor: "primary.light",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                  alt={userData.name}
                />
                <Typography variant="h5">{userData.name}</Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {userData.bio}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MailOutlined style={{ marginRight: 8, color: "#697586" }} />
                  <Typography variant="subtitle2" sx={{ minWidth: 120 }}>
                    Email:
                  </Typography>
                  <Typography variant="body2">{userData.email}</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ClockCircleOutlined
                    style={{ marginRight: 8, color: "#697586" }}
                  />
                  <Typography variant="subtitle2" sx={{ minWidth: 120 }}>
                    Last Login:
                  </Typography>
                  <Typography variant="body2">{userData.lastLogin}</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CalendarOutlined
                    style={{ marginRight: 8, color: "#697586" }}
                  />
                  <Typography variant="subtitle2" sx={{ minWidth: 120 }}>
                    Joined:
                  </Typography>
                  <Typography variant="body2">{userData.joinDate}</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleOutlined
                    style={{ marginRight: 8, color: "#4CAF50" }}
                  />
                  <Typography variant="subtitle2" sx={{ minWidth: 120 }}>
                    Status:
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Active
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

ProfileTab.propTypes = {
  handleLogout: PropTypes.func,
  onProfileUpdate: PropTypes.func,
};
