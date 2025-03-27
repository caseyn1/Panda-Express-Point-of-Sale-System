import React, { useState, useEffect } from "react";

/**
 * PickEntree Component
 * @description Displays a rotating selection of entree items. The component cycles through entrees in batches every 5 seconds, showing 4 items at a time.
 *
 * @component
 * @param {Object} props - React props for configuring the component.
 * @param {Array} props.items - Array of entree items to display. Each item should have the following properties:
 *  - `menu_item_id` {number} Unique ID of the entree.
 *  - `name` {string} Name of the entree.
 *  - `calories` {number} Caloric information of the entree.
 *  - `price` {number} Optional price adjustment for the entree.
 *  - `allergens` {string} Allergen information for the entree (e.g., "None").
 *
 * @returns {React.JSX.Element} A React component representing the entree selection area with automatic rotation.
 */
const PickEntree = ({ items }) => {
  const [index, setindex] = useState(0);
  const pageItems = 4;
  const visibleItems = items.slice(index, index + pageItems);

    /**
   * @constant
   * @type {Object}
   * @description Maps the name of each entree item to its corresponding image path.
   */
  const entreeImages = {
    "Orange Chicken": "/ImageFolder/orange_chicken.png",
    "Teriyaki Chicken": "/ImageFolder/teriyaki_chicken.png",
    "Mushroom Chicken": "/ImageFolder/mushroom_chicken.png",
    "Black Pepper Chicken": "/ImageFolder/black_pepper_chicken.png",
    "Kung Pao Chicken": "/ImageFolder/kung_pao_chicken.png",
    "Honey Sesame Chicken": "/ImageFolder/honey_sesame_chicken.png",
    "Sweet Fire Chicken": "/ImageFolder/sweet_fire_chicken.png",
    "String Bean Chicken": "/ImageFolder/string_bean_chicken.png",
    "Walnut Shrimp": "/ImageFolder/walnut_shrimp.png",
    "Broccoli Beef": "/ImageFolder/broccoli_beef.png",
    "Beijing Beef": "/ImageFolder/beijing_beef.png",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setindex((prevIndex) =>
        prevIndex + pageItems >= items.length ? 0 : prevIndex + pageItems
      );
    }, 5000); 
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, [items.length, pageItems]);

  return (
    <section className="section pick-entree">
      <h2 className="section-title">2. Pick an Entree</h2>
      <div className = "rotation-container">
        {visibleItems.map((entree) => (
            <div key={entree.menu_item_id} className="entree-option">
              <img
                className="entree-image"
                alt={entree.name}
                src={`/ImageFolder/${entree.name.replace(/\s+/g, "_").toLowerCase()}.png`}
              />
              {entree.name}{" "}{parseFloat(entree.price) > 0 && `(+$${parseFloat(entree.price).toFixed(2)})`}<span className="calorie-info">{entree.calories} Calories</span>
              <div className={`${!entree.allergens || entree.allergens.trim() === "None" ? 'hidden' : ''}`}>
                <img src = '/ImageFolder/warning_panda.png' className='allergen-icon' alt = {'allergen warning'}/>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

export default PickEntree;
