// item component: has ID, name, price and type

import React from "react";

/**
 * Item component that displays a product with its details and an add button
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Callback function triggered when add button is clicked
 * @param {Object} props.item - Product item data
 * @param {string} props.item.name - Name of the item
 * @param {number} props.item.price - Price of the item
 * @returns {JSX.Element} A card-style item display with add button
 */
export const Item = ({ onClick, item }) => {
  // squared display that highlights the border when selected
  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium">{item.name}</h3>
          <p className="text-sm text-gray-700">{item.price}</p>
        </div>
        <button className="px-3 py-1 bg-red-500 text-white rounded-md" onClick={() => onClick(item)}>
          Add
        </button>
      </div>
    </div>
  );
};
