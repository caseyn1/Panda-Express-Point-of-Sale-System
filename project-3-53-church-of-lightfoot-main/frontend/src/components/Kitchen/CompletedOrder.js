import React from "react";
/**
 * CompletedOrder Component
 *
 * Displays details of a completed order including the time it was completed, order ID, and grouped items
 *
 * @param {Object} props component properties
 * @param {string} props.completedTime the time the order was completed
 * @param {number} props.orderId unique identifier for the order
 * @param {Array} props.items list of items in the completed order
 *  {string} name name of the item
 *  {string} itemgroup group the item belongs to
 *  {number} quantity quantity of the item
 *
 * @returns {JSX.Element} a box showing the completed order details grouped by item group and quantities displayed per group
 * @author Casey Nance
 */

function CompletedOrder({ completedTime, orderId, items }) {
  const actualTime = new Date(completedTime);
  actualTime.setHours(actualTime.getHours());
  const formattedTime = actualTime.toISOString().split("T")[1].substring(0, 8);
  

  const groupedItems = items.reduce((groups, item) => {
    if (!groups[item.itemgroup]) {
      groups[item.itemgroup] = [];
    }
    groups[item.itemgroup].push(item);
    return groups;
  }, {});

  return (
    <div className="box-border w-72 p-4 border rounded-lg text-black shadow-lg flex flex-col justify-start min-h-40 max-h-full h-auto bg-gray-200 border-gray-300">
      <div className="flex justify-between text-lg text-gray-600 mb-4">
        <span>
          Completed: <span className="whitespace-nowrap">{formattedTime}</span>
        </span>
        <span>Order #{orderId}</span>
      </div>

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
    </div>
  );
}

export default CompletedOrder;
