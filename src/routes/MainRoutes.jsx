import { lazy } from "react";
import { Navigate } from "react-router-dom";

// project imports
import Loadable from "components/Loadable";
import DashboardLayout from "layout/Dashboard";
import AuthGuard from "components/guards/AuthGuard";

// render- Dashboard
const DashboardDefault = Loadable(
  lazy(() => import("pages/dashboard/default"))
);

// Main Dashboard Page
const MainPage = Loadable(lazy(() => import("pages/dashboard/mainpage")));

// render - sample page
const SamplePage = Loadable(
  lazy(() => import("pages/extra-pages/sample-page"))
);
const GraphPage = Loadable(lazy(() => import("pages/extra-pages/graph")));

// Add new import for suspicious activity page
const SuspiciousActivityPage = Loadable(
  lazy(() => import("pages/extra-pages/suspicious-activity"))
);

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: "/",
  element: (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: "/",
      element: <Navigate to="/dashboard/mainpage" replace />,
    },
    {
      path: "dashboard",
      children: [
        {
          path: "default",
          element: <DashboardDefault />,
        },
        {
          path: "mainpage",
          element: <MainPage />,
        },
      ],
    },
    {
      path: "sample-page",
      element: <SamplePage />,
    },
    {
      path: "graph",
      element: <GraphPage />,
    },
    // Add new route for suspicious activity page
    {
      path: "suspicious-activity",
      element: <SuspiciousActivityPage />,
    },
  ],
};

export default MainRoutes;
