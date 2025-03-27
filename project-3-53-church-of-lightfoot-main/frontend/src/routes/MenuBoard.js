import React, { useEffect, useState } from 'react';
import './MenuBoard.css';
import MenuHeader from '../components/MenuBoard/MenuHeader';
import MenuMealOptions from '../components/MenuBoard/MenuMealOptions';
import PickSide from '../components/MenuBoard/PickSide';
import PickEntree from '../components/MenuBoard/PickEntree';
import Extras from '../components/MenuBoard/Extras';
import MenuSpecial from '../components/MenuBoard/MenuSpecial';
import LanguageSelector from '../components/LanguageSelector';
import { executeGet } from '../util/Requests';

/**
 * MenuBoard Component
 * @description The main component for rendering the menu board. It fetches menu data, processes it, and passes it to subcomponents for display.
 * 
 * @component
 * 
 * @returns {React.JSX.Element} A React component representing the menu board with its various sections.
 */
export const MenuBoard = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [favorites, setFavorites] = useState([]);

    /**
     * fetchMenuItems
     * @description Fetches the menu items from the API. Makes a GET request to the "kiosk" endpoint and updates the `menuItems` state.
     * 
     * @async
     * @function fetchMenuItems
     * 
     * @returns {Promise<void>} Resolves when the menu items are fetched and the state is updated.
     * @throws {Error} Logs an error message if the fetch request fails.
     */
    const fetchMenuItems = async () => {
        try {
            const data = await executeGet("kiosk", {}, "GET");
            console.log("Fetched data:", data);
            setMenuItems(data);
        } catch (error) {
            console.error("Error fetching menu items:", error);
        }
    };

    /**
     * fetchFavorites
     * @description Fetches the favorite menu items from the API. Makes a GET request to the "orders/favorites" endpoint and updates the `favorites` state.
     * 
     * @async
     * @function fetchFavorites
     * 
     * @returns {Promise<void>} Resolves when the favorites are fetched and the state is updated.
     * @throws {Error} Logs an error message if the fetch request fails.
     */
    const fetchFavorites = async () => {
        try {
            const data = await executeGet("orders/favorites", {}, "GET");
            console.log("Fetched favorites:", data);
            setFavorites(data);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    /**
     * useEffect Hook
     * @description Fetches menu items and favorites on component mount.
     */
    useEffect(() => {
        fetchMenuItems();
        fetchFavorites();
        return () => {
            setMenuItems([]); // Cleanup menu items
            setFavorites([]); // Cleanup favorites
        };
    }, []);

    return (
        <div className="menu-board">
            <LanguageSelector/>
            <MenuHeader />
            <MenuMealOptions items={menuItems.filter(item => item.item_type === "MEAL")} />
            <MenuSpecial items={menuItems.filter(item => item.item_type === "SPECIAL")} favorites = {favorites} mitems = {menuItems.filter(item => item.item_type === "SPECIAL" || item.item_type === "ENTREE" || item.item_type === "APPETIZER" || item.item_type === "SIDE")}/>
            <PickEntree items={menuItems.filter(item => item.item_type === "ENTREE")} />
            <PickSide items={menuItems.filter(item => item.item_type === "SIDE")} />
            <Extras
                appetizers={menuItems.filter(item => item.item_type === "APPETIZER")}
                drinks={menuItems.filter(item => item.item_type === "DRINK")}
            />
        </div>
    );
};

export default MenuBoard;
