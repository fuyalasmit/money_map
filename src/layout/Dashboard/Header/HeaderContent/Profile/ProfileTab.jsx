import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// material-ui
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// assets
import EditOutlined from "@ant-design/icons/EditOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import BankOutlined from "@ant-design/icons/BankOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import BarChartOutlined from "@ant-design/icons/BarChartOutlined";
import SafetyCertificateOutlined from "@ant-design/icons/SafetyCertificateOutlined";

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

export default function ProfileTab({ handleLogout }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Handle logout action
  const onLogout = () => {
    if (handleLogout) {
      handleLogout();
    } else {
      // Default logout behavior - redirect to login page
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <List
      component="nav"
      sx={{ p: 0, "& .MuiListItemIcon-root": { minWidth: 32 } }}
    >
      <ListItemButton onClick={() => handleNavigation("/profile/edit")}>
        <ListItemIcon>
          <EditOutlined />
        </ListItemIcon>
        <ListItemText primary="Edit Profile" />
      </ListItemButton>
      <ListItemButton onClick={() => handleNavigation("/profile/view")}>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="View Profile" />
      </ListItemButton>
      <ListItemButton onClick={() => handleNavigation("/transactions")}>
        <ListItemIcon>
          <BankOutlined />
        </ListItemIcon>
        <ListItemText primary="Transaction History" />
      </ListItemButton>
      <ListItemButton onClick={() => handleNavigation("/clients")}>
        <ListItemIcon>
          <TeamOutlined />
        </ListItemIcon>
        <ListItemText primary="Client Management" />
      </ListItemButton>
      <ListItemButton onClick={() => handleNavigation("/reports")}>
        <ListItemIcon>
          <BarChartOutlined />
        </ListItemIcon>
        <ListItemText primary="Reports & Analytics" />
      </ListItemButton>
      <ListItemButton onClick={() => handleNavigation("/security")}>
        <ListItemIcon>
          <SafetyCertificateOutlined />
        </ListItemIcon>
        <ListItemText primary="Security Settings" />
      </ListItemButton>
      <ListItemButton onClick={onLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}

ProfileTab.propTypes = { handleLogout: PropTypes.func };
