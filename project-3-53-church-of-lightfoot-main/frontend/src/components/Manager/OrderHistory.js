/**
 * @file OrderHistory.js
 * @description Component to display and manage order history, including sales and reports generation.
 * Provides functionality to filter orders by date range, generate sales reports, and produce X and Z reports.
 */

import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import { executeGet, executePost } from "../../util/Requests";
import { TimeDictionary } from "../../util/TimestampDictionary";

import "react-datepicker/dist/react-datepicker.css";
import LoadingOverlay from "./Loading";

/**
 * OrderHistory Component
 * @component
 * @description Main component for managing and displaying order history with options to filter, view, and generate reports.
 */
const OrderHistory = () => {
  /**
   * Formats a date to the start or end of the day.
   * @function
   * @param {Date} initialDate - The initial date to format.
   * @param {boolean} isEndDate - Whether to format to the end of the day (true) or start (false).
   * @returns {Date} - The formatted date.
   */
  const dateFormatter = (initialDate, isEndDate) => {
    const date = new Date(initialDate);
    if (isEndDate) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return new Date(date.toISOString());
  };

  /**
   * Gets the current date formatted as either the start or end of the day.
   * @function
   * @param {boolean} isEndDate - Whether to return the end of the day (true) or the start (false).
   * @returns {Date} - The formatted current date.
   */
  const getToday = (isEndDate) => {
    const today = new Date();
    return dateFormatter(today, isEndDate);
  };

  const [startDate, setStartDate] = useState(getToday(false));
  const [endDate, setEndDate] = useState(getToday(true));
  const [orders, setOrders] = useState([]);
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [emptyTodaysOrders, setEmpty] = useState(true);
  const [zReportWindow, setZReportWindow] = useState(false);
  const [zReportData, setZReportData] = useState([]);
  const [showZReportPopup, setShowZReportPopup] = useState(false);
  const [zReportTotal, setZReportTotal] = useState(0);
  const [xReportData, setXReportData] = useState([]);
  const [xReportTotal, setXReportTotal] = useState(0);
  const [showXReportPopup, setShowXReportPopup] = useState(false);
  const [salesReportData, setSalesReportData] = useState([]);
  const [salesReportTotal, setSalesReportTotal] = useState("$0.00");
  const [showSalesReportPopup, setShowSalesReportPopup] = useState(false);

  /**
   * Fetches orders based on the selected date range and updates the state.
   * @async
   * @function
   */
  const fetchData = useCallback(async () => {
    if (startDate && endDate) {
      const adjustedStartDate = new Date(startDate);
      const adjustedEndDate = new Date(endDate);
      const todaysDate = new Date();
      const todayStart = dateFormatter(todaysDate, false);
      const todayEnd = dateFormatter(todaysDate, true);

      try {
        const data = await executeGet(
          `orders?startDate=${
            adjustedStartDate.toISOString().split("T")[0]
          }&endDate=${adjustedEndDate.toISOString().split("T")[0]}`,
          {},
          "GET"
        );
        setOrders(data);

        var data2 = await executeGet(
          `orders?startDate=${todayStart.toISOString()}&endDate=${todayEnd.toISOString()}`,
          {},
          "GET"
        );
        data2 = data2.filter((item) => item.reportable === true);
        setTodaysOrders(data2);
        setEmpty(data2.length === 0);
      } catch (error) {
        console.error("Error fetching data:", error);
        setOrders([]);
      }
    } else {
      setOrders([]);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Fetches today's orders for X or Z reports and filters them by the reportable flag.
   * @async
   * @function
   * @param {Date} today - The date to fetch orders for.
   * @returns {Array} - Array of orders reportable for today.
   */
  const dataFromDate = useCallback(async (today) => {
    const start = dateFormatter(today, false);
    const end = dateFormatter(today, true);
    try {
      const data = await executeGet(
        `orders?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
        {},
        "GET"
      );
      return data.filter((item) => item.reportable === true);
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }, []);

  /**
   * Generates a CSV file for the given order data as a sales report.
   * @function
   * @param {Array} orderData - The orders to include in the report.
   */
  const salesReport = (orderData) => {
    if (orderData.length === 0) {
      console.error("Dataset is empty! Select a start and end date.");
      return;
    }

    const headers = Object.keys(orderData[0]);
    let csv = `${headers.join(",")}\n`;
    orderData.forEach((obj) => {
      const row = headers.map((header) => `"${obj[header] || ""}"`).join(",");
      csv += `${row}\n`;
    });

    // Prepare the CSV for download
    const blob = new Blob([csv], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "salesReport.csv"; // Name of the downloaded file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Enables the Z Report confirmation window.
   * @function
   */
  const zReportWindowEnable = () => {
    setZReportWindow(true);
  };
  /**
   * Disables the Z Report confirmation window.
   * @function
   */
  const zReportWindowDisable = () => {
    setZReportWindow(false);
  };

  /**
   * Generates the X Report for today's sales, grouped by hour.
   * @async
   * @function
   */
  const xReport = useCallback(async () => {
    var data = await dataFromDate(dateFormatter(new Date()));
    setTodaysOrders(data);

    const hourMap = new Map();
    let total = 0;

    const timeDictionary = TimeDictionary();

    todaysOrders.forEach((obj) => {
      const hour = obj.timestamp.split("T")[1].split(":")[0];
      const value = parseFloat(obj.total);
      hourMap.set(hour, (hourMap.get(hour) ?? 0) + value);
      total += value;
    });

    const reportData = [];
    hourMap.forEach((total, hour) => {
      reportData.push(`${timeDictionary[hour]},${total.toFixed(2)}`);
    });

    setXReportData(reportData);
    setXReportTotal(total);
    setShowXReportPopup(true);
  }, [todaysOrders, dataFromDate]);

  /**
   * Generates the Z Report for today's sales and ingredient usage.
   * Resets today's orders after completion by setting all true reportable orders to false
   * @async
   * @function
   */
  const zReport = useCallback(async () => {
    var data;
    var menuItemIDs = [];
    const itemIDMap = new Map();

    try {
      data = await executeGet(`orders/zReport`, {}, "GET");
      let dataString = JSON.stringify(data);
      if (dataString === "[]") {
        console.error(
          "Empty data set encountered! Place some orders to populate data for the z-report!"
        );
        return;
      }
      let menuItems = await executeGet(
        `orders/menuItemIDs?orders=${dataString}`,
        {},
        "GET"
      );
      for (let i = 0; i < Object.keys(menuItems).length; i++) {
        menuItemIDs.push(menuItems[i].menu_item_id);
      }

      for (let i = 0; i < menuItemIDs.length; i++) {
        itemIDMap.set(menuItemIDs[i], (itemIDMap.get(menuItemIDs[i]) ?? 0) + 1);
      }
    } catch (error) {
      console.error("Error with JSON fetching! ", error);
    }

    setTodaysOrders(data);
    var total = 0;

    let csv = "~~Today's Total~~\n$";

    for (const obj of todaysOrders) {
      total += parseFloat(Object.values(obj)[1]);
    }
    csv +=
      total + "\n\n~~Ingredient Usage~~\nIngredient Name,Quantity Used,Units\n";

    let itemIngredientData = await executeGet(`inventory/orders`, {}, "GET");

    // O(n^2) sorry :(
    console.time("Time needed to process today's ingredients");
    var ingredientUsageMap = new Map();
    for (const [itemID, numTimesUsed] of itemIDMap) {
      for (const menuItem of itemIngredientData) {
        if (menuItem.menu_item_id === itemID) {
          ingredientUsageMap.set(
            menuItem.ingredient_id,
            menuItem.quantity_used * numTimesUsed
          );
        }
      }
    }
    console.timeEnd("Time needed to process today's ingredients");

    console.time("Time needed to execute the Z-report");
    for (const [ingredientID, quantityUsed] of ingredientUsageMap) {
      const ingredientData = await executeGet(
        `inventory/name?ingredient=${ingredientID}`,
        {},
        "GET"
      );
      csv +=
        ingredientData[0].name +
        "," +
        quantityUsed +
        "," +
        ingredientData[0].unit +
        "\n";
    }

    // console.log(csv);

    // const blob = new Blob([csv], { type: "text/plain" });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement("a");
    // link.href = url;
    // link.download = "zReport.csv";
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);

    try {
      await executePost(`orders/reset`, {});
    } catch (error) {
      console.error("Error resetting the orders for the day: ", error);
    }
    // zReportWindowEnable(true);
    setEmpty(true);
    console.timeEnd("Time needed to execute the Z-report");

    // Prepare the CSV data for display instead of download
    let reportData = [];
    reportData.push(`Ingredient Name,Quantity Used,Units`);

    for (const [ingredientID, quantityUsed] of ingredientUsageMap) {
      const ingredientData = await executeGet(
        `inventory/name?ingredient=${ingredientID}`,
        {},
        "GET"
      );
      reportData.push(
        `${ingredientData[0].name},${quantityUsed},${ingredientData[0].unit}`
      );
    }

    setZReportData(reportData); // Set the report data
    setZReportTotal(total); // Set the total for the popup
    setShowZReportPopup(true); // Show the popup
  }, [todaysOrders]);

  const buttonStyle =
    "bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 active:bg-red-700 disabled:bg-gray-400 disabled:text-gray-600";

  /**
   * Renders a confirmation popup for the Z Report generation.
   * @component
   * @returns {JSX.Element} - Confirmation popup component.
   */
  const ZReportConfirmation = () => {
    return (
      <div className="fixed top-[50%] left-[50%] w-[40%] translate-x-[-50%] translate-y-[-50%] p-[20px] bg-red-50 rounded-md border border-gray-300">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-medium">
              Z-Report Generated. Cleared today's sales data.
            </h3>
          </div>
          <div className="flex justify-between mt-4">
            <button
              className="px-3 py-1 bg-red-500 text-white rounded-md"
              onClick={zReportWindowDisable}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  const [loading, setLoading] = useState(false);
  /**
   * Gets data to be used for the sales report
   * @function
   * @param {Date} startDate The start date
   * @param {Date} endDate The end date
   */
  const grabSalesReportData = useCallback(async (startDate, endDate) => {
    setLoading(true);
    const itemTotalMap = new Map();
    var total = 0;

    try {
      const menu_items = await executeGet(`items/onlyfood`, {}, "GET");
      for (const obj of menu_items) {
        // console.log(obj.name, startDate, endDate);
        const data = await executeGet(
          `salesreport?name=${
            obj.name
          }&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
          {},
          "GET"
        );

        const quantity = data[0]?.total_quantity || 0;
        const revenueNum = Number(data[0]?.total_revenue || 0);
        total += revenueNum;
        const revenue = revenueNum.toFixed(2);

        itemTotalMap.set(obj.name, { quantity, revenue });
      }

      setSalesReportData(itemTotalMap);
      setSalesReportTotal("$" + total.toFixed(2));
    } catch (error) {
      setSalesReportData(new Map());
      console.error(error);
    } finally {
      setLoading(false);
      setShowSalesReportPopup(true);
    }
  }, []);

  /**
   * Provides a descriptive message for the table based on date selection.
   * @function
   * @param {Date} startDate - The selected start date.
   * @param {Date} endDate - The selected end date.
   * @returns {string} - The descriptive message.
   */
  const tableStatement = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return "Select start and end dates to show all orders in that date range.";
    } else if (startDate > endDate) {
      return "The start date cannot come after the end date.";
    } else {
      return "No data available for the selected date range.";
    }
  };

  /**
   * Provides a descriptive message for the table based on date selection.
   * @component
   * @returns {JSX.Element} Z Report Popup
   */
  const ZReportPopup = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center rounded-md">
        <div className="fixed top-[50%] left-[50%] w-[40%] translate-x-[-50%] translate-y-[-50%] p-[20px] bg-white rounded-md border border-gray-300 overflow-auto">
          <h3 className="text-lg font-medium">Z Report</h3>
          <table className="min-w-full border-collapse border border-gray-300 mt-4">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Description</th>
                <th className="border border-gray-300 p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">Today's Total</td>
                <td className="border border-gray-300 p-2">${zReportTotal}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2" colSpan="2">
                  Ingredient Usage
                </td>
              </tr>
              {zReportData.map((line, index) => {
                const [ingredient, quantity, unit] = line.split(",");
                return (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{ingredient}</td>
                    <td className="border border-gray-300 p-2">
                      {quantity} {unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            className="mt-4 px-3 py-1 bg-red-500 text-white rounded-md"
            onClick={() => setShowZReportPopup(false)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  /**
   * Provides a descriptive message for the table based on date selection.
   * @component
   * @returns {JSX.Element} X Report Popup
   */
  const XReportPopup = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center rounded-md">
        <div className="fixed top-[50%] left-[50%] w-[40%] translate-x-[-50%] translate-y-[-50%] p-[20px] bg-white rounded-md border border-gray-300 overflow-auto">
          <h3 className="text-lg font-medium">X Report</h3>
          <table className="min-w-full border-collapse border border-gray-300 mt-4">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Hour</th>
                <th className="border border-gray-300 p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {xReportData.map((line, index) => {
                const [hour, total] = line.split(",");
                return (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{hour}</td>
                    <td className="border border-gray-300 p-2">${total}</td>
                  </tr>
                );
              })}
              <tr>
                <td className="border border-gray-300 p-2 font-bold">Total</td>
                <td className="border border-gray-300 p-2 font-bold">
                  ${xReportTotal}
                </td>
              </tr>
            </tbody>
          </table>
          <button
            className="mt-4 px-3 py-1 bg-red-500 text-white rounded-md"
            onClick={() => setShowXReportPopup(false)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  /**
   * Provides a descriptive message for the table based on date selection.
   * @component
   * @returns {JSX.Element} Sales Report Popup
   */
  const SalesReportPopup = ({ salesReportData, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center rounded-md">
        <div className="fixed top-[50%] left-[50%] w-[40%] translate-x-[-50%] translate-y-[-50%] p-[20px] bg-white rounded-md border border-gray-300 overflow-auto">
          <h3 className="text-lg font-medium">Sales Report</h3>
          <div className="p-2 relative h-[75vh] overflow-y-auto rounded-md border border-gray-300">
            <table className="min-w-full border-collapse border border-gray-300 mt-4">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Item Name</th>
                  <th className="border border-gray-300 p-2">
                    Quantity Purchased
                  </th>
                  <th className="border border-gray-300 p-2">
                    Amount Earned ($)
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...salesReportData.entries()].map(([name, stats], index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{name}</td>
                    <td className="border border-gray-300 p-2">
                      {stats.quantity}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {stats.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="mt-4 text-lg font-bold ml-[65%]">Total Sales: {salesReportTotal}</h3>
          </div>
          <button
            className="mt-4 px-6 py-4 bg-red-500 text-white rounded-md"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex gap-[20px] justify-center">
      <div>
        <h3 className="text-lg font-medium">Start Date</h3>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(dateFormatter(date, false))}
          isClearable
          placeholderText="Select start date"
          inline
        />
        <h3 className="text-lg font-medium">End Date</h3>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(dateFormatter(date, true))}
          minDate={startDate}
          isClearable
          placeholderText="Select end date"
          inline
        />
      </div>
      <div className="h-[80vh] overflow-y-auto border-t border-r border-b">
        <table className="table-fixed">
          <thead className="text-md">
            <tr className="bg-gray-100">
              <th className="px-[20px] p-2 border-t border-b border-l text-center">
                Order ID
              </th>
              <th className="px-[20px] p-2 border-t border-b border-l text-center">
                Total ($)
              </th>
              <th className="px-[20px] p-2 border-t border-b border-l text-center">
                Timestamp
              </th>
              <th className="px-[20px] p-2 border-t border-b border-l border-r text-center">
                Employee ID
              </th>
            </tr>
          </thead>
          {orders.length > 0 ? (
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td className="p-2 border-b border-l text-center">
                    {order.order_id}
                  </td>
                  <td className="p-2 border-b border-l text-center">
                    {order.total}
                  </td>
                  <td className="p-2 border-b border-l text-center">
                    {new Date(order.timestamp).toLocaleDateString()}
                  </td>
                  <td className="p-2 border-b border-l border-r text-center">
                    {order.employee_id}
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <th colSpan="4" className="sticky">
                  {tableStatement(startDate, endDate)}
                </th>
              </tr>
            </tbody>
          )}
        </table>
      </div>
      <div className="grid h-[20px]">
        <button
          disabled={orders.length === 0}
          className={"px-6 py-2 mb-[20px] " + buttonStyle}
          onClick={() => {
            grabSalesReportData(startDate, endDate);
          }}
        >
          Generate Sales Report
        </button>
        <div className="grid gap-[20px] px-5 py-2 border-t border-gray-300">
          <button
            disabled={emptyTodaysOrders}
            className={"px-6 py-2 " + buttonStyle}
            onClick={() => xReport()}
          >
            Generate X Report
          </button>
          <button
            disabled={emptyTodaysOrders}
            className={"px-6 py-2 " + buttonStyle}
            onClick={() => zReport()}
          >
            Generate Z Report
          </button>
        </div>
      </div>
      <div className="z-10">
        {showZReportPopup && <ZReportPopup />} {/* Show the Z Report popup */}
        {showXReportPopup && <XReportPopup />} {/* Show the X Report popup */}
        {showSalesReportPopup && (
          <SalesReportPopup
            salesReportData={salesReportData}
            onClose={() => setShowSalesReportPopup(false)}
          />
        )}
        {zReportWindow && <ZReportConfirmation />}
        <div>{loading && <LoadingOverlay />}</div>
      </div>
    </div>
  );
};

export default OrderHistory;
