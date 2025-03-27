import React from "react";

/**
 * Extras Component
 * @description Displays a list of appetizer and drink options as extras. Each appetizer includes an image, name, price, and calorie information, while drinks display their names and prices.
 *
 * @component
 * @param {Object} props - React props for configuring the component.
 * @param {Array} props.appetizers - Array of appetizer items to display. Each item should have the following properties:
 *  - `menu_item_id` {number} Unique ID of the appetizer.
 *  - `name` {string} Name of the appetizer.
 *  - `price` {number} Price of the appetizer.
 *  - `calories` {number} Caloric information of the appetizer.
 *  - `allergens` {string} Allergen information for the appetizer (e.g., "None").
 * @param {Array} props.drinks - Array of drink items to display. Each item should have the following properties:
 *  - `menu_item_id` {number} Unique ID of the drink.
 *  - `name` {string} Name of the drink.
 *  - `price` {number} Price of the drink.
 *
 * @returns {React.JSX.Element} A React component displaying extras categorized into appetizers and drinks.
 */
const Extras = ({ appetizers, drinks }) => {
    /**
   * @constant
   * @type {Object}
   * @description Maps the name of each appetizer item to its corresponding image path.
   */
  const extrasImages = {
    "Chicken Egg Roll": "/ImageFolder/chicken_egg_roll.png",
    "Veggie Egg Roll": "/ImageFolder/veggie_egg_roll.png",
    "Cream Cheese Rangoon": "/ImageFolder/cream_cheese_rangoon.png",
  };

  return (
    <section className="section extras">
      <h2 className="section-title">Extras</h2>
      <div className="extra-category">
        <h3 className="food-headers">Appetizers</h3>
        <div className = 'extra-container'>
          {appetizers.map((app) => (
            <div key={app.menu_item_id} className="extra-option">
              <div className={`${!app.allergens || app.allergens.trim() === "None" ? 'hidden' : ''}`}>
                <img src = '/ImageFolder/warning_panda.png' className='allergen-icon'/>
              </div>
              <img
                src={extrasImages[app.name]}
                alt={extrasImages[app.name]}
                className="entree-image"
              />
              {app.name} - ${parseFloat(app.price).toFixed(2)}<span className="calorie-info">{app.calories} Calories</span>
            </div>
          ))}
        </div>
      </div>
      <div className="extra-category">
        <h3 className="food-headers">Drinks</h3>
        <div className = "drink-container">
          {drinks.map((drink) => (
            <div key={drink.menu_item_id} className="extra-option">
              {drink.name} - ${parseFloat(drink.price).toFixed(2)}
            </div>
          ))}  
        </div>
      </div>
    </section>
  );
};

export default Extras;
