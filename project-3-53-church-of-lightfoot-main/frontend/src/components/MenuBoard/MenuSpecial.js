import React, { useState, useEffect } from "react";

/**
 * SeasonalItems Component
 * @description Displays seasonal items and favorite menu items with automatic rotation every 5 seconds. Seasonal items and favorites are displayed one at a time in a rotating manner.
 * 
 * @component
 * @param {Object} props - The props object for the component.
 * @param {Array} props.items - Array of seasonal items to be displayed.
 * @param {Object} props.favorites - Object containing `top_menu_items` array.
 * @param {Array} props.mitems - Array of all menu items used for matching favorite IDs to their names.
 * 
 * @returns {React.JSX.Element} A React component displaying seasonal items and rotating favorites.
 */
const SeasonalItems = ({ items, favorites, mitems }) => {
  const [index, setIndex] = useState(0); // Current index for seasonal items rotation
  const [indexFav, setIndexFav] = useState(0); // Current index for favorites rotation
  const pageItems = 1; // Number of items displayed per rotation

  /**
   * Processes the `favorites.top_menu_items` array to:
   * 1. Match each menu item ID with a name and price from `mitems`.
   * 2. Return an array of favorite items.
   */
  const topFavorites = Array.isArray(favorites?.top_menu_items)
    ? favorites.top_menu_items.map((menuItemId) => {
        const matchingItem = mitems.find((item) => item.menu_item_id === menuItemId);

        return matchingItem
          ? { ...matchingItem }
          : { menu_item_id: menuItemId, name: "Unknown Item", price: 0 };
      })
    : [];

  /**
   * useEffect Hook
   * @description Rotates seasonal items every 5 seconds.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) =>
        prevIndex + pageItems >= items.length ? 0 : prevIndex + pageItems
      );
    }, 5000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [items.length]);

  /**
   * useEffect Hook
   * @description Rotates favorites every 5 seconds.
   */
  useEffect(() => {
    const intervalFav = setInterval(() => {
      setIndexFav((prevIndex) =>
        prevIndex + pageItems >= topFavorites.length ? 0 : prevIndex + pageItems
      );
    }, 5000);

    return () => clearInterval(intervalFav); // Cleanup interval on unmount
  }, [topFavorites.length]);

  return (
    <section className="section seasonal-items">
      <h2 className="section-title">Seasonal Items and Favorites</h2>
      <h3 className="section-title">Seasonal Items</h3>
      <div>
        {items.length > 0 ? (
          <div key={items[index].menu_item_id} className="special">
            {items[index].name} - ${parseFloat(items[index].price).toFixed(2)}
          </div>
        ) : (
          <div>No seasonal items available.</div>
        )}
      </div>
    </section>
  );
};

export default SeasonalItems;
