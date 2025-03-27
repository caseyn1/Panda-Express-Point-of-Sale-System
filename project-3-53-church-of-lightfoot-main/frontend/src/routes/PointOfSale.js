import React, { useEffect, useState } from "react";
import { Tab, Tabs } from "../components/POS/Tabs";
import { executeGet, executePost } from "../util/Requests";
import { CompletedView } from "./CompletedView";
import CompletedOrderList from "../components/Kitchen/CompletedOrderList";
import CompletedOrder from "../components/Kitchen/CompletedOrder";

// Keypad Component
const Keypad = ({ onButtonClick }) => {
  const buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "Enter"];

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {buttons.map((button) => (
        <button key={button} className="bg-gray-200 p-4 rounded shadow hover:bg-gray-300" onClick={() => onButtonClick(button)}>
          {button}
        </button>
      ))}
    </div>
  );
};

export const PointOfSale = () => {
  const tabs = ["MEAL", "SIDE", "ENTREE", "APPETIZER", "DRINK", "LACARTE", "SPECIAL"];
  const [menu_items, set_menu_items] = useState([]);
  const [current_order, set_current_order] = useState([]); // Changed to an array for multiple orders
  const [all_orders, set_all_orders] = useState([]); // State to hold all completed orders
  const [total, setTotal] = useState(0);
  const [current_tab, set_current_tab] = useState("MEAL");
  const [employee_id, set_employee_id] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  /**
   * Generates an empty order structure based on the available tabs.
   * @returns {Object} An object representing an empty order with keys for each tab.
   */
  const generate_empty_order = () => {
    const empty_order = {};
    tabs.forEach((tab) => {
      empty_order[tab] = [];
    });
    return empty_order;
  };

  /**
   * Fetches menu items from the API and updates the state.
   * @returns {Promise<void>} A promise that resolves when the fetch is complete.
   */
  const fetchMenuItems = async () => {
    try {
      const data = await executeGet("items", {}, "GET");
      set_menu_items(data); // Set fetched data directly
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  /**
   * Adds an item to the current order, applying restrictions based on meal type.
   * @param {Object} item - The menu item to add to the order.
   */
  const add_item_to_order = (item) => {
    console.log(item);
    // Define restrictions based on meal type
    const restrictions = {
      Bowl: { sides: 1, entrees: 1 },
      Plate: { sides: 1, entrees: 2 },
      "Bigger Plate": { sides: 1, entrees: 3 },
    };

    // Check current order for restrictions
    const currentMealType = current_order.find((orderItem) => orderItem.item_type === "MEAL");

    if (currentMealType) {
      const mealType = currentMealType.name; // Get the name of the selected meal

      // Check restrictions based on the selected meal type
      if (mealType in restrictions) {
        const { sides, entrees } = restrictions[mealType];

        // Count current sides and entrees
        const currentSides = current_order.filter((item) => item.item_type === "SIDE").length;
        const currentEntrees = current_order.filter((item) => item.item_type === "ENTREE").length;

        // Validate adding sides
        if (item.item_type === "SIDE" && currentSides >= sides) {
          alert(`You can only add ${sides} side(s) for a ${mealType}.`);
          return;
        }

        // Validate adding entrees
        if (item.item_type === "ENTREE" && currentEntrees >= entrees) {
          alert(`You can only add ${entrees} entree(s) for a ${mealType}.`);
          return;
        }
      }
    }

    // If the item is a meal and current_order is empty, create a new order
    if (item.item_type === "MEAL" && current_order.length === 0) {
      set_current_order([{ ...item, count: 1, id: Date.now() }]); // Start a new order
    } else {
      // If a new meal is selected, append the current order to all_orders
      if (item.item_type === "MEAL" && current_order.length > 0) {
        set_all_orders((prevOrders) => [...prevOrders, current_order]);
        set_current_order([{ ...item, count: 1, id: Date.now() }]); // Start a new order
      } else {
        // Append item to the current order
        set_current_order((prevOrder) => [...prevOrder, { ...item, count: 1, id: Date.now() }]);
      }
    }

    // Update total
    setTotal((prevTotal) => prevTotal + parseFloat(item.price));

    // Check if the limit has been reached and switch tabs
    if (currentMealType) {
      const mealType = currentMealType.name;
      const { sides, entrees } = restrictions[mealType];

      // Count current sides and entrees
      const currentSides = current_order.filter((item) => item.item_type === "SIDE").length;
      const currentEntrees = current_order.filter((item) => item.item_type === "ENTREE").length;

      // Switch to the next tab if limits are reached
      if (item.item_type === "SIDE" && currentSides + 1 > sides) {
        // +1 because we are adding a new item
        const nextTabIndex = tabs.indexOf(current_tab) + 1;
        if (nextTabIndex < tabs.length) {
          set_current_tab(tabs[nextTabIndex]); // Switch to the next tab
        }
      } else if (item.item_type === "ENTREE" && currentEntrees + 1 > entrees) {
        // +1 because we are adding a new item
        const nextTabIndex = tabs.indexOf(current_tab) + 1;
        if (nextTabIndex < tabs.length) {
          set_current_tab(tabs[nextTabIndex]); // Switch to the next tab
        }
      }
    }
  };

  /**
   * Removes an item from the current order by its ID.
   * @param {Object} itemToRemove - The item to remove from the order.
   */
  const remove_item_from_order = (itemToRemove) => {
    set_current_order((prevOrder) => {
      const updatedOrder = prevOrder.filter((item) => item.id !== itemToRemove.id); // Remove the item by ID

      // Update total after removing the item
      const removedTotal = parseFloat(itemToRemove.price); // Get the price of the removed item
      setTotal((prevTotal) => prevTotal - removedTotal); // Update total

      return updatedOrder;
    });
  };

  /**
   * Removes an item from all previous orders by its ID.
   * @param {Object} itemToRemove - The item to remove from all orders.
   */
  const remove_item_from_all_orders = (itemToRemove) => {
    set_all_orders((prevOrders) => {
      // Filter out the item from all orders
      const updatedOrders = prevOrders.flat().filter((item) => item.id !== itemToRemove.id);

      // Return the updated orders as a nested array
      const newOrders = [];
      for (let i = 0; i < updatedOrders.length; i++) {
        const item = updatedOrders[i];
        const orderIndex = Math.floor(i / 10); // Assuming 10 items per order for example
        if (!newOrders[orderIndex]) {
          newOrders[orderIndex] = [];
        }
        newOrders[orderIndex].push(item);
      }

      return newOrders;
    });
  };

  /**
   * Initiates the checkout process, merging current and previous orders and sending them to the API.
   * @returns {Promise<void>} A promise that resolves when the checkout is complete.
   */
  const checkout = async () => {
    console.log("Checkout initiated"); // Debugging
    const all_employees = await executeGet("employees", {}, "GET");
    const valid_employee = all_employees.some((employee) => parseInt(employee.employee_id) == parseInt(employee_id));

    if (!valid_employee) {
      alert("Invalid employee ID");
      return;
    }

    try {
      if (current_order.length === 0 && all_orders.length === 0) {
        alert("No items in the current order.");
        return;
      }

      // Initialize merged order using generate_empty_order
      const mergedOrder = generate_empty_order();

      // Add current order to merged order
      current_order.forEach((item) => {
        mergedOrder[item.item_type].push({
          menu_item_id: item.menu_item_id,
          name: item.name,
          item_type: item.item_type,
          price: item.price,
        });
      });

      // Add all previous orders to merged order
      all_orders.flat().forEach((item) => {
        mergedOrder[item.item_type].push({
          menu_item_id: item.menu_item_id,
          name: item.name,
          item_type: item.item_type,
          price: item.price,
        });
      });

      console.log("Merged Order:", mergedOrder); // Debugging

      await executePost("items", {
        order: mergedOrder,
        total,
        employee_id,
      });

      alert("ORDER SENT");
      set_current_order([]); // Reset current order
      set_all_orders([]); // Reset all orders
      setTotal(0);
      set_current_tab("MEAL");
      set_employee_id(0);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Displays the current order items.
   * @returns {JSX.Element} A JSX element representing the current order.
   */
  const displayCurrentOrder = () => {
    if (current_order.length === 0) {
      return <div>No items in the current order.</div>; // Message if current order is empty
    }

    return current_order.map((item, idx) => (
      <div key={item.id} className="flex justify-between items-center">
        <span>{item.name}</span>
        <span>${item.price}</span>
        <button onClick={() => remove_item_from_order(item)} className="text-red-500 ml-4">
          Remove
        </button>
      </div>
    ));
  };

  /**
   * Displays all previous orders.
   * @returns {JSX.Element} A JSX element representing all previous orders.
   */
  const displayAllOrders = () => {
    if (all_orders.length === 0) {
      return <div>No previous orders.</div>; // Message if no previous orders
    }

    return all_orders.flat().map((item, idx) => (
      <div key={item.id} className="flex justify-between items-center">
        <span>{item.name}</span>
        <span>${item.price}</span>
        <button onClick={() => remove_item_from_all_orders(item)} className="text-red-500 ml-4">
          Remove
        </button>
      </div>
    ));
  };

  /**
   * Toggles the visibility of the popup for completed orders.
   */
  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleKeypadButtonClick = (value) => {
    if (value === "C") {
      set_employee_id(0); // Clear the input
    } else if (value === "Enter") {
      checkout(); // Trigger checkout on Enter
    } else {
      set_employee_id((prev) => prev.toString() + value); // Append the clicked number
    }
  };

  // Fetch menu items on initial render
  useEffect(() => {
    fetchMenuItems();
    return () => set_menu_items([]); // Cleanup function
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Render the popup component */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-5xl w-full" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            {/* Close Button */}
            <button onClick={togglePopup} className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition">
              ✕
            </button>

            {/* Title */}
            <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Completed Orders</h2>

            {/* Scrollable Content */}
            <div className="overflow-y-auto" style={{ maxHeight: "65vh" }}>
              <CompletedOrderList />
            </div>
          </div>
        </div>
      )}
      <div className="w-1/4 bg-white shadow-lg p-4">
        {/* Display current order */}
        <div className="mb-4">
          <h2 className="font-bold">Current Order</h2>
          {displayCurrentOrder()}
        </div>

        {/* Display all completed orders */}
        <div className="mb-4">
          <h2 className="font-bold">Previous Orders</h2>
          {displayAllOrders()}
        </div>

        <div className="absolute bottom-0 left-0 w-1/4 bg-white p-4 border-t">
          <div className="flex justify-between mb-4">
            <span>Total:</span>
            <span className="text-red-500 font-bold">${total}</span>
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="number"
              className="w-full border rounded p-2"
              placeholder="Employee ID"
              value={employee_id}
              onChange={(e) => set_employee_id(e.target.value)}
            />
            <Keypad onButtonClick={handleKeypadButtonClick} />
            <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600" onClick={checkout}>
              Checkout
            </button>
          </div>
        </div>

        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600" onClick={togglePopup}>
          See Completed Orders
        </button>
      </div>

      {/* Right Side - Menu Items */}
      <div className="flex-1 p-4 w-full">
        <Tabs active={current_tab}>
          {tabs.map((tab) => (
            <Tab label={tab} key={tab}>
              <div className="grid grid-cols-3 gap-6 p-4">
                {menu_items
                  .filter((item) => item.item_type === tab)
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => add_item_to_order(item)}
                      className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow w-full"
                    >
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-red-500">${item.price}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
