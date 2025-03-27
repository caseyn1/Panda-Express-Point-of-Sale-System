import React from "react";

/**
 * PickSide Component
 * @description Displays a selection of side items with their images, names, calorie information, and allergen warnings.
 *
 * @component
 * @param {Object} props - React props for configuring the component.
 * @param {Array} props.items - Array of side items to display. Each item should have the following properties:
 *  - `menu_item_id` {number} Unique ID of the side item.
 *  - `name` {string} Name of the side item.
 *  - `calories` {number} Caloric information of the side item.
 *  - `allergens` {string} Allergen information for the side item (e.g., "None").
 *
 * @returns {React.JSX.Element} A React component representing the side selection area.
 */
const PickSide = ({ items }) => {

    /**
   * @constant
   * @type {Object}
   * @description Maps the name of each side item to its corresponding image path.
   */
  const sideImages = {
    "Fried Rice": "/ImageFolder/fried_rice.png",
    "Chow Mein": "/ImageFolder/chow_mein.png",
    "Super Greens": "/ImageFolder/super_greens.png",
    "White Rice": "/ImageFolder/white_rice.png",
  };

  return (
    <section className="section pick-side">
      <h2 className="section-title">3. Pick a Side</h2>
      <div className = "side-container">
        {items.map((item) => (
          <div key={item.menu_item_id} className="side-option">
            <img
              className="entree-image"
              alt={sideImages[item.name]}
              src={sideImages[item.name]}
            />
            {item.name}<span className="calorie-info">{item.calories} Calories</span>
            <div className={`${!item.allergens || item.allergens.trim() === "None" ? 'hidden' : ''}`}>
                <img src = '/ImageFolder/warning_panda.png' className='allergen-icon' alt = {'allergen warning'}/>
              </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PickSide;
