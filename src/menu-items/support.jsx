// assets
import {
  ChromeOutlined,
  QuestionOutlined,
  LineChartOutlined,
  AlertOutlined,
} from "@ant-design/icons";

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined,
  LineChartOutlined,
  AlertOutlined,
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const support = {
  id: "support",
  title: "Support",
  type: "group",
  children: [
    {
      id: "sample-page",
      title: "Demo Transaction",
      type: "item",
      url: "/sample-page",
      icon: icons.ChromeOutlined,
    },
    {
      id: "graph-page",
      title: "Graph",
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

export default support;
