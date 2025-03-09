import { useState } from "react";
import { useNavigate } from "react-router-dom";

// material-ui
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// assets
import QuestionCircleOutlined from "@ant-design/icons/QuestionCircleOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import LockOutlined from "@ant-design/icons/LockOutlined";
import UnorderedListOutlined from "@ant-design/icons/UnorderedListOutlined";

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

export default function SettingTab() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleListItemClick = (index, route = "") => {
    setSelectedIndex(index);

    if (route && route !== "") {
      navigate(route);
    }
  };

  return (
    <List
      component="nav"
      sx={{ p: 0, "& .MuiListItemIcon-root": { minWidth: 32 } }}
    >
      <ListItemButton
        selected={selectedIndex === 0}
        onClick={() => handleListItemClick(0, "/help")}
      >
        <ListItemIcon>
          <QuestionCircleOutlined />
        </ListItemIcon>
        <ListItemText primary="Help & Support" />
      </ListItemButton>

      <ListItemButton
        selected={selectedIndex === 1}
        onClick={() => handleListItemClick(1, "/settings/account")}
      >
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="Account Settings" />
      </ListItemButton>

      <ListItemButton
        selected={selectedIndex === 2}
        onClick={() => handleListItemClick(2, "/settings/privacy")}
      >
        <ListItemIcon>
          <LockOutlined />
        </ListItemIcon>
        <ListItemText primary="Privacy Center" />
      </ListItemButton>

      <ListItemButton
        selected={selectedIndex === 4}
        onClick={() => handleListItemClick(4, "/history")}
      >
        <ListItemIcon>
          <UnorderedListOutlined />
        </ListItemIcon>
        <ListItemText primary="Activity History" />
      </ListItemButton>
    </List>
  );
}
