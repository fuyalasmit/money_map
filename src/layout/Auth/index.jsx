import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import ChatBot from "components/ChatBot/ChatBot";

// ==============================|| LAYOUT - AUTH ||============================== //

export default function AuthLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Outlet />
      {!isAuthPage && <ChatBot />}
    </Box>
  );
}
