import { createBrowserRouter, Navigate } from "react-router-dom";

// project imports
import MainRoutes from "./MainRoutes";
import LoginRoutes from "./LoginRoutes";

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },
    MainRoutes,
    LoginRoutes,
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
