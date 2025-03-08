// assets
import {
  ChromeOutlined,
  QuestionOutlined,
  LineChartOutlined,
} from "@ant-design/icons";

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined,
  LineChartOutlined,
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
  ],
};

export default support;
