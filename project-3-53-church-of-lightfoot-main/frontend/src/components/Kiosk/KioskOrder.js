import React from "react";
/**
 * KioskOrder Component
 *
 * Displays an order with details such as time elapsed items and a Complete button
 * 
 * @param {Object} props component properties
 * @param {string} props.timeSinceOrder time elapsed since the order was placed
 * @param {number} props.orderId unique order identifier
 * @param {Array} props.items list of items in the order
 *  {string} name item name
 *  {string} itemgroup item group
 *  {number} quantity item quantity
 * @param {function} props.onComplete callback triggered when the Complete button is clicked passing orderId
 *
 * @returns {JSX.Element} a box displaying the order with a Complete button
 * @author Casey Nance
 */

function KioskOrder({ timeSinceOrder, orderId, items, onComplete }) {
  const timeSince = Math.floor((new Date() - new Date(timeSinceOrder)) / 60000);

  // Determine background color and alert status based on timeSince
  const isOverdue = timeSince >= 5;
  const backgroundColorClass = isOverdue
    ? "bg-red-100 border-red-500"
    : "bg-gray-200 border-gray-300";

  const groupedItems = items.reduce((groups, item) => {
    if (!groups[item.itemgroup]) {
      groups[item.itemgroup] = [];
    }
    groups[item.itemgroup].push(item);
    return groups;
  }, {});

  return (
    <div
      className={`box-border w-72 p-4 border rounded-lg text-black shadow-lg flex flex-col justify-start min-h-40 max-h-full h-auto ${backgroundColorClass}`}
    >
      {/* Header Section */}
      <div className="flex justify-between text-lg text-gray-600 mb-4">
        <span>{timeSince} mins ago</span>
        <span>Order #{orderId}</span>
      </div>

      {/* Overdue Alert */}
      {isOverdue && (
        <div className="bg-red-500 text-white text-center p-2 mb-4 rounded-lg animate-pulse">
          <strong>⚠️ Alert:</strong> Order is overdue!
        </div>
      )}

      {/* Items Section */}
      <div className="text-left text-lg flex-grow">
        <ul>
          {Object.entries(groupedItems).map(([group, groupItems]) => (
            <li key={group} className="mb-2">
              {groupItems[0].name} (x{groupItems[0].quantity})
              <ul className="pl-4 list-disc list-inside">
                {groupItems.map((item, index) => (
                  <li key={index}>{item.name}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Section */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-lg text-gray-500">...</span>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          onClick={() => onComplete(orderId)} // Call onComplete with the orderId
        >
          Complete
        </button>
      </div>
    </div>
  );
}

export default KioskOrder;
