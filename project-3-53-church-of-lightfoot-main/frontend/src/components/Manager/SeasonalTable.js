import React from 'react';

/**
 * SeasonalTable Component
 * @description Displays a table of menu items, including their IDs, names, and prices. Provides a button for each item to remove it from the list.
 *
 * @component
 * @param {Object} props - React props for configuring the component.
 * @param {Array} props.items - Array of menu items to display in the table. Each item should have the following properties:
 *  - `menu_item_id` {number} Unique ID of the menu item.
 *  - `name` {string} Name of the menu item.
 *  - `price` {number} Price of the menu item.
 * @param {Function} props.onRemove - Function to handle the removal of a menu item. Called with the `menu_item_id` of the item to be removed.
 *
 * @returns {React.JSX.Element} A React component displaying a table of menu items with the option to remove them.
 */
export const SeasonalTable = ({ items, onRemove, ingredient, onRemoveIng }) => {
    return (
        <section>
            <div className = "table-container">
                <table className = "w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2">Dish ID</th>
                            <th className="border border-gray-300 p-2">Dish Name</th>
                            <th className="border border-gray-300 p-2">Dish Price</th>
                            <th className="border border-gray-300 p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => ( 
                                <tr key={item.menu_item_id}>
                                    <td className="border border-gray-300 p-2">{item.menu_item_id}</td>
                                    <td className="border border-gray-300 p-2">{item.name}</td>
                                    <td className="border border-gray-300 p-2">${parseFloat(item.price).toFixed(2)}</td>
                                    <td className="border border-gray-300 p-2">
                                        <button className="bg-red-500 text-white px-2 py-1 rounded" onClick = {() => onRemove(item.menu_item_id)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <div className = "mt-10">
                <table className = "w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2">Ingredient ID</th>
                            <th className="border border-gray-300 p-2">Ingredient Name</th>
                            <th className="border border-gray-300 p-2">Ingredient Price</th>
                            <th className="border border-gray-300 p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredient.map(item => ( 
                                <tr key={item.menu_item_id}>
                                    <td className="border border-gray-300 p-2">{item.ingredient_id}</td>
                                    <td className="border border-gray-300 p-2">{(item.name).replace(/_/g, " ")}</td>
                                    <td className="border border-gray-300 p-2">${item.current_price}</td>
                                    <td className="border border-gray-300 p-2">
                                        <button className="bg-red-500 text-white px-2 py-1 rounded" onClick = {() => onRemoveIng(item.ingredient_id)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
