// assets
import { DashboardOutlined, UploadOutlined } from "@ant-design/icons";

// icons
const icons = {
  DashboardOutlined,
  UploadOutlined,
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: "group-dashboard",
  title: "Navigation",
  type: "group",
  children: [
    {
      id: "upload-transaction",
      title: "Upload Transaction",
      type: "item",
      url: "/dashboard/mainpage",
      icon: icons.UploadOutlined,
      breadcrumbs: false,
    },
    {
      id: "dashboard",
      title: "Dashboard",
      type: "item",
      url: "/dashboard/default",
      icon: icons.DashboardOutlined,
      breadcrumbs: false,
    },
  ],
};

export default dashboard;
