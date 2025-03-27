import React, { useState } from "react";

import { KioskInfoLayout } from "./KioskInfoLayout.js";

/**
 * A regular item kiosk card component that displays an item with details such as 
 * name, price, picture, and optional additional information. It also provides 
 * an onClick handler for interactions.
 * 
 * @component
 * @param {Object} props - React props for configuring the item card.
 * @param {function} props.onClick - Function to be called when the card is clicked.
 * @param {Object} props.item - The item object that contains details like name and price.
 * @param {string} props.picture - URL or path to the item's image.
 * @param {string} props.cardSize - Size of the card (e.g., "small", "large").
 * @param {string} props.infoStyle - CSS style for item information section.
 * @param {string} props.nameSize - CSS style for the item name text size.
 * @param {string} props.pictureSize - CSS style for the image size.
 * @param {string} props.priceSize - CSS style for the price text size.
 * @param {string} [props.messageStyle=''] - Optional CSS style for any additional message or description.
 * @param {string} props.spicySize - CSS style for spicy item indicator.
 * @param {string} props.wokSize - CSS style for wok-style item indicator.
 * @param {number} props.userPoints - The current number of points the user has.
 * 
 * @returns {React.JSX.Element} A React component representing the kiosk item card.
 */

const KioskItemCard = ({ onClick, item, picture, cardSize, infoStyle, nameSize, pictureSize, priceSize, messageStyle = '', spicySize, wokSize, userPoints, menu_items}) => {
  //console.log("This picture link is: ", picture);

  const [infoStatus, setInfoStatus] = useState(false);

  // Disables reward item if user has insufficient points
  const isDisabled = item.item_type === "REWARD" && userPoints < item.rewardPoints;

  // console.log(menu_items)
  // Find the non-reward counterpart
  const nonRewardName = item.name.replace(" Reward", "");
  const counterpart = menu_items.find((menuItem) => menuItem.name === nonRewardName);

  /**
   * Handles card click, triggering the `onClick` callback if the card is not disabled.
   */
  const handleClick = () => {
    if (!isDisabled) {
      onClick(item);
    }
  };

  /**
   * Opens up the information menu for the mneu item 
   */
  const openInfoModal = () => {
    setInfoStatus(true);
  };

  /**
   * Closes the information menu for the mneu item 
   */
  const closeInfoModal = () => {
    setInfoStatus(false);
  };

  /**
   * Determines if an item is a wok smart item which is when the item's protein is above 8 and calories at most 300
   * @returns {boolean} - returns if the item is a wok smart item
   */
  const isWokSmart = () => {
    if(item.protein >= 8 && item.calories <= 300){
      return true;
    }else{
      return false; 
    }
  }

  return (
    <div>
      <div
        className={`
          ${cardSize} border shadow-sm shadow-black rounded-md
          flex flex-col items-center flex-grow relative
          ${isDisabled ? 'bg-gray-300 opacity-50 pointer-events-none' : 'bg-white group hover:bg-red-600'}`}
        onClick={handleClick}
        tabIndex={isDisabled ? -1 : 0}
      >
        <button
          className={`${
            item.item_type === "DRINK" || counterpart.item_type === "DRINK"
              ? "opacity-0 cursor pointer-events-none"
              : ""
          }
         ${infoStyle}
        border border-black bg-white hover:bg-yellow-300
        flex items-center justify-center rounded-full`}
          onClick={(e) => {
            e.stopPropagation();
            openInfoModal();
          }}
        >
          i
        </button>
        <p className={`${nameSize} font-semibold group-hover:text-white text-center`}>
          {item.name.replace(" Reward", "")}
        </p>
        <img
          src={picture}
          alt={item.name}
          className={`${pictureSize} mt-5 object-cover border-b group-hover:border-white group-hover:text-white`}
        />
        {/* Price or Reward Points */}
        <p className={`${priceSize} font-semibold group-hover:text-white`}>
          {item.item_type === "REWARD" 
            ? `${item.rewardPoints} pts` 
            : `$${item.price}`}
        </p>

        <div className={`${item.premium ? '' : 'opacity-0'} absolute w-full ${messageStyle} flex justify-center items-center bg-black`}>
          <p className="text-yellow-300">
            PREMIUM
          </p>
        </div>
        <div className={`${item.item_type === "SPECIAL" ? '' : 'opacity-0'} absolute w-full ${messageStyle} flex justify-center items-center bg-black`}>
          <p className="text-yellow-300">
            Limited-Time Offer
          </p>
        </div>

        <div className="absolute bottom-0 right-0 flex">
          <img src = "/ImageFolder/spicy_icon.png" alt = "This is Spicy" className={`${!item.spicy ? 'hidden' : ''} ${spicySize} h-auto object-contain`}/>
          <img src = "/ImageFolder/wok_smart_icon.png"alt ="This has at least 9 grams of protein and at most 300 calories" className={`${!isWokSmart() ? 'hidden' : ''} ${wokSize} h-auto object-contain`}/>
        </div>
      </div>
      <KioskInfoLayout
        infoStatus={infoStatus}
        item={item.item_type === "REWARD" && counterpart ? counterpart : item}
        closeInfo={closeInfoModal}
      />
    </div>
  );
};

/**
 * A Meal item kiosk card component that displays a meal item with details such as 
 * price, the number of components, and estimated calories. It also provides 
 * an onClick handler for interactions.
 * 
 * @component
 * @param {Object} props - React props for configuring the item card.
 * @param {function} props.onClick - Function to be called when the card is clicked.
 * @param {Object} props.item - The item object that contains details like name and price.
 * @param {string} props.picture - URL or path to the item's image
 * 
 * @returns {React.JSX.Element} A React component representing the kiosk meal item card.
 */
const KioskMealCard = ({ onClick, item, picture }) => {
  /**
   * Depending if the item is a "Bowl", "Plate", or "Bigger Plate" this displays the associated estimate of calories
   * @returns {String} - Estimated calories for an item
   */
  const getCalories = () => {
    if (item.name === "Bowl") {
      return "280 - 1130 Calories";
    } else if (item.name === "Plate") {
      return "430 - 1640 Calories";
    } else {
      return "580 - 2150 Calories";
    }
  };

  /**
   * Depending if the item is a "Bowl", "Plate", or "Bigger Plate" this displays the associated instruction information
   * @returns {String} - instruction information 
   */
  const getMealInfo = () => {
    if (item.name === "Bowl") {
      return "Pick 1 Side and 1 Entree";
    } else if (item.name === "Plate") {
      return "Pick 1 Side and 2 Entrees";
    } else {
      return "Pick 1 Side and 3 Entrees";
    }
  };

  return (
    <button
      className="
        2xl:h-[550px] 2xl:w-[450px] h-[350px] w-[300px]
        border shadow-sm shadow-black bg-white rounded-md 
        hover:bg-red-600 hover:text-white
        flex flex-col items-center flex-grow"
      onClick={() => onClick(item)}
    >
      <p className="font-semibold 2xl:text-2xl text-lg h-[10%]">{item.name}</p>
      <img
        src={picture}
        alt={item.name}
        className="mt-5 w-[full] 2xl:h-[250px] h-[150px] object-cover border-b "
      />
      <p>{getCalories()}</p>
      <p className={`mt-10 h-[20%] font-semibold 2xl:text-2xl text-lg`}>
        ${item.price}
      </p>
      <p>{getMealInfo()}</p>
    </button>
  );
};

/**
 * A kiosk card component that displays a meal item within the Build Your Meal menu. This displays with details such as 
 * price, calories, spice level, wok smart status, and a informational button. It also provides 
 * an onClick handler for interactions.
 * 
 * @component
 * @param {Object} props - React props for configuring the item card.
 * @param {function} props.onAdd - Function to be called when the card is clicked.
 * @param {function} props.onRemove - Function to be called when the card is clicked after being selected.
 * @param {Object} props.item - The item object that contains details like name and price.
 * @param {string} props.picture - URL or path to the item's image
 * 
 * @returns {React.JSX.Element} A React component representing the item cards within the Build Your Meal menu.
 */
const BuildYourMealCard = ({ item, picture, isSelected, onAdd, onRemove = () => {}}) => {
  //console.log("This picture link is: ", picture);

  const [infoStatus, setInfoStatus] = useState(false);

  /**
   * Opens up the information menu for the mneu item 
   */
  const openInfoModal = () => {
    setInfoStatus(true);
  };

  /**
   * Closes the information menu for the mneu item 
   */
  const closeInfoModal = () => {
    setInfoStatus(false);
  };

  /**
   * Determines if an item is a wok smart item which is when the item's protein is above 8 and calories at most 300
   * @returns {boolean} - returns if the item is a wok smart item
   */
  const isWokSmart = () => {
    if(item.protein >= 8 && item.calories <= 300){
      return true;
    }else{
      return false; 
    }
  }

  return (
    <div>
      <div
        className={`${isSelected ? 'bg-red-600': 'bg-white'}
            2xl:h-[550px] 2xl:w-[450px] h-[260px] w-[200px]
            border shadow-sm shadow-black rounded-md 
            hover:border-red-600
            flex flex-col items-center flex-grow relative`}
            onClick={() => {
              if(isSelected && item.item_type === "SIDE"){
                onRemove(item);
              }else if (!isSelected && item.item_type === "SIDE"){
                onAdd(item);
              }else{
                onAdd(item); 
              }
            }}
            tabIndex={0}
      >
        <button
          className={`
          w-[13%] h-[10%] absolute top-0.5 left-1 p-2 
          border border-black text-sm font-semibold bg-white hover:bg-yellow-300
          flex items-center justify-center rounded-full`}
          onClick={(e) => {
            e.stopPropagation();
            openInfoModal();
          }}
        >
          i
        </button>

        <p className={`${isSelected ? 'text-white': ''} font-semibold 2xl:text-2xl text-md h-[5%] w-[65%] text-center`}>
          {item.name}
        </p>

        <img
          src={picture}
          alt={item.name}
          className="mt-5 w-[full] 2xl:h-[250px] h-[150px] object-cover border-b group:text-white"
        />

        <div className={`${item.premium ? '' : 'opacity-0'} absolute w-full h-[7%] flex justify-center items-center bottom-16  bg-black`}>
          <p className="text-yellow-300 font-semibold text-sm">
            PREMIUM +${item.price}
          </p>
        </div>
        <div className={`${item.item_type === "SPECIAL" ? '' : 'opacity-0'} absolute w-full h-[7%] flex justify-center items-center bottom-16 bg-black`}>
          <p className="text-yellow-300 font-semibold text-sm">
          {item.price === 0 ? 'Limited-Time Offer' : `Limited-Time Offer $${item.price}`}
          </p>
        </div>

        <p className={`${isSelected ? 'text-white': ''} mt-3`}>{item.calories} Cal</p>

        <div className="absolute bottom-0 right-0 flex">
          <img src = "/ImageFolder/spicy_icon.png" alt = "This is Spicy" className={`${!item.spicy ? 'hidden' : ''} w-[15%] h-auto object-contain`}/>
          <img src = "/ImageFolder/wok_smart_icon.png" alt = "This has at least 9 grams of protein and at most 300 calories" className={`${!isWokSmart() ? 'hidden' : ''} w-[17%] h-auto object-contain`}/>
        </div>

      </div>
      <KioskInfoLayout
        infoStatus={infoStatus}
        item={item}
        closeInfo={closeInfoModal}
      />
    </div>
  );
};

export { KioskItemCard, BuildYourMealCard, KioskMealCard};
