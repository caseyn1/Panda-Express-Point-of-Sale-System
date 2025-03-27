/**
 * SlidingAlert Component
 *
 * @description Displays a rotating alert system for low-stock items. Each alert slides in and out smoothly to notify the user about items with low stock.
 *              If there are no low-stock items, a static message indicating sufficient stock is displayed.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.lowStockItems - An array of objects representing items with low stock. Each object should have the following properties:
 *    - {string} name: The name of the item (orange_chicken).
 *
 * @returns {JSX.Element} Alert box that displays low-stock notifications or a message indicating sufficient stock.
 */

import React, { useState, useEffect } from "react";

function SlidingAlert({ lowStockItems }) {
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks the current item being displayed.
  const [isAnimating, setIsAnimating] = useState(false); // Controls slide animation state.

  /**
   * Helper function to format item names.
   *
   * @param {string} name - The raw item name (orange_chicken).
   * @returns {string} The formatted name with words capitalized and underscores replaced with spaces (Orange Chicken).
   */
  const formatName = (name) =>
    name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  /**
   * Sets up an interval to cycle through low-stock alerts.
   * Slides out the current alert and slides in the next one every 5 seconds.
   */
  useEffect(() => {
    if (lowStockItems.length > 1) {
      const interval = setInterval(() => {
        setIsAnimating(true);

        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % lowStockItems.length);
          setIsAnimating(false);
        }, 500); // Animation duration
      }, 5000); // Interval between alerts

      return () => clearInterval(interval);
    }
  }, [lowStockItems]);

  // Handle the case where there are no low-stock items
  if (!lowStockItems.length) {
    return (
      <div className="h-12 w-64 flex items-center justify-center text-green-600 text-lg font-semibold">
        ✅ All stocks are sufficient
      </div>
    );
  }

  // Prepare the current and next alerts
  const currentAlert = formatName(lowStockItems[currentIndex]?.name || "");
  const nextAlert =
    formatName(lowStockItems[(currentIndex + 1) % lowStockItems.length]?.name);

  return (
    <div className="relative h-12 w-64 overflow-hidden">
      {/* Current Alert */}
      <div
        className={`absolute top-0 left-0 w-full h-full flex items-center justify-center text-red-500 text-lg font-semibold transition-transform duration-500 ${
          isAnimating ? "translate-y-full" : "translate-y-0"
        }`}
      >
        ⚠ {currentAlert} Stock Low
      </div>

      {/* Next Alert */}
      <div
        className={`absolute -top-full left-0 w-full h-full flex items-center justify-center text-red-500 text-lg font-semibold transition-transform duration-500 ${
          isAnimating ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        ⚠ {nextAlert} Stock Low
      </div>
    </div>
  );
};

export default SlidingAlert;