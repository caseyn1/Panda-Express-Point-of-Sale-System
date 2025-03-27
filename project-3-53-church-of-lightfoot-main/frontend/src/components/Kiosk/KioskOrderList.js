

import React, { useState, useEffect } from "react";
import KioskOrder from "./KioskOrder";
import { executeGet, executeDelete } from "../../util/Requests";
/**
 * KioskOrder Component
 *
 * Displays a single order with details such as time elapsed since the order was placed, the order ID, items, and a button to mark it as complete
 *
 * @param {Object} props component properties
 * @param {string} props.timeSinceOrder time elapsed since the order was placed
 * @param {number} props.orderId unique identifier for the order
 * @param {Array} props.items list of items in the order
 *  {string} name item name
 *  {string} itemgroup group the item belongs to
 *  {number} quantity item quantity
 * @param {function} props.onComplete callback triggered when the "Complete" button is clicked passing the orderId
 *
 * @returns {JSX.Element} a styled box displaying the order with a "Complete" button
 * @author Casey Nance
 */

function KioskOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await executeGet("kioskorders");
        console.log("Fetched orders:", data); // Debugging log
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleComplete = async (orderId) => {
    try {
      await executeDelete(`kioskorders/${orderId}`);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.order_id !== orderId)
      );
      console.log(`Order ${orderId} completed and deleted.`);
    } catch (error) {
      console.error(`Error deleting order ${orderId}:`, error);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (orders.length === 0) {
    return (
      <div className="flex justify-center">
        <div className="text-9xl font-bold text-gray-500">No Current Orders</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-5 gap-4">
        {orders.map((order) => (
          <KioskOrder
            key={order.order_id}
            timeSinceOrder={order.order_created}
            orderId={order.order_id}
            items={order.items}
            onComplete={handleComplete}
          />
        ))}
      </div>
    </div>
  );
}

export default KioskOrderList;
