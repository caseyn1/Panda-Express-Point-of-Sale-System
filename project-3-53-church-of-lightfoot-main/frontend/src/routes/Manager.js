import React from "react";
import { Tab, Tabs } from "../components/Manager/ManagerTabs";
import Employee from "../components/Manager/Employee";
import Inventory from "../components/Manager/Inventory";
import OrderHistory from "../components/Manager/OrderHistory";
import UsageChart from "../components/Manager/UsageChart";
import Services from "../components/Manager/Services";
import { Navbar } from "../components/Navbar";
import ReviewHistory from "../components/Manager/ReviewHistory";

/**
 * Manager Route
 * @component
 * @param {Object} props - React props.
 * @returns {React.JSX.Element} A React component.
 */
export const Manager = () => {
  const tabs = [
    "EMPLOYEES",
    "INVENTORY",
    "SALES HISTORY",
    "USAGE CHART",
    "SERVICES",
    "REVIEWS"
  ];

  return (
    <div>
      <Navbar />
      <Tabs active={"EMPLOYEES"}>
        {/* Default to employee view */}
        <Tab label={tabs.at(0)} key={tabs.at(0)}>
          <Employee />
        </Tab>
        <Tab label={tabs.at(1)} key={tabs.at(1)}>
          <Inventory />
        </Tab>
        <Tab label={tabs.at(2)} key={tabs.at(2)}>
          <OrderHistory />
        </Tab>
        <Tab label={tabs.at(3)} key={tabs.at(3)}>
          <UsageChart />
        </Tab>
        <Tab active={"SERVICES"} label={tabs.at(4)} key={tabs.at(4)}>
          <Services />
        </Tab>
        <Tab label={tabs.at(5)} key={tabs.at(5)}>
          <ReviewHistory />
        </Tab>
      </Tabs>
    </div>
  );
};

