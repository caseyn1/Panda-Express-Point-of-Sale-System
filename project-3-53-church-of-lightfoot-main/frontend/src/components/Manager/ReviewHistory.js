/**
 * @file ReviewHistory.js
 * @description Component to display and manage review history, including averages and filtering by date range.
 */

import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import { executeGet } from "../../util/Requests";
import "react-datepicker/dist/react-datepicker.css";

/**
 * ReviewHistory Component
 * @component
 * @description Main component for managing and displaying review averages with options to filter by date range.
 */
const ReviewHistory = () => {
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
  const [reviews, setReviews] = useState([]);
  const [averageReview, setAverageReview] = useState(0);

  /**
   * Fetches reviews based on the selected date range and calculates the average review.
   * @async
   * @function
   */
  const fetchData = useCallback(async () => {
    if (startDate && endDate) {
      const adjustedStartDate = new Date(startDate);
      const adjustedEndDate = new Date(endDate);

      try {
        const data = await executeGet(
          `reviews?startDate=${adjustedStartDate.toISOString()}&endDate=${adjustedEndDate.toISOString()}`,
          {},
          "GET"
        );

        setReviews(data);

        // Calculate the average review (exclude 0 ratings)
        const validReviews = data.filter(
          (order) => order.review > 0 && order.review !== null
        );

        const totalReviews = validReviews.reduce(
          (sum, order) => sum + order.review,
          0
        );
        const average =
          validReviews.length > 0
            ? (totalReviews / validReviews.length).toFixed(2)
            : 0;

        setAverageReview(average);
      } catch (error) {
        console.error("Error fetching review data:", error);
        setReviews([]);
        setAverageReview(0);
      }
    } else {
      setReviews([]);
      setAverageReview(0);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Provides a descriptive message for the table based on date selection.
   * @function
   * @param {Date} startDate - The selected start date.
   * @param {Date} endDate - The selected end date.
   * @returns {string} - The descriptive message.
   */
  const tableStatement = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return "Select start and end dates to show reviews in that date range.";
    } else if (startDate > endDate) {
      return "The start date cannot come after the end date.";
    } else {
      return "No data available for the selected date range.";
    }
  };

  const buttonStyle =
    "bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 active:bg-red-700 disabled:bg-gray-400 disabled:text-gray-600";

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
                Review
              </th>
              <th className="px-[20px] p-2 border-t border-b border-l border-r text-center">
                Timestamp
              </th>
            </tr>
          </thead>
          {reviews.length > 0 ? (
            <tbody>
              {reviews
                .filter((order) => order.review > 0 && order.review !== null) // Remove rows with review <= 0 or null
                .map((order) => (
                  <tr key={order.order_id}>
                    <td className="p-2 border-b border-l text-center">
                      {order.order_id}
                    </td>
                    <td className="p-2 border-b border-l text-center">
                      {order.review}
                    </td>
                    <td className="p-2 border-b border-l border-r text-center">
                      {new Date(order.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <th colSpan="3" className="sticky">
                  {tableStatement(startDate, endDate)}
                </th>
              </tr>
            </tbody>
          )}
        </table>
      </div>

      <div className="grid h-[20px]">
        <div className="px-5 py-2 border-t border-gray-300">
          <h3 className="text-xl font-medium">
            Average Review: {averageReview || "N/A"}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default ReviewHistory;

