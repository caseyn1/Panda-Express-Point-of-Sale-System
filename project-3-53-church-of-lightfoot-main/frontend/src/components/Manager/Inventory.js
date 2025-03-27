/**
 * Inventory Component
 *
 * @description Displays a table of inventory data with stock levels and restock warnings. 
 *              Includes functionality to generate a restock report and show progress bars for stock levels.
 *
 * @returns {JSX.Element} A full inventory management table with dynamic progress bars and a restock report modal.
 */

import React, { useEffect, useState } from 'react';
import { executeGet,executePost } from "../../util/Requests";
import SlidingAlert from "../SlidingAlert";

const Inventory = () => {
  const [inventoryData, setInventoryData] = useState([]);

  const [showRestockReport, setShowRestockReport] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await executeGet(`inventory`, {}, "GET");
        setInventoryData(data);
      } catch (error) {
        console.error("Failed to fetch inventory data.", error);
      }
    };
    fetchData();
  }, []);

  /**
   * Formats a given name string by capitalizing each word and replacing underscores with spaces.
   *
   * @param {string} name - The raw name to be formatted (orange_chicken).
   * @returns {string} The formatted name (Orange Chicken).
   */
  const formatName = (name) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /**
   * Determines the progress bar color based on the stock percentage.
   *
   * @param {number} percentage - The percentage of stock level.
   * @returns {string} A CSS class for the progress bar color.
   */
  const getProgressColor = (percentage) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  // Toggles the restock report modal
  const handleRestockReport = () => {
    setShowRestockReport(true);
  };
  const handleRestock = async () => {
    try {
      // Call the executePost utility to trigger the restock endpoint
      const response = await executePost("inventory/restock", {});
  
      if (response === 200) {
        alert("Restock successful! Inventory updated to maximum thresholds.");
  
        // Fetch the updated inventory data
        const updatedData = await executeGet("inventory");
        setInventoryData(updatedData);
      } else {
        alert("Restock failed. Please check the server.");
      }
    } catch (error) {
      console.error("Error during restocking:", error.message);
      alert("An unexpected error occurred during restocking.");
    }
  };
  
  // Closes the restock report modal
  const closeRestockReport = () => {
    setShowRestockReport(false);
  };

  // Filters items needing restock based on their quantity being below the minimum threshold
  const restockItems = inventoryData.filter(
    (item) => item.quantity_stock < item.min_threshold
  );

  return (
    <div className="relative">
      {/* Alert and Button Row */}
      <div className="flex items-center justify-between mb-0 -mt-4">
        {/* Sliding alerts for low stock items */}
        <SlidingAlert lowStockItems={restockItems} />
        {/* Button to generate the restock report */}
        <div className="flex items-center space-x-4">
        <button
          onClick={handleRestockReport}
          className="bg-red-500 text-white font-bold px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Generate Restock Report
        </button>
        <button
      onClick={handleRestock} // Replace with your restock functionality
      className="bg-blue-500 text-white font-bold px-4 py-2 rounded hover:bg-blue-600 transition"
    >
      Restock
    </button>
    </div>
      </div>

      {/* Inventory Table */}
      <div className="p-2 relative h-[75vh] overflow-y-auto rounded-md border border-gray-300">
        <table className="w-full h-[85vh] border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Ingredient ID</th>
              <th className="border border-gray-300 p-2">Name</th>
              <th className="border border-gray-300 p-2">Min Threshold</th>
              <th className="border border-gray-300 p-2">Quantity in Stock</th>
              <th className="border border-gray-300 p-2">Max Threshold</th>
              <th className="border border-gray-300 p-2">Unit</th>
              <th className="border border-gray-300 p-2">Stock Level</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.length > 0 ? (
              inventoryData.map((item, index) => {
                const stockPercentage = item.max_threshold
                  ? (item.quantity_stock / item.max_threshold) * 100
                  : 0;
                const progressColor = getProgressColor(stockPercentage);
                return (
                  <tr key={item.ingredient_id || index}>
                    <td className="border border-gray-300 p-2">
                      {item.ingredient_id || `unknown-${index}`}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {formatName(item.name)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {Math.round(item.min_threshold)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {Math.round(item.quantity_stock)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {Math.round(item.max_threshold)}
                    </td>
                    <td className="border border-gray-300 p-2">{item.unit}</td>
                    <td className="border border-gray-300 p-2">
                      <div className="relative w-full h-4 bg-gray-300 rounded">
                        <div
                          className={`absolute left-0 top-0 h-full ${progressColor} rounded`}
                          style={{ width: `${stockPercentage}%` }}
                        ></div>
                        <span className="absolute left-1/2 transform -translate-x-1/2 text-xs font-bold text-black">
                          {stockPercentage.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="border border-gray-300 p-2 text-center"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Restock Report Modal */}
      {showRestockReport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-2xl w-4/5">
            <button
              onClick={closeRestockReport}
              className="absolute top-5 right-7 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4">Restock Report</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Ingredient ID</th>
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Min Threshold</th>
                  <th className="border border-gray-300 p-2">Quantity in Stock</th>
                  <th className="border border-gray-300 p-2">Restock Amount</th>
                  <th className="border border-gray-300 p-2">Unit</th>
                  <th className="border border-gray-300 p-2">Estimated Price</th>
                </tr>
              </thead>
              <tbody>
                {restockItems.length > 0 ? (
                  restockItems.map((item, index) => (
                    <tr key={item.ingredient_id || index}>
                      <td className="border border-gray-300 p-2">
                        {item.ingredient_id}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {formatName(item.name)}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {Math.round(item.min_threshold)}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {Math.round(item.quantity_stock)}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {Math.round(item.restock_quantity)}
                      </td>
                      <td className="border border-gray-300 p-2">{item.unit}</td>
                      <td className="border border-gray-300 p-2">
                        ${item.current_price
                          ? (item.current_price * item.restock_quantity).toFixed(2)
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="border border-gray-300 p-2 text-center"
                    >
                      No items below minimum threshold
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;