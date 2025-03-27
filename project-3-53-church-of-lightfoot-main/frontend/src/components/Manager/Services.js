import React, { useState, useEffect } from "react";
import { SeasonalTable } from "./SeasonalTable";
import { SeasonalAdder, SeasonalAdderPopUp } from "./SeasonalAdder";
import { executeGet, executePost, executeDelete } from "../../util/Requests";

/**
 * Services Component
 * @description Manages the menu items and ingredient inventory. Allows users to view, add, and remove items or ingredients using `SeasonalTable` and `SeasonalAdderPopUp`.
 *
 * @component
 * 
 * @returns {React.JSX.Element} A React component for managing seasonal menu items and inventory.
 */
const Services = () => {
    const [seasonalItems, setSeasonalItems] = useState([]);
    const [ingredientItems, setIngredientItems] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    /**
     * fetchSeasonalItems
     * @description Fetches all menu items from the backend and sorts them by `menu_item_id`.
     *
     * @async
     * @function
     * @returns {Promise<void>}
     */
    const fetchSeasonalItems = async () => {
        try {
            const data = await executeGet('seasonal', {}, 'GET');
            data.sort((a,b) => a.menu_item_id - b.menu_item_id);
            setSeasonalItems(data);
        } catch (error) {
            console.error("Error fetching menu items:", error);
        }
    }

    /**
     * fetchInventory
     * @description Fetches all ingredient inventory items from the backend.
     *
     * @async
     * @function
     * @returns {Promise<void>}
     */
    const fetchInventory = async () => {
      try {
        const data = await executeGet('inventory', {}, 'GET');
        setIngredientItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    }

    /**
     * addSeasonalItem
     * @description Sends a new menu item to the backend for addition.
     *
     * @async
     * @function
     * @param {string} name - The name of the menu item.
     * @param {number} price - The price of the menu item.
     * @param {number} calories - The caloric value of the menu item.
     * @param {number} protein - The protein content of the menu item.
     * @param {number} carbohydrate - The carbohydrate content of the menu item.
     * @param {number} saturated_fat - The saturated fat content of the menu item.
     * @param {boolean} spicy - Whether the item is spicy.
     * @param {boolean} premium - Whether the item is a premium option.
     * @param {string} allergens - A string listing allergens for the item.
     * @param {Array<string>} ingredients - An array of ingredient names.
     * @param {string} type - The type of menu item (e.g., "ENTREE", "APPETIZER").
     *
     * @returns {Promise<void>}
     */
    const addSeasonalItem = async (name, price, calories, protein, carbohydrate, saturated_fat, spicy, premium, allergens, ingredients, type, ingredientQuantities, ingredientUnits) => {
        try {
          const data = [name, price, calories, protein, carbohydrate, saturated_fat, spicy, premium, allergens, ingredients, type, ingredientQuantities, ingredientUnits];
          console.log("Sending data to backend:", data);
          const response = await executePost("seasonal/add", { name, price, calories, protein, carbohydrate, saturated_fat, spicy, premium, allergens, ingredients, type, ingredientQuantities, ingredientUnits });
          if (response === 200) {
            setIsAdding(false);
            fetchSeasonalItems();
            alert("You have successfully added a new menu item.");
          }
          else {
            alert("Try again: menu item input incorrect.");
          }
        } catch (error) {
          console.log("man why am i here");
          console.error("Error adding menu item:", error);
          alert("Error adding item. Please check the console for more details.");
        }
    };

    /**
     * addIngredient
     * @description Sends a new ingredient to the backend for addition.
     *
     * @async
     * @function
     * @param {string} ingname - The name of the ingredient.
     * @param {number} stock - The initial stock of the ingredient.
     * @param {string} ingunit - The unit of measurement for the ingredient (e.g., "oz").
     * @param {number} min - The minimum threshold for the ingredient.
     * @param {number} max - The maximum threshold for the ingredient.
     * @param {number} restock - The restock quantity for the ingredient.
     * @param {number} currprice - The current price of the ingredient.
     *
     * @returns {Promise<void>}
     */
    const addIngredient = async (ingname, stock, ingunit, min, max, restock, currprice) => {
      try {
        const data = [ingname, stock, ingunit, min, max, restock, currprice];
        console.log(typeof ingname);
        console.log("Sending data to backend:", data);
        const response = await executePost("seasonal/ingredient", { ingname, stock, ingunit, min, max, restock, currprice });
        if (response === 200) {
          fetchInventory();
          alert("You have successfully added a new ingredient.");
        }
        else {
          alert("Try again: ingredient input incorrect.");
        }
      } catch (error) {
        console.error("Error adding ingredient item:", error);
        alert("Error adding item. Please check the console for more details.");
      }
  };
    
    /**
     * removeSeasonalItem
     * @description Sends a delete request to the backend to remove a seasonal menu item by its ID.
     *
     * @async
     * @function
     * @param {number} id - The ID of the menu item to remove.
     *
     * @returns {Promise<void>}
     */
    const removeSeasonalItem = async (id) => {
        try {
          const response = await executeDelete(`seasonal/${id}`, {});
          console.log(response.status);
          if (response === 200) {
            fetchSeasonalItems();
            alert("You have successfully deleted an item.");
          }
          else {
            alert("Try Again: Failed to delete item.");
          }
        } catch (error) {
          console.error("Error deleting seasonal item:", error);
        }
      };

      const removeIngredient = async (ingId) => {
        try {
          const response = await executeDelete(`inventory/${ingId}`, {});
          if (response === 200) {
            fetchInventory();
            alert("You have successfully deleted an ingredient.");
          } else {
            alert("Try Again: Failed to delete ingredient")
          }
        } catch (error) {
          console.error("Error deleteing ingredient item:", error);
        }
      };
    
      useEffect(() => {
        fetchSeasonalItems();
        fetchInventory();
      }, []);
    
    return (
        <div className="p-2 relative h-[75vh] overflow-y-auto rounded-md border border-gray-300">
            {/*Add Seasonal Button */}
            <SeasonalAdder onClick = {() => setIsAdding(true)} />
            {/*Seasonal Table */}
            <SeasonalTable items = {seasonalItems} onRemove = {removeSeasonalItem} ingredient = {ingredientItems} onRemoveIng = {removeIngredient}/>
            {/*PopUp*/}
            {isAdding && (
                <SeasonalAdderPopUp
                onClose={() => setIsAdding(false)}
                onAdd={addSeasonalItem}
                onAddIng = {addIngredient}
                items = {ingredientItems}
                />
            )}           
        </div>
    );
};

export default Services;


