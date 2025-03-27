/**
 * @file UsageChart.js
 * @description A React component that displays a bar chart showing inventory usage for a selected item over a specified date range.
 * The component fetches inventory data, allows selection of an item, and generates a usage chart.
 */

import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import { executeGet } from "../../util/Requests";
import "react-datepicker/dist/react-datepicker.css";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

/**
 * Formats a date to the start or end of the day.
 * @function
 * @param {Date} initialDate - The date to format.
 * @param {boolean} [isEndDate=false] - Whether to format to the end of the day (true) or start (false).
 * @returns {Date} - The formatted date.
 */
const dateFormatter = (initialDate, isEndDate = false) => {
  const date = new Date(initialDate);
  if (isEndDate) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return new Date(date.toISOString());
};

/**
 * Gets today's date formatted as either the start or end of the day.
 * @function
 * @param {boolean} isEndDate - Whether to return the end of the day (true) or the start (false).
 * @returns {Date} - The formatted current date.
 */
const getToday = (isEndDate) => {
  const today = new Date();
  return dateFormatter(today, isEndDate);
};

/**
 * UsageChart Component
 * @component
 * @description A component that visualizes inventory usage data in a bar chart.
 */
const UsageChart = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [startDate, setStartDate] = useState(getToday(false));
  const [endDate, setEndDate] = useState(getToday(true));
  const [selectedUnit, setUnit] = useState(null);

  useEffect(() => {
    /**
     * Fetches the inventory data from the backend and updates the state.
     * @async
     * @function
     */
    const fetchData = async () => {
      try {
        const data = await executeGet(`inventory`, {}, "GET");
        setInventoryItems(data);
      } catch (error) {
        console.error("Failed to fetch inventory data.", error);
      }
    };
    fetchData();
  }, []);

  /**
   * Fetches usage data for the selected item within the specified date range and updates the chart data state.
   * @async
   * @function
   * @param {string} name - The name of the inventory item.
   * @param {Date} startDate - The start date of the usage data range.
   * @param {Date} endDate - The end date of the usage data range.
   */
  const fetchItemUsageData = async (name, startDate, endDate) => {
    if (!startDate || !endDate || startDate > endDate) {
      alert("Second date must be after or the same as the first date");
      return;
    }

    try {
      const data = await executeGet(
        `itemusage?name=${name}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          name,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }
      );

      const chartLabels = data.map((item) => item.usage_date.split("T")[0]);
      const chartValues = data.map((item) => item.total_usage);

      console.log("Labels: ", chartLabels);
      console.log("Values: ", chartData);

      setChartData({
        labels: chartLabels,
        datasets: [
          {
            label: `${formatName(name)}Usage (${selectedItem.unit})`,
            data: chartValues,
            backgroundColor: "rgba(239, 68, 68, 0.6)",
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching usage data", error);
    }
  };

  /**
   * Handles the selection of an inventory item from the dropdown menu.
   * @function
   * @param {Object} event - The event object from the dropdown selection.
   */
  const handleItemSelect = (event) => {
    const selectedName = event.target.value;
    const selected = inventoryItems.find((item) => item.name === selectedName);
    setSelectedItem(selected);
    setUnit(selected?.unit);
    console.log("Selected Item:", selected);
  };

  /**
   * Generates the chart for the selected item and date range by fetching data.
   * @function
   */
  const handleGenerateChart = () => {
    if (selectedItem && startDate && endDate) {
      fetchItemUsageData(selectedItem.name, startDate, endDate);
    } else {
      alert("Select an item and start/end dates.");
    }
  };

  /**
   * Formats a name by replacing underscores with spaces and capitalizing each word.
   * @function
   * @param {string} name - The name to format.
   * @returns {string} - The formatted name.
   */
  const formatName = (name) => {
    var str = name.replaceAll("_", " ");
    var out = "";
    var list = str.split(" ");
    for (var word of list) {
      out += String(word).charAt(0).toUpperCase() + String(word).slice(1) + " ";
    }
    return out;
  };

  return (
    <div className="max-w-screen-lg mx-auto">
      <form className="max-w-sm mx-auto">
        <label
          form="item"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Select an inventory item
        </label>
        <select
          value={selectedItem?.name || ""}
          onChange={handleItemSelect}
          className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          <option
            className="bg-gray-50 text-xs text-gray-700"
            value=""
            disabled
          >
            ~Inventory item~
          </option>
          {inventoryItems.map((item) => (
            <option
              className="bg-gray-50 text-xs text-gray-700"
              value={item.name}
              key={item.name}
            >
              {formatName(item.name)} ({item.unit})
            </option>
          ))}
        </select>
      </form>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          {selectedItem ? (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  Inventory usage for{" "}
                  <span className="text-red-500">
                    {formatName(selectedItem.name)}
                  </span>{" "}
                  ({selectedItem.unit})
                </h3>
                <button
                  className="mt-4 ml-2 px-4 py-4 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 active:bg-red-700"
                  onClick={handleGenerateChart}
                >
                  Generate Chart
                </button>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <h3 className="text-lg font-medium">Start Date</h3>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(dateFormatter(date))}
                    isClearable
                    inline
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium">End Date</h3>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(dateFormatter(date, true))}
                    minDate={startDate}
                    isClearable
                    inline
                  />
                </div>
              </div>
            </div>
          ) : (
            <h3 className="text-xl font-bold mt-6">
              Please select an inventory item.
            </h3>
          )}
        </div>
        <div className="w-full md:w-1/2 p-2 h-[45vh] mt-4 border rounded-md border-gray-300">
          {chartData && (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    labels: {
                      font: {
                        size: 16,
                        weight: "bold",
                        family: "Arial, sans-serif",
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Date",
                      font: {
                        size: 12,
                        weight: "bold",
                        family: "Arial, sans-serif",
                      },
                    },
                    ticks: {
                      font: {
                        size: 12,
                      },
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: `${selectedUnit}`,
                      font: {
                        size: 12,
                        weight: "bold",
                        family: "Arial, sans-serif",
                      },
                    },
                    ticks: {
                      font: {
                        size: 12,
                      },
                    },
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageChart;
