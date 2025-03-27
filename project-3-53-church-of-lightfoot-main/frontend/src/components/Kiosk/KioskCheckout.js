import React, { useEffect, useState } from "react";
import StarRating from "./StarRating";

/**
 * A checkout menu that displays all the items within the user's order and the total amount it costs. 
 * Groups up components of Meal items and La Carte items as one line. Items can be deleted and automatically readjusts
 * layout and total costs. 
 * 
 * @component
 * @param {Object} props - React props for configuring the item card.
 * @param {function} props.onClose - Function to run when checkout closes 
 * @param {function} props.onCheckout - Function to run when checkout is pressed
 * @param {function} props.deleteItem - Function to run when an item is delted 
 * @param {Object} currentOrder - The current state of the order Object
 * @param {float} currentTotal - The current state of the total amount for the order 
 * @param {function} setRating - Function to run when rating is selected 
 * 
 * @returns {React.JSX.Element} A React component the checkout area of the kiosk
 */
export const KioskCheckout = ({
  onClose,
  onCheckout,
  deleteItem,
  currentOrder,
  currentTotal,
  setRating,
}) => {
  const buttonStyle =
    "w-[5%] h-[90%] text-bold text-lg bg-white hover:bg-red-600 border border-black flex justify-center items-center";
  const mainItemStyle = "w-[70%] h-full flex items-center";
  const priceStyle = "w-[10%] h-full";

  const [showStarRating, setShowStarRating] = useState(false);

  /**
 * Parses the sides from the current order based on the given index.
 * It retrieves two side items from the `currentOrder["SIDE"]` array, starting 
 * at an index calculated from the provided `index` parameter.
 * 
 * @param {Object} item - The item being processed (not used in the current function, but kept for consistency).
 * @param {number} index - The index used to calculate which two sides to retrieve from the current order.
 * 
 * @returns {Array} An array containing two side items from the current order.
 */

  function parseSides(item, index) {
    const sideIndex = index * 2;
    return [
      currentOrder["SIDE"][sideIndex],
      currentOrder["SIDE"][sideIndex + 1],
    ];
  }

/**
 * Parses the entree items from the current order based on the provided index and item name.
 * The function calculates the starting index for the entrees depending on how many "Bowl", 
 * "Plate", and "Bigger Plate" items have been encountered in the "MEAL" order list up to the given index.
 * It returns an array of entree items corresponding to the item type (Bowl, Plate, or Bigger Plate).
 * 
 * @param {Object} item - The item being processed, which contains the name of the meal type ("Bowl", "Plate", or "Bigger Plate").
 * @param {number} index - The index of the current item in the "MEAL" list, used to determine how many items have come before it.
 * 
 * @returns {Array} An array of entree items corresponding to the meal type, which may contain 1, 2, or 3 items depending on the type.
 */ 
  function parseEntrees(item, index) {
    let indexCounter = 0;
    for (let i = 0; i < index; i++) {
      if (currentOrder["MEAL"][i].name === "Bowl") {
        //console.log("I have hit a bowl");
        indexCounter += 1;
      } else if (currentOrder["MEAL"][i].name === "Plate") {
        //console.log("I have hit a plate");
        indexCounter += 2;
      } else {
        //console.log("I have hit a Bigger Plate");
        indexCounter += 3;
      }
    }

    if (item.name === "Bowl") {
      return [currentOrder["ENTREE"][indexCounter]];
    } else if (item.name === "Plate") {
      return [
        currentOrder["ENTREE"][indexCounter],
        currentOrder["ENTREE"][indexCounter + 1],
      ];
    } else {
      return [
        currentOrder["ENTREE"][indexCounter],
        currentOrder["ENTREE"][indexCounter + 1],
        currentOrder["ENTREE"][indexCounter + 2],
      ];
    }
  }
  
  /**
 * Retrieves a specific item from the "CARTEITEMS" list based on the provided index.
 * This function simply returns the item at the given index in the current order's "CARTEITEMS" array.
 * 
 * @param {number} index - The index of the item in the "CARTEITEMS" list to retrieve.
 * 
 * @returns {Object} The item at the specified index in the "CARTEITEMS" array.
 */ 
  const parseCarteItems = (index) => {
    return currentOrder["CARTEITEMS"][index]; 
  }

  /**
   * Handles the submission of the user's star rating. 
   * Logs the submitted rating for debugging and updates it using the `setRating` function.
   *
   * @param {number} rating - The star rating submitted by the user (1-5).
   */
  const handleRatingSubmit = (rating) => {
    console.log("Submitted Rating:", rating);
    setRating(parseInt(rating));
  };

  /**
   * Closes the star rating modal once the user submits their rating and triggers the `onCheckout` 
   * callback to complete the checkout process.
   */
  const handleStarRatingClose = () => {
    setShowStarRating(false);
    onCheckout();
  };

  return (
    <div className="w-full h-full flex flex-col font-sans font-semibold">
      {/*HEADER*/}
      <div className="w-full h-[5%] bg-red-600 text-white flex justify-center items-center rounded-t-lg 2xl:text-xl lg:text-md">
        Checkout Area
      </div>

      {/*REVIEW SECTION */}
      <div className="w-full h-[90%] flex flex-col items-center overflow-auto">
        {Object.keys(currentOrder).map((itemType) => {
          if (itemType !== "SIDE" && itemType !== "ENTREE" && itemType !== "CARTEITEMS") {
            return (
              <div key={itemType} className="w-full flex flex-col">
                {currentOrder[itemType].map((item, index) => {
                  const uniqueKey = `${item.name}-${index}`;
                  if (itemType === "MEAL") {
                    const sides = parseSides(item, index);
                    const entrees = parseEntrees(item, index);
                    //console.log("This MEAL has these SIDES", sides);
                    //console.log("This MEAL has these ENTREES", entrees);
                    return (
                      <div
                        key={uniqueKey}
                        className="w-full flex flex-col items-center mt-1 border-b border-black"
                      >
                        <div className="w-full flex justify-center items-center gap-2 ">
                          <button
                            className={buttonStyle}
                            onClick={() => deleteItem(item, index)}
                          >
                            X
                          </button>
                          <p className={mainItemStyle}>{item.name}</p>
                          <p className={priceStyle}>${item.price}</p>
                        </div>
                        <div className="w-full">
                          <div>
                            {sides.map((sideItem) => (
                              <div className="flex gap-1">
                                <div className="ml-[13%] w-[70%]">
                                  • 1/2 {sideItem.name}
                                </div>
                                <p
                                  className={`${
                                    Math.abs(sideItem.price) < 1e-10
                                      ? "opacity-0"
                                      : ""
                                  }`}
                                >
                                  ${sideItem.price}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div>
                            {entrees.map((entreeItem) => (
                              <div className="flex gap-1">
                                <div className="ml-[13%] w-[70%]">
                                  • {entreeItem.name}
                                </div>
                                <p
                                  className={`${
                                    Math.abs(entreeItem.price) < 1e-10
                                      ? "opacity-0"
                                      : ""
                                  }`}
                                >
                                  ${entreeItem.price}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }else if(itemType === "LACARTE"){
                    const carteItem = parseCarteItems(index);
                    return (
                      <div
                        key={uniqueKey}
                        className="w-full flex flex-col items-center mt-1 border-b border-black"
                      >
                        <div className="w-full flex justify-center items-center gap-2 ">
                          <button
                            className={buttonStyle}
                            onClick={() => deleteItem(item, index)}
                          >
                            X
                          </button>
                          <p className={mainItemStyle}>{item.name}</p>
                          <p className={priceStyle}>${item.price}</p>
                        </div>
                        <div className="w-full">
                          <div className="flex gap-1">
                            <div className="ml-[13%] w-[70%]">
                              • {carteItem.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }else{
                    return (
                      <div
                        key={uniqueKey}
                        className="w-full flex justify-center mt-1 gap-2 border-b border-black"
                      >
                        <button
                          className={buttonStyle}
                          onClick={() => deleteItem(item, index)}
                        >
                          X
                        </button>
                        <p className={mainItemStyle}>{item.name}</p>
                        <p className={priceStyle}>${item.price}</p>
                      </div>
                    );
                  }
                })}
              </div>
            );
          } else {
            return null;
          }
        })}
        <div className=" w-full h-[5%] flex">
          <p className="relative left-[77%]">
            Total: ${parseFloat(currentTotal).toFixed(2)}
          </p>
        </div>
      </div>

      {/*FOOTER*/}
      <div className="w-full h-[5%] p-4 bg-red-600 flex justify-between items-center rounded-b-lg 2xl:text-xl lg:text-md">
        <button
          className="bg-white text-black rounded-md 2xl:w-[20%] lg:w-[20%] hover:bg-black hover:text-yellow-300"
          onClick={() => onClose()}
        >
          Go Back
        </button>
        <button
          className="bg-white text-black rounded-md 2xl:w-[20%] lg:w-[20%] hover:bg-black hover:text-yellow-300"
          onClick={() => setShowStarRating(true)}
        >
          Checkout
        </button>

        {showStarRating && (
          <StarRating
            onClose={handleStarRatingClose}
            onSubmit={handleRatingSubmit}
          />
        )}
      </div>
    </div>
  );
};
