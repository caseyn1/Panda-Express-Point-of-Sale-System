import React, { useState, useEffect } from "react";
import CompletedOrder from "./CompletedOrder";
import { executeGet } from "../../util/Requests";
/**
 * CompletedOrderList Component
 *
 * Displays a list of completed orders with options for searching by order ID and using a virtual keyboard for input.
 *
 * @returns {JSX.Element} A list of completed orders, a search bar, and a virtual keyboard for input or a message if no orders are available today.
 */
function CompletedOrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await executeGet("completedorders");
      setOrders(data);

      if (searchQuery === "") {
        setFilteredOrders(data);
      } else {
        setFilteredOrders(
          data.filter((order) =>
            order.order_id.toString().includes(searchQuery.trim())
          )
        );
      }
    } catch (error) {
      console.error("Error fetching completed orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, [searchQuery]);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    setFilteredOrders(
      orders.filter((order) =>
        order.order_id.toString().includes(query.trim())
      )
    );
  };

  const handleKeyboardInput = (char) => {
    const newQuery = searchQuery + char;
    setSearchQuery(newQuery);

    setFilteredOrders(
      orders.filter((order) =>
        order.order_id.toString().includes(newQuery.trim())
      )
    );
  };

  const handleKeyboardBackspace = () => {
    const newQuery = searchQuery.slice(0, -1);
    setSearchQuery(newQuery);

    setFilteredOrders(
      orders.filter((order) =>
        order.order_id.toString().includes(newQuery.trim())
      )
    );
  };

  const handleSearchFocus = () => {
    setShowKeyboard(true);
  };

  const handleOutsideClick = (event) => {
    if (
      !event.target.closest(".keyboard") &&
      !event.target.closest(".search-bar")
    ) {
      setShowKeyboard(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center mt-8">
      {/* Search Bar */}
      <div className="flex justify-end w-full max-w-screen-lg mb-4">
        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchQuery}
          onFocus={handleSearchFocus}
          onChange={handleSearch}
          className="search-bar border border-gray-300 rounded-lg p-3 w-1/3 shadow-md focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Virtual Keyboard */}
      {showKeyboard && (
        <div className="keyboard fixed bottom-0 w-full bg-gray-100 p-6 shadow-xl">
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {[..."123456789", "0"].map((char) => (
              <button
                key={char}
                className="bg-blue-500 text-white rounded-lg p-4 hover:bg-blue-600 text-lg font-bold shadow"
                onClick={() => handleKeyboardInput(char)}
              >
                {char}
              </button>
            ))}
            <button
              className="bg-red-500 text-white rounded-lg p-4 col-span-3 hover:bg-red-600 text-lg font-bold shadow"
              onClick={handleKeyboardBackspace}
            >
              Backspace
            </button>
          </div>
        </div>
      )}

      {/* Display No Orders */}
      {filteredOrders.length === 0 ? (
        <div className="text-2xl font-bold text-gray-500 mt-8">
          No Completed Orders today.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {filteredOrders.map((order) => (
            <CompletedOrder
              key={order.order_id}
              completedTime={order.completed_at}
              orderId={order.order_id}
              items={order.items}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CompletedOrderList;
