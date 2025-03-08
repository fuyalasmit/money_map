import PropTypes from "prop-types";

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

export default function ProfileTab() {
  return (
    <List
      component="nav"
      sx={{ p: 0, "& .MuiListItemIcon-root": { minWidth: 32 } }}
    >
      <ListItemButton>
        <ListItemIcon>
          <EditOutlined />
        </ListItemIcon>
        <ListItemText primary="Edit Profile" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="View Profile" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <BankOutlined />
        </ListItemIcon>
        <ListItemText primary="Transaction History" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <TeamOutlined />
        </ListItemIcon>
        <ListItemText primary="Client Management" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <BarChartOutlined />
        </ListItemIcon>
        <ListItemText primary="Reports & Analytics" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <SafetyCertificateOutlined />
        </ListItemIcon>
        <ListItemText primary="Security Settings" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}

ProfileTab.propTypes = { handleLogout: PropTypes.func };
