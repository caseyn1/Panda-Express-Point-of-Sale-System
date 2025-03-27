import React, { useEffect, useState, useCallback } from 'react';
import { executeGet, executePost, executePut} from '../../util/Requests.js';
import {KioskTabs, KioskTab} from '../../components/Kiosk/KioskTabs.js';
import {KioskItemCard, KioskMealCard} from '../../components/Kiosk/KioskItemCard.js';
import { KioskModal, AddItemMenu, LaCarteMenu} from '../../components/Kiosk/KioskModal.js';
import {Logo} from '../../components/Kiosk/Logo.js';
import { KioskCheckout } from '../../components/Kiosk/KioskCheckout.js';
import AddItemPopup from "../../components/Kiosk/AddItemPopup.js";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import LanguageSelector from "../../components/LanguageSelector";
import { useNavigate } from "react-router-dom";

/**
 * Kiosk order screen route 
 * @param {Object} props - React props.
 * @returns {React.JSX.Element} A React component.
 */
export const KioskOrder = () => {
  //STYLE SECTION
  const backgroundStyle = {
    height: "100vh",
    width: "100vw", 
    boxSizing: "border-box",
    fontFamily: "sans-serif", //Font controller
  };

  const orderComponents = ["MEAL", "SIDE", "ENTREE", "APPETIZER", "DRINK", "LACARTE", "CARTEITEMS", "REWARD"];
  const [menu_items, set_menu_items] = useState([]);
  const [current_tab, set_current_tab] = useState("Build Your Meal");
  const [total, setTotal] = useState(0.0);
  const [modalStatus, set_modal_status] = useState(false);
  const [addMultipleItemStatus, setAddMultipleItemStaus] = useState(false);
  const [checkoutStatus, setCheckout] = useState(false);
  const [carteMenuStatus, setCarteMenuStatus] = useState(false);
  const [itemToAdd, setItemToAdd] = useState("");
  const [numComponetsPerMeal, setNumComponets] = useState(0);
  const [rating, setRating] = useState(0); // User's submitted rating
  const [numItemsInOrder, setNumItemsInOrder] = useState(0);
  const [addItemAnimate, setAddItemAnimate] = useState(false);
  const [addItemStatus, setAddItemStatus] = useState(false);
  const [dynamicItems, setDynamicItems] = useState([]); // Items dynamically suggested during checkout
  const [triggeredFromAddItem, setTriggeredFromAddItem] = useState(false); // Tracks if the checkout modal was opened by AddItemPopup, goes straight to ckecout afterwards if so
  const [noItemsMessage, setNoItemsMessage] = useState(false);
  const [nextOrderNum, setNextOrderNum] = useState(0); 
  const [loading, setLoading] = useState(false); // For spinner
  const [showCheckmark, setShowCheckmark] = useState(false); // For checkmark
  const [growModal, setGrowModal] = useState(false); // For modal growth
  const [showText, setShowText] = useState(false); // For final text
  const [loginStatus, setLoginStatus] = useState(false);
  const [email, setEmail] = useState(""); // Tracks email input
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showAccountCreated, setShowAccountCreated] = useState(false);
  const [userPoints, setUserPoints] = useState(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false); // Login-specific loading
  const [remainingPoints, setRemainingPoints] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const navigate = useNavigate();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  const kioskTabs = ["Build Your Meal", "Appetizers", "Drinks", "La Carte", ...(userPoints !== null ? ["My Rewards"] : [])];

  /**
   * Returns an empty order structure based on the order components
   * @returns {Object} An object representing an empty order with keys for each tab.
   */
  const generate_empty_order = () => {
    const empty_order = {};
    orderComponents.forEach((item_type) => {
      empty_order[item_type] = [];
    });
    empty_order["REWARD"] = [];
    return empty_order;
  };

  const [order, set_order] = useState(generate_empty_order());

  /**
   * Calculates the total for the current number of items within the order 
   * 
   * @param {Object} order - The object containing the order details. Each key (excluding "CARTEITEMS") 
   *                         maps to an array of items with a `price` property.
   * @returns {void}
   */
  const calculateTotal = useCallback(() => {
    let total = 0.0;
    Object.keys(order).forEach((key) => {
      if(key !== "CARTEITEMS"){
        const itemArray = order[key];
        itemArray.forEach((item) => {
        //console.log("This is an Item: ", item)
        total += parseFloat(item.price);
      });
      }
    });
    setTotal(parseFloat(total.toFixed(2)));
    //console.log("CalculateTotal result = ", total);
  }, [order]);

  /**
   * Calculates the current total number of items within the order and plays a indicator animation
   * 
   * @param {Object} order - The object containing the order details. Each key (excluding "CARTEITEMS", "SIDE", & "ENTREE") 
   *                         maps to an array of items with a `price` property.
   * @returns {void}
   */
  const calculateNumOfItems = () => {
    let totalItems = 0; 
    Object.keys(order).forEach(key => {
      if(key !== "CARTEITEMS" && key !== "SIDE" && key !== "ENTREE"){
        const itemArray = order[key];
        itemArray.forEach(item => {
          totalItems++;
        });
      }
    });

    if(totalItems !== 0 && numItemsInOrder < totalItems){
      setAddItemAnimate(true);
      setTimeout(() => {
        setNumItemsInOrder(totalItems);
      }, 1000);

      setTimeout(() => {
        setAddItemAnimate(false);
      }, 2000); 
    }else{
      setNumItemsInOrder(totalItems);
    }
  };

  /**
   * Helper function to map the images to each menu item that has one availiable
   * @returns {void}
   */
  const addImages = useCallback((menu_items) => {
    return menu_items.map((item) => {
       
      if (item.item_type === "REWARD") {
        // Derive the image name from the non-reward counterpart
        const baseName = item.name.replace(" Reward", "").toLowerCase().replace(/\s+/g, "_") + ".png";
  
        // Find the non-reward counterpart
        const nonRewardName = item.name.replace(" Reward", "");
        const counterpart = menu_items.find((menuItem) => menuItem.name === nonRewardName);
  
        return {
          ...item,
          itemImage: `/ImageFolder/${baseName}`,
          rewardPoints: counterpart ? Math.round(counterpart.price * 1000) : 0, // Calculate reward points or default to 0
        };
      } else if(item.item_type === "SPECIAL"){
        return {
          ...item,
          itemImage: `/ImageFolder/special_icon.png`,
        };
      }else{
        let imageName = item.name.toLowerCase().replace(/\s+/g, "_") + ".png";
        return {
          ...item,
          itemImage: `/ImageFolder/${imageName}`,
        };
      }
    });
  }, []);

  /**
   * Updates the current orderr by adding the items provided in the Build Your Meal menu. The 
   * fucntion merges the items within the "Meal", "Side", and "Entree" arrays approiately 
   * @param {Object} mealOrder - The object sent from the Build Your Meal menu. It should have the keys
   *                             "Meal", "SIDE", and "ENTREE"
   * @returns {void}
   */
  const handleMealOrder = (mealOrder) => {
    set_order((prevOrder) => ({
      ...prevOrder,
      MEAL: [...prevOrder["MEAL"], ...mealOrder["MEAL"]],
      SIDE: [...prevOrder["SIDE"], ...mealOrder["SIDE"]],
      ENTREE: [...prevOrder["ENTREE"], ...mealOrder["ENTREE"]],
    }));
  };

  const addItemToOrder = (item) => {
    set_order((prevOrder) => {
      const updatedOrder = {
          ...prevOrder,
          [item.item_type]: [...(prevOrder[item.item_type] || []), item]
      };

      if (item.item_type === "REWARD") {
        setRemainingPoints((prevPoints) => prevPoints - item.rewardPoints);
      }
          
      return updatedOrder;
    });
  };

  /**
   * Updates the current order by adding the items provided by the La Carte menu. The function merges
   * an Object size into the "LACARTE" key and the associated Object item into the "CARTEITEMS"/ 
   * 
   * @param {Object} size - The Object menu item that is associated with the la carte ordered 
   * @param {Object} item - The Object la carte size that is associated with the la carte ordered
   * 
   * @returns {void}
   */
  const addCartetoOrder = (size, item) => {
    set_order((prevOrder) => ({
      ...prevOrder,
      LACARTE: [...prevOrder["LACARTE"], size],
      CARTEITEMS: [...prevOrder["CARTEITEMS"], item],
    }));
  };

  /**
   * Fetches menu items from the API and updates the state.
   * @returns {Promise<void>} A promise that resolves when the fetch is complete.
   */
  const fetchMenuItems = useCallback(async () => {
    try {
      const data = await executeGet("kiosk", {}, "GET");
      const dataWithImages = addImages(data);
      set_menu_items(dataWithImages); // Set fetched data directly
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  }, [addImages]);

  // Fetch menu items on initial render
  useEffect(() => {
    fetchMenuItems();
    //console.log("These are the menu items: ", menu_items);
    return () => set_menu_items([]); // Cleanup function
  }, [fetchMenuItems]);

  useEffect(() => {
    if (userPoints !== null) {
      setRemainingPoints(userPoints);
    }
  }, [userPoints]);  

  /**
   * Fetches last order number from the API and updates the state with adding 1.
   * @returns {Promise<void>} A promise that resolves when the fetch is complete.
   */
  const fetchOrderNumber = async() => {
    try{
      const res = await executeGet("kiosk/nextorder", {}, "GET");
      setNextOrderNum(res.order_id + 1);
    }catch (error) {
      console.error("Error fetching menu items:", error);
    }
  }

  /**
   * Helper function in determing how many components the Build You Meal menu needs to set
   * 
   * @param {function} set_modal_status - update state to open Build Your Meal menu 
   * @param {Object} item - Object MEAL item to be checked 
   * 
   * @returns {void}
   */
  const openModal = (item) => {
    set_modal_status(true);

    if (item.name === "Bowl") {
      setNumComponets(2);
    } else if (item.name === "Plate") {
      setNumComponets(3);
    } else {
      setNumComponets(4);
    }
  };

  /**
   * Closes the modal by updating the `modal_status` state to `false`.
   * If the modal was triggered from the "Add Item" action (i.e., the `triggeredFromAddItem` flag is `true`), 
   *  it resets the flag and opens the checkout process by setting `setCheckout` to `true`.
   * 
   * The function handles two tasks:
   * 1. Closes the modal by setting `modal_status` to `false`.
   * 2. If the modal was triggered from adding an item, it resets the `triggeredFromAddItem` flag 
   *    and opens the checkout screen.
   * 
   * @returns {void}
  */
  const closeModal = () => {
    set_modal_status(false); // Close the modal
    if (triggeredFromAddItem) {
      setTriggeredFromAddItem(false); // Reset the flag
      setCheckout(true); // Open checkout
    }
  };

  /**
   * Opens the "Add Item" menu by setting the `addMultipleItemStatus` state to `true` 
   * and setting the `itemToAdd` state to the provided item. This allows the user to 
   * add a specific item to the order.
   * 
   * The function performs two tasks:
   * 1. Sets the `addMultipleItemStatus` state to `true`, indicating that the item 
   *    menu should be displayed.
   * 2. Sets the `itemToAdd` state to the provided item, so the item can be added to 
   *    the order.
   * 
   * @param {Object} item - The item to be added. This object should contain the 
   *                         necessary properties representing the item to be added.
   * 
   * @returns {void} 
   */
  const openAddItemMenu = (item) => {
    setAddMultipleItemStaus(true);
    setItemToAdd(item);
  };

  /**
   * Closes the "Add Item" menu by setting the `addMultipleItemStatus` state to `false` 
   * and clearing the `itemToAdd` state. This effectively resets the state and hides 
   * the "Add Item" menu.
   * 
   * The function performs two tasks:
   * 1. Sets the `addMultipleItemStatus` state to `false`, indicating that the item 
   *    menu should be hidden.
   * 2. Clears the `itemToAdd` state by setting it to an empty string, removing the 
   *    previously selected item.
   * 
   * @returns {void}
   * 
  */
  const closeAddItemMenu = () => {
    setAddMultipleItemStaus(false);
    setItemToAdd("");
  };

  /**
   * Opens the "Carte Menu" by setting the `carteMenuStatus` state to `true` 
   * and setting the `itemToAdd` state to the provided item. This allows the user 
   * to select and add a specific item from the Carte menu.
   * 
   * The function performs two tasks:
   * 1. Sets the `carteMenuStatus` state to `true`, indicating that the Carte menu 
   *    should be displayed.
   * 2. Sets the `itemToAdd` state to the provided item, so the item can be added 
   *    to the order from the Carte menu.
   *
   *    
   * @param {Object} item - The item to be added. This object represents the item 
   *                         selected from the Carte menu.
   * 
   * @returns {void}
   */
  const openCarteMenu = (item) => {
    setCarteMenuStatus(true);
    setItemToAdd(item);
  };

  /**
   * Closes the "Carte Menu" by setting the `carteMenuStatus` state to `false` 
   * and clearing the `itemToAdd` state. This effectively hides the Carte menu 
   * and removes the currently selected item.
   * 
   * The function performs two tasks:
   * 1. Sets the `carteMenuStatus` state to `false`, indicating that the Carte menu 
   *    should be hidden.
   * 2. Clears the `itemToAdd` state by setting it to an empty string, removing the 
   *    currently selected item.
   * 
   * @returns {void}
  */
  const closeCarteMenu = () => {
    setCarteMenuStatus(false);
    setItemToAdd("");
  };

  /**
   * Deletes an item from order. If the item was a "MEAL" then it calculates its associated "SIDES" and "ENTREES" and deletes them as well.
   * If the item was a "LACARTE" then it finds it associated "CARTEITEM" and deletes it as well. 
   * 
   * @returns {void}
   */
  const deleteFromOrder = useCallback(
    (item, index) => {
      //if we are deleting a side we need to consider the index of sides and entrees
      if (item.item_type === "MEAL") {
        let startForSide = index * 2;
        let startForEntree = 0;

      for (let i = 0; i < index; i++) {
        if (order["MEAL"][i].name === "Bowl") {
          startForEntree += 1;
        } else if (order["MEAL"][i].name === "Plate") {
          startForEntree += 2;
        } else {
          startForEntree += 3;
        }
      }

      set_order((prevOrder) => {
        let numOfEntrees = 1;
        if (item.name === "Plate") {
          numOfEntrees = 2;
        } else if (item.name === "Bigger Plate") {
          numOfEntrees = 3;
        }

        const updatedOrder = {
          ...prevOrder,
          MEAL: [
            ...prevOrder.MEAL.slice(0, index),
            ...prevOrder.MEAL.slice(index + 1),
          ],
          SIDE: [
            ...prevOrder.SIDE.slice(0, startForSide),
            ...prevOrder.SIDE.slice(startForSide + 2),
          ],
          ENTREE: [
            ...prevOrder.ENTREE.slice(0, startForEntree),
            ...prevOrder.ENTREE.slice(startForEntree + numOfEntrees),
          ],
        };

        return updatedOrder;
      });
    }else if(item.item_type === "LACARTE"){
      set_order((prevOrder) => {
        const updatedOrder = {
          ...prevOrder,
          LACARTE: [
            ...prevOrder["LACARTE"].slice(0, index),
            ...prevOrder["LACARTE"].slice(index + 1),
          ],
          CARTEITEMS: [
            ...prevOrder["CARTEITEMS"].slice(0, index),
            ...prevOrder["CARTEITEMS"].slice(index + 1),
          ],
        };
        return updatedOrder;
      });
    }else {
      set_order((prevOrder) => {
        const updatedOrder = {
          ...prevOrder,
          [item.item_type]: [
            ...prevOrder[item.item_type].slice(0, index),
            ...prevOrder[item.item_type].slice(index + 1),
          ],
        };

        // Refund points for reward items
        if (item.item_type === "REWARD") {
          setRemainingPoints((prevPoints) => prevPoints + item.rewardPoints);
        }

        return updatedOrder;
      });
    }
  }, [order]);

  /**
   * Sends a grouped up version of the order to the API to be added to the order and current_order database
   * 
   * @param {Object} groupedOrder - A grouped up version of the order where "MEAL" and "LACARTE" items are grouped together with their attached items 
   * 
   * @returns {Promise<void>} A promise that resolves when the process is complete
   */
  const addToDatabase = async (groupedOrder) => {
    try {
      await executePost("kiosk/database", {
        order,
        groupedOrder,
        total,
        rating,
      });

    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Sends the current order to the API to make updates to the inventory database
   * 
   * @returns {Promised<void>} A promise that resolves when the process is complete
   */
  const updateInventory = async () => {
    try {
      await executePut("kiosk/updateInventory", {
        order,
      });

    } catch (error) {
      console.log(error);
    }
  }

 /**
 * Groups items in the order into different categories (MEAL, APPETIZER, DRINK, 
 * LACARTE, and REWARD) and assigns a group number to each. The function processes 
 * the order data, creating a grouped order with meal items, entrees, sides, and other 
 * items, then sorts the grouped order by group number.
 * 
 * @returns {Array} An array of grouped order items, each with a type, group number, 
 *                  and associated items.
*/
  const groupMealItems = () => {
    let groupNumber = 1;
    const groupedOrder = [];

    order["MEAL"].forEach((mealItem, mealIndex) => {
      const mealGroup = {
        type: "MEAL",
        groupNum: groupNumber,
        meal: mealItem,
        entrees: [],
        sides: [],
      };

      let entreeCount = 1;
      if (mealItem.name === "Plate") entreeCount = 2;
      else if (mealItem.name === "Bigger Plate") entreeCount = 3;

      let entreeStartIndex = 0;
      for (let i = 0; i < mealIndex; i++) {
        if (order["MEAL"][i].name === "Bowl") {
          entreeStartIndex += 1;
        } else if (order["MEAL"][i].name === "Plate") {
          entreeStartIndex += 2;
        } else {
          entreeStartIndex += 3;
        }
      }
      //console.log("Entree Start Index is at ", entreeStartIndex);
      mealGroup.entrees = order["ENTREE"].slice(
        entreeStartIndex,
        entreeStartIndex + entreeCount
      );
      mealGroup.sides = order["SIDE"].slice(mealIndex * 2, mealIndex * 2 + 2);

      groupedOrder.push(mealGroup);
      groupNumber += 1;
    });

    order["APPETIZER"].forEach((menuItem) => {
      const orderItem = {
        type: "APPETIZER",
        groupNum: groupNumber,
        item: menuItem,
      };
      groupedOrder.push(orderItem);
      groupNumber += 1;
    });

    order["DRINK"].forEach((menuItem) => {
      const orderItem = {
        type: "DRINK",
        groupNum: groupNumber,
        item: menuItem,
      };
      groupedOrder.push(orderItem);
      groupNumber += 1;
    });

    order["LACARTE"].forEach((carteSize, carteIndex) => {
      const orderLaCarte = {
        type: "LACARTE",
        groupNum: groupNumber,
        size: carteSize,
        item: order["CARTEITEMS"][carteIndex],
      };
      groupedOrder.push(orderLaCarte);
      groupNumber += 1;
    });

    order["REWARD"].forEach((menuItem) => { // Add logic for REWARD items
      const orderItem = {
        type: "REWARD",
        groupNum: groupNumber,
        item: menuItem,
      };
      groupedOrder.push(orderItem);
      groupNumber += 1;
    });

    groupedOrder.sort((a, b) => a.groupNum - b.groupNum);
    return groupedOrder;
  };

/**
 * Processes the checkout by handling the grouping of order items, deducting or adding 
 * reward points, updating the inventory, and performing a sequence of loading and 
 * animation steps. The function also updates the user's points and completes the 
 * checkout process by navigating to the start screen.
 * 
 * @async
 * @returns {void}
 */
  const processCheckout = async () => {
    const groupedOrder = groupMealItems();
  
    // Deduct points if rewards are used
    if (remainingPoints !== null && remainingPoints < userPoints) {
      const redeemPointsResponse = await executePost("customers/redeem-points", {
        email,
        remainingPoints // Points to deduct
      });
    }

    // Add points if non-rewards are used
    if (email && !(parseFloat(total) === 0)) {
      const points = Math.floor(total * 100); // Calculate points (1 cent = 1 point)
      setEarnedPoints(points);
      await executePost("customers/add-points", { email, points }); // Call backend to update points
    }
      
    //console.log(groupedOrder);
    closeCheckout(); 

    fetchOrderNumber();
    
    setLoading(true); // Start loading
    setShowCheckmark(false);
    setGrowModal(false);
    setShowText(false);

    // Simulate loading process
    const animationPromise = new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false); // End spinner
        setShowCheckmark(true); // Show checkmark
        setTimeout(() => {
          setGrowModal(true); // Grow modal
          setTimeout(() => {
            setShowText(true); // Show final text
            setTimeout(() => {
              resolve();
            }, 5000);
          }, 800); // Growth animation duration
        }, 1000); // Checkmark display duration
      }, 2000); // Loading duration
    });

    await Promise.all([
      (async () => {
        await addToDatabase(groupedOrder, rating);
        await updateInventory();
      })(),
      animationPromise, // Ensure animation finishes
    ]);
  
    navigate("/kioskStart");
    
    
  };

/**
 * Cancels the current order by navigating the user back to the kiosk start page.
 * This function does not affect the order itself, but serves to redirect the user
 * to the beginning of the ordering process.
 * 
 * @returns {void}
 */ 
  const cancelOrder = () => {
    navigate("/kioskStart");
  };

  /**
   * Opens the checkout process.
   * Checks if the order has any items; if not, displays a "No Items in the Cart" message.
   * Dynamically suggests additional items (1 appetizer, 1 drink, and 1 meal) for the user in a popup.
   * Filters items by category and selects random items for suggestions.
   */
  const openCheckout = () => {
    const hasItems = Object.values(order).some((items) => items.length > 0);
    if (!hasItems) {
      setNoItemsMessage(true);
    } else {
      // Filter dynamic items for the popup
      const getRandomItemByCategory = (items, category) => {
        const filteredItems = items.filter((item) => item.item_type === category);
        if (filteredItems.length === 0) return null; // Return null if no items in the category
        const randomIndex = Math.floor(Math.random() * filteredItems.length);
        return filteredItems[randomIndex];
      };
  
      // Get random items for each category
      const randomAppetizer = getRandomItemByCategory(menu_items, "APPETIZER");
      const randomDrink = getRandomItemByCategory(menu_items, "DRINK");
      const randomMeal = getRandomItemByCategory(menu_items, "MEAL");

      const selectedItems = [randomAppetizer, randomDrink, randomMeal].filter(Boolean); // Remove undefined/null items

      setDynamicItems(selectedItems); // Set the filtered items
      setAddItemStatus(true); // Trigger Add Item Popup
    }
  };

  const closeCheckout = useCallback(() => {
    setCheckout(false);
  }, []);

  /**
   * Handles the addition of an item to the order from the suggested items popup.
   * If the item is a meal, opens the modal for meal customization and closes the Add Item Popup.
   * Tracks if the item was added via the Add Item Popup.
   * For appetizers and drinks, adds the item directly to the order and proceeds to checkout.
   *
   * @param {Object} item - The item to be added to the order.
   */
  const handleAddItem = (item) => {
    if (item.item_type === "MEAL") {
      openModal(item);
      setAddItemStatus(false); // Close Add Item Popup immediately
      setTriggeredFromAddItem(true); // Track source
    } else {
      // Directly add appetizers and drinks to the order
      set_order((prevOrder) => ({
        ...prevOrder,
        [item.item_type]: [...prevOrder[item.item_type], item],
      }));
      setAddItemStatus(false);
      setCheckout(true); // Proceed to checkout
    }
  };

  /**
   * Skips the Add Item Popup and proceeds directly to checkout without adding any additional items.
   */
  const skipAddItem = () => {
    setAddItemStatus(false);
    setCheckout(true); // Proceed to checkout without adding
  };

  /**
   * Handles user login by checking if the provided email is in the database.
   * - If the email exists, retrieves the user's reward points and closes the login modal.
   * - If the email does not exist, prompts the user to create an account.
   *
   * @param {string} email - The email entered by the user.
   */
  const handleLogin = async (email) => {
    if (!email || !validateEmail(email)) {
      alert("Please enter a valid email!");
      return;
    }
  
    setIsLoginLoading(true); // Prevent multiple clicks during login
    try {
      const result = await executeGet(`customers/check-email?email=${encodeURIComponent(email)}`);
      setIsLoginLoading(false);
  
      if (result.exists) {
        const points = result.points || 0;
        setUserPoints(points);
        setLoginStatus(false);
        setShowCreateAccount(false);
        setShowAccountCreated(false);

        setWelcomeMessage(`Welcome back, ${email}! You have ${points} reward points.`);
        setShowWelcomeBack(true);
      } else {
        setShowCreateAccount(true);
        setLoginStatus(false);
      }
    } catch (error) {
      setIsLoginLoading(false);
      console.error("Error during login:", error);
      alert("An error occurred while logging in. Please try again later.");
    }
  };  
  
  /**
   * Handles account creation for a new user with the provided email.
   * Prevents multiple submissions while processing the request.
   * Creates a new user account with 0 points if the email is valid and available.
   *
   * @param {string} email - The email for the new account.
   */
  const handleCreateAccount = async (email) => {
    if (isLoginLoading) return; // Prevent multiple submissions
    setIsLoginLoading(true);
  
    try {
      const response = await executePost("customers/create", { email });
      setLoading(false);
  
      const points = 0;
      setUserPoints(points);
      setShowCreateAccount(false);
      setShowAccountCreated(true);
    } catch (error) {
      setLoading(false);
      console.error("Error creating account:", error);
      alert("An error occurred while creating your account. Please try again later.");
    }
  };  
  
  /**
   * Validates the format of the provided email.
   *
   * @param {string} email - The email to validate.
   * @returns {boolean} True if the email is in a valid format, otherwise false.
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeCheckout();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeCheckout]);

  /**
   * Monitors the cart's state and closes the checkout modal if the cart is empty.
   * Keeps the checkout modal open if a reward item is present, even if the total is $0.
   */
  useEffect(() => {
    // Check if there are reward items in the cart
    const hasRewards = Object.values(order).some((itemList) =>
      itemList.some((item) => item.item_type === "REWARD")
    );

    // Close checkout if total is $0 and there are no reward items
    if (parseFloat(total) === 0 && !hasRewards) {
      closeCheckout();
    }
  }, [closeCheckout, deleteFromOrder, total]);

  useEffect(() => {
    console.log("Current order is", order);
    calculateTotal();
    calculateNumOfItems();
  }, [calculateTotal, order]);

  useEffect(() => {
    //console.log(total);
  }, [total]);

  useEffect(() => {
    //console.log("Number of componets is ", numComponetsPerMeal);
  }, [numComponetsPerMeal]);

    return (
        <div className = "flex items-center justify-center h-screen bg-white">
            <div style = {backgroundStyle} className = "flex flex-col bg-amber-50">

                {/*HEADER SECTION */}
                {<nav className="bg-red-600 w-full max-h-[10%] shadow-sm shadow-black">
                  <div className="flex items-center justify-between w-full h-full">

                    {/* Logo / Login Section */}
                    <div className="flex items-center h-full w-[40%]">
                      <Logo width = "w-[15%]" height = "h-auto"/>
                      <LanguageSelector />
                      {userPoints !== null ? (
                        <div className="text-white font-semibold text-xl ml-4">
                          <p>{remainingPoints || 0} pts</p>
                        </div>
                      ) : (
                        <button
                          className="w-[10%] h-[85%] ml-4 text-white hover:text-yellow-300 font-semibold text-xl"
                          onClick={() => setLoginStatus(true)}
                        >
                          Login
                        </button>
                      )}
                    </div>
      
                    {/* Checkout Button */}
                    <div className = "flex items-end justify-end h-full w-[40%]">
                      <div className="relative h-full w-[20%] flex justify-end">
                        <img src = "/ImageFolder/Shopping_Cart.png" alt = {"Total Items in order"} className="object-contain h-auto w-[80%]"/>
                        <div className={`  absolute right-7 top-6 ${addItemAnimate ? 'animate-bounceCustom' : ''}  bg-black w-[25px] h-[20px] 
                        rounded-sm text-yellow-300 font-semibold
                        flex items-center justify-center`}>{numItemsInOrder}</div>
                      </div>
                      <div className="text-yellow-300 rounded-t-full bg-black font-semibold text-xl h-[70%] w-[30%] mr-5 flex items-end justify-center ">
                        <p>Total: $</p>
                        <p>{parseFloat(total).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </nav>}

                {/* Rewards member login handler */}
                {loginStatus && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[70vw]">
                      <h2 className="text-2xl font-bold mb-4 text-center">
                        Sign In to Earn Rewards
                      </h2>
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="border p-2 rounded w-full"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded"
                          onClick={() => handleLogin(email)}
                        >
                          ➔
                        </button>
                      </div>
                      <div className="mt-4">
                        <div className="grid grid-cols-10 gap-2">
                          {"1234567890".split("").map((key) => (
                            <button
                              key={key}
                              className="bg-gray-200 p-4 rounded text-lg font-bold"
                              onClick={() => setEmail((prev) => prev + key)}
                            >
                              {key}
                            </button>
                          ))}
                          {"QWERTYUIOPASDFGHJKLZXCVBNM".split("").map((key) => (
                            <button
                              key={key}
                              className="bg-gray-200 p-4 rounded text-lg font-bold"
                              onClick={() => setEmail((prev) => prev + key.toLowerCase())}
                            >
                              {key}
                            </button>
                          ))}
                          <button
                            className="bg-gray-200 p-4 col-span-2 rounded text-lg font-bold"
                            onClick={() => setEmail((prev) => prev + "@")}
                          >
                            @
                          </button>
                          <button
                            className="bg-gray-200 p-4 col-span-2 rounded text-lg font-bold"
                            onClick={() => setEmail((prev) => prev + ".com")}
                          >
                            .com
                          </button>
                          <button
                            className="bg-red-500 text-white p-4 col-span-2 rounded text-lg font-bold"
                            onClick={() => setEmail((prev) => prev.slice(0, -1))}
                          >
                            ⌫
                          </button>
                        </div>
                      </div>
                      <button
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
                        onClick={() => setLoginStatus(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {showCreateAccount && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[40vw]">
                      <h2 className="text-2xl font-bold mb-4 text-center">
                        Create an Account
                      </h2>
                      <p className="text-center mb-4">
                        The email <strong>{email}</strong> is not registered. Would you like to create an account?
                      </p>
                      <div className="flex justify-around">
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded"
                          onClick={() => handleCreateAccount(email)}
                        >
                          Yes
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded"
                          onClick={() => setShowCreateAccount(false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showAccountCreated && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[40vw]">
                      <h2 className="text-2xl font-bold mb-4 text-center">Account Created!</h2>
                      <p className="text-center mb-4">
                        Your account has been successfully created. You can now log in to earn rewards.
                      </p>
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded w-full"
                        onClick={() => {
                          setShowAccountCreated(false);
                          setLoginStatus(false);
                          alert(`Welcome, ${email}!`);
                        }}
                      >
                        Okay
                      </button>
                    </div>
                  </div>
                )}

                {showWelcomeBack && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[40vw]">
                      <h2 className="text-2xl font-bold mb-4 text-center">Welcome Back!</h2>
                      <p className="text-center mb-4">{welcomeMessage}</p>
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded w-full"
                        onClick={() => setShowWelcomeBack(false)}
                      >
                        Okay
                      </button>
                    </div>
                  </div>
                )}

                {addItemStatus && (
                  <AddItemPopup
                    items={dynamicItems}
                    onAddItem={handleAddItem}
                    onSkip={skipAddItem}
                    menu_items={menu_items}
                  />
                )}

                {/*Kiosk TABS */}
                <KioskTabs active = {current_tab}>
                    {kioskTabs.map(tab => (
                        <KioskTab label={tab} key={tab}>
                            {menu_items.map(item => {
                            
                                const normalizedTab = tab === "Build Your Meal" 
                                ? "MEAL" 
                                : tab === "Appetizers"
                                ? "APPETIZER"
                                : tab === "Drinks"
                                ? "DRINK"
                                : tab === "La Carte"
                                ? "LACARTE"
                                : tab === "My Rewards"
                                ? "REWARD"
                                : tab; 
                                const handleClick = item.item_type === "MEAL"
                                    ? (e) => openModal(item)
                                    : item.item_type === "APPETIZER" || item.item_type === "DRINK" || item.item_type === "REWARD"
                                    ? (e) => openAddItemMenu(item)
                                    : (e) => openCarteMenu(item); 
                                
                                if(item.item_type === normalizedTab && normalizedTab === "MEAL"){
                                  return (
                                    <KioskMealCard key={item.id} onClick={handleClick} item={item} picture={item.itemImage} menu_items={menu_items}/>
                                  );
                                }else if(item.item_type === normalizedTab && normalizedTab === "APPETIZER"){
                                  return (
                                    <KioskItemCard key={item.id} onClick={handleClick} item={item} picture={item.itemImage}
                                    cardSize={'2xl:h-[550px] 2xl:w-[450px] h-[350px] w-[300px]'} infoStyle={'w-[10%] h-[8%] z-10 absolute top-0.5 left-1 p-2 text-sm font-semibold'}
                                    nameSize={'2xl:text-2xl text-lg h-[10%]'} pictureSize={'w-[full] 2xl:h-[250px] h-[150px]'}
                                    priceSize={'h-[20%] 2xl:text-2xl text-lg'} spicySize={'w-[15%]'} wokSize={'w-[17%]'} userPoints={remainingPoints} menu_items={menu_items}
                                    />
                                  );
                                }else if(item.item_type === normalizedTab && normalizedTab === "DRINK"){
                                  return (
                                    <KioskItemCard key={item.id} onClick={handleClick} item={item} picture={item.itemImage}
                                    cardSize={'2xl:h-[550px] 2xl:w-[450px] h-[350px] w-[300px]'} infoStyle={'w-[10%] h-[8%] absolute top-0.5 left-1 p-2 text-sm font-semibold'}
                                    nameSize={'2xl:text-2xl text-lg h-[10%]'} pictureSize={'w-[full] 2xl:h-[250px] h-[150px]'}
                                    priceSize={'h-[20%] 2xl:text-2xl text-lg'} spicySize={'w-[15%]'} wokSize={'w-[17%]'} userPoints={remainingPoints} menu_items={menu_items}
                                    />
                                  );
                                }else if(item.item_type === normalizedTab && normalizedTab === "REWARD"){
                                  return (
                                    <KioskItemCard key={item.id} onClick={handleClick} item={item} picture={item.itemImage}
                                    cardSize={'2xl:h-[550px] 2xl:w-[450px] h-[350px] w-[300px]'} infoStyle={'w-[10%] h-[8%] z-10 absolute top-0.5 left-1 p-2 text-sm font-semibold'}
                                    nameSize={'2xl:text-2xl text-lg h-[10%] w-[80%]'} pictureSize={'w-[full] 2xl:h-[250px] h-[150px]'}
                                    priceSize={'h-[20%] 2xl:text-2xl text-lg'} spicySize={'w-[15%]'} wokSize={'w-[17%]'} userPoints={remainingPoints} menu_items={menu_items}
                                    />
                                  );
                                }else if ((item.item_type === "SIDE" || item.item_type === "ENTREE" || item.item_type === "SPECIAL") && normalizedTab === "LACARTE"){
                                  return (
                                    <KioskItemCard key={item.id} onClick={handleClick} item={item} picture={item.itemImage}
                                    cardSize={'2xl:h-[550px] 2xl:w-[450px] h-[250px] w-[200px]'} infoStyle={'w-[10%] h-[8%] absolute top-0.5 left-1 p-2 text-sm font-semibold'}
                                    nameSize={'2xl:text-2xl text-lg h-[15%] w-[65%]'} pictureSize={'w-[full] 2xl:h-[250px] h-[150px]'}
                                    priceSize={'h-[20%] 2xl:text-2xl text-lg opacity-0'} messageStyle={'h-[10%] bottom-10 font-semibold text-sm'} spicySize={'w-[15%]'} wokSize={'w-[17%]'} userPoints={remainingPoints} menu_items={menu_items}
                                    />
                                  );
                                }   
                            })}
                        </KioskTab>
                    ))}
                </KioskTabs>
                
                {/*BUILD YOUR MEAL MENU SECTION*/}
                <div className= {`${modalStatus === false ? 'hidden' : ''} fixed inset-0 bg-black/50 flex items-center justify-center z-50`} aria-modal="true">
                    <div className="bg-amber-50 w-[70vw] h-[98vh] relative rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <KioskModal numOfComponents = {numComponetsPerMeal} menuItems={menu_items} onClose = {closeModal} orderHandler={handleMealOrder}/>
                    </div>
                </div>

                {/*Add Items menu SECTION*/}
                <div className= {`${addMultipleItemStatus === false ? 'hidden' : ''} fixed inset-0 bg-black/50 flex items-center justify-center z-50`} aria-modal="true">
                    <div className="bg-amber-50 w-[30vw] h-[75vh] relative rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <AddItemMenu item = {itemToAdd} addItemHandler = {addItemToOrder} onClose={closeAddItemMenu} remainingPoints={remainingPoints}/>
                    </div>
                </div>
                
                {/*La Carte Menu SECTION*/}
                <div className= {`${carteMenuStatus === false ? 'hidden' : ''} fixed inset-0 bg-black/50 flex items-center justify-center z-50`} aria-modal="true">
                    <div className="bg-amber-50 w-[40vw] h-[95vh] relative rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <LaCarteMenu item = {itemToAdd} menuItems={menu_items} addItemHandler={addCartetoOrder} onClose = {closeCarteMenu}/>
                    </div>
                </div>

                {/*CHECKOUT SECTION*/}
                <div className= {`${ checkoutStatus === false ? 'hidden' : ''} fixed inset-0 bg-black/50 flex items-center justify-center z-50`} aria-modal="true">
                    <div className="bg-amber-50 w-[37vw] h-[95vh]  relative rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <KioskCheckout onClose = {closeCheckout} onCheckout = {processCheckout} deleteItem={deleteFromOrder} currentOrder={order} currentTotal={total} setRating={setRating}/>
                    </div>
                </div>

                {/*No Item Message*/}
                <div className= {`${ noItemsMessage === false ? 'hidden' : ''} fixed inset-0 bg-black/50 flex items-center justify-center z-50`} aria-modal="true">
                    <div className="bg-amber-50 w-[20vw] h-[20vh]  relative rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <div className='w-full h-full flex items-center justify-center'>
                          <button
                            className="absolute left-2 top-1 rounded-md font-semibold text-3xl "
                            onClick={() => setNoItemsMessage(false)}
                          >
                            X
                          </button>
                          <p className='font-semibold text-lg'>No Items in the Cart!</p>
                        </div>
                    </div>
                </div>

                {(loading || showCheckmark || growModal || showText) && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div
                    className={`bg-white flex items-center justify-center rounded-lg p-3 transition-all transform ${
                    growModal ? "w-[45vw] h-[50vh] animate-grow" : " w-[10vw] h-[20vh]"
                    }`}
                    >
                      {loading && (
                      <img
                      src="/ImageFolder/loading_icon.png"
                      alt="Loading..."
                      className="object.contain animate-spin"
                      />
                      )}

                      {showCheckmark && !growModal && (
                      <img
                      src="/ImageFolder/completed_icon.png"
                      alt="Order Complete"
                      className="w-16 h-16"
                      />
                      )}

                      {showText && (
                      <div className=' w-full h-full flex flex-col gap-5 items-center justify-center'>
                        <p className='text-5xl font-semibold'>Checkout Complete!</p>
                        {earnedPoints > 0 && (
                          <p className='text-4xl'>You earned <b>{earnedPoints}</b> points!</p>
                        )}
                        <p className='text-3xl'>Your Order Number Is</p>
                        <p className='text-4xl font-semibold'><u>{nextOrderNum}</u></p>
                      </div>
                      )}
                    </div>
                  </div>
                )}

                {/*FOOTER SECTION*/}
                <div className = "bg-red-600 w-full h-[10%] shadow-sm shadow-black flex items-center justify-between">
                  <button className = "w-[20%] h-[85%] ml-1 bg-white hover:bg-black hover:text-yellow-300 font-semibold text-xl"
                  onClick={() => cancelOrder()}>
                    Cancel Order
                  </button>

                  <button className="w-[20%] h-[85%] mr-1 bg-white hover:bg-black hover:text-yellow-300 font-semibold text-xl" onClick={ () => openCheckout()}>
                    Place Order
                  </button>
                </div>
              </div>
            </div>
  );
};
