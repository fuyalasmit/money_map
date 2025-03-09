// assets
import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  AlertOutlined,
  LineChartOutlined,
} from "@ant-design/icons";

// icons
const icons = {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  AlertOutlined,
  LineChartOutlined,
};

// ==============================|| MENU ITEMS: UTILITIES ||============================== //

const utilities = {
  id: "utilities",
  title: "Utilities",
  type: "group",
  children: [
    {
      id: "util-sample-page",
      title: "Sample Page",
      type: "item",
      url: "/sample-page",
      icon: icons.BarcodeOutlined,
    },
    {
      id: "graph",
      title: "Transaction Network",
      type: "item",
      url: "/graph",
      icon: icons.LineChartOutlined,
    },
    {
      id: "suspicious-activity",
      title: "Suspicious Activity",
      type: "item",
      url: "/suspicious-activity",
      icon: icons.AlertOutlined,
    },
  ],
};

export default utilities;
