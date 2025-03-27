import React from "react";

/**
 * BuildMeal Component
 * @description Displays a list of meal options for users to build their own meal. Each meal option includes an image, name, and price.
 *
 * @component
 * @param {Object} props - React props for configuring the component.
 * @param {Array} props.items - Array of meal options to display. Each item should have the following properties:
 *  - `menu_item_id` {number} Unique ID of the meal option.
 *  - `name` {string} Name of the meal option.
 *  - `price` {number} Price of the meal option.
 *
 * @returns {React.JSX.Element} A React component displaying meal options for building a meal.
 */
const BuildMeal = ({ items }) => (
  <section className="section build-meal">
    <h2 className="section-title">1. Build Your Own Meal</h2>
    <div className = 'mealoptions-container'>
      {items.map((item) => (
        <div key={item.menu_item_id} className="meal-option">
          <img className="entree-image"
                alt={item.name}
                src={`/ImageFolder/${item.name.replace(/\s+/g, "_").toLowerCase()}.png`}></img>
          {item.name} - ${parseFloat(item.price).toFixed(2)}
        </div>
      ))}
    </div>
  </section>
);

export default BuildMeal;
