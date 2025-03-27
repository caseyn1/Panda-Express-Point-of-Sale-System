

import React from "react";
import { KioskItemCard } from "./KioskItemCard";
/**
 * AddItemPopup Component
 *
 * @description A modal popup that displays a list of recommended items for the user. 
 *              Users can choose to add an item or skip the recommendation.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.items - An array of item objects to display. Each item should contain:
 *        - {string} id: The unique identifier for the item.
 *        - {string} itemImage: The URL or path to the item's image.
 * @param {function} props.onAddItem - Callback function triggered when an item is selected. Receives the selected item as an argument.
 * @param {function} props.onSkip - Callback function triggered when the user opts to skip the recommendation.
 *
 * @returns {JSX.Element} A styled modal showing recommended items with options to add or skip.
 */
const AddItemPopup = ({ items, onAddItem, onSkip, menu_items }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[80vw]">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-4 text-center">Items Picked Just For You</h2>

        {/* Item Cards in Horizontal Layout */}
        <div className="flex justify-center gap-4">
          {items.map((item) => (
            <KioskItemCard
              key={item.id}
              onClick={onAddItem}
              item={item}
              picture={item.itemImage}
              cardSize={"w-[300px] h-[200px]"}
              infoStyle={"hidden"}
              nameSize={"text-lg"}
              pictureSize={"w-[full] 2xl:h-[250px] h-[100px]"}
              priceSize={"h-[20%] 2xl:text-2xl text-lg"}
              messageStyle={"h-[10%] bottom-10 font-semibold text-sm"}
              spicySize={'w-[15%]'}
              wokSize={"w-[17%]"}
              menu_items={menu_items}
            />
          ))}
        </div>

        {/* Skip Button */}
        <button
          className="mt-6 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition block mx-auto"
          onClick={onSkip}
        >
          No, thanks
        </button>
      </div>
    </div>
  );
};

export default AddItemPopup;