import { lazy } from "react";

// project imports
import Loadable from "components/Loadable";
import DashboardLayout from "layout/Dashboard";

// render- Dashboard
const DashboardDefault = Loadable(
  lazy(() => import("pages/dashboard/default"))
);

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
  element: <DashboardLayout />,
  children: [
    {
      path: "/",
      element: <DashboardDefault />,
    },
    {
      path: "dashboard",
      children: [
        {
          path: "default",
          element: <DashboardDefault />,
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
