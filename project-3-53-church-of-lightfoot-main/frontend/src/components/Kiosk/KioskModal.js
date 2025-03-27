import React, { useEffect, useMemo, useState, useCallback } from "react";
import { BuildYourMealCard } from "./KioskItemCard.js";

/**
 * A modal component that displays the build your meal menu and handles user interactions.
 * This component enables users to make changes to what goes into their meal at any point.
 * 
 * @component
 * @param {Object} props - React props passed to the component.
 * @param {number} props.numOfComponents - The number of components from the meal selected for example "Bowl" = 2 componets etc
 * @param {Array} props.menuItems - A list of menu items to be displayed inside the modal.
 * @param {function} props.onClose - A function to handle closing the modal.
 * @param {function} props.orderHandler - A function that processes the order when items are selected.
 * 
 * @returns {React.JSX.Element} A modal component that displays the build your meal menu
 */ 
const KioskModal = ({ numOfComponents, menuItems, onClose, orderHandler }) => {
  const [selectedTab, setSelectedTab] = useState("SIDE");
  const [visitedTabs, setVisitedTabs] = useState([false, false, false, false]);
  const modalTabs = ["SIDE", "ENTREE 1", "ENTREE 2", "ENTREE 3"];
  const sides = menuItems.filter((item) => item.item_type === "SIDE");
  const entrees = menuItems.filter((item) => item.item_type === "ENTREE" || item.item_type === "SPECIAL");
  const meals = menuItems.filter((item) => item.item_type === "MEAL");

  /**
 * Generates the default meal options for a user based on the number of components selected.
 * This function determines the appropriate meal type (from a predefined list) and returns 
 * an object representing the user's meal, including the meal, side, and entree options.
 * 
 * @returns {Object} The user's meal options, including the MEAL, SIDE, and ENTREE properties.
 */ 
  const generateUserMealOptions = () => {
    let mealType;
    if (numOfComponents === 2) {
      mealType = meals[0];
    } else if (numOfComponents === 3) {
      mealType = meals[1];
    } else if (numOfComponents === 4) {
      mealType = meals[2];
    }
    const newUserMealOptions = {
      MEAL: [mealType],
      SIDE: [],
      ENTREE: [],
    };
    return newUserMealOptions;
  };
  const [userMealOptions, setUserMealOptions] = useState(
    generateUserMealOptions()
  );

  const selectedStyle = "bg-red-600 border-1 shadow-sm shadow-black text-white";
  const normalStyle = "bg-white border-1 shadow-sm shadow-black text-black";
  const tabItemStyle = "2xl:text-lg lg:text-sm text-center";

  //"bg-black border-1 shadow-sm shadow-black"

/**
 * Navigates the modal tabs to the previous tab in the `modalTabs` array.
 * This function finds the current selected tab, calculates its index in the `modalTabs` array, 
 * and updates the `selectedTab` state to the previous tab in the array.
 * 
 * @returns {void} This function does not return any value.
 */ 
  const goBack = () => {
    const index = modalTabs.indexOf(selectedTab);
    setSelectedTab(modalTabs[index - 1]);
  };

  /**
 * Changes the currently selected modal tab to the next tab in the `modalTabs` array.
 * This function checks if the provided `index` is not the last tab in the array,
 * and if so, updates the `selectedTab` state to the next tab in the array.
 * 
 * @function
 * @param {number} index - The index of the current tab to change from.
 * @returns {void}
 */  
  const changeSelectedTab = (index) => {
    if (index != numOfComponents - 1) {
      setSelectedTab(modalTabs[index + 1]);
    }
  };

  /**
 * Marks a specific tab as visited in the `visitedTabs` state array.
 * This function updates the `visitedTabs` array by setting the value at the specified `index` to `true`, 
 * indicating that the tab at that index has been visited.
 * 
 * @param {number} index - The index of the tab to mark as visited.
 * @returns {void}
 */
  const changeVisistedTabs = (index) => {
    setVisitedTabs((prev) => {
      const updatedArray = [...prev];
      updatedArray[index] = true;
      return updatedArray;
    });
  };

  /**
 * Sorts an array of entree items into categories based on their type and name.
 * This function separates items into categories such as "Seasonal" for special items, 
 * and other categories derived from the entree name. If an entree's name ends with "Steak", 
 * it is categorized under "Beef". The function returns an object where the keys are 
 * category names and the values are arrays of items in those categories.
 * 
 * 
 * @param {Array} entrees - An array of entree items to be sorted.
 * 
 * @returns {Object} An object where each key is a category name, and each value is an array of items in that category.
 */ 
  const sortEntrees = (entrees) => {
    return entrees.reduce((categories, item) => {
      if(item.item_type === "SPECIAL"){
        if(!categories["Seasonal"]){
          categories["Seasonal"] = [];
          categories["Seasonal"].push(item);
        }else{
          categories["Seasonal"].push(item);
        }
        return categories; 
      }else{
        let category = item.name.split(" ")[item.name.split(" ").length - 1];
        if (category === "Steak") {
          category = "Beef";
        }
        if (!categories[category]) {
          categories[category] = [];
          categories[category].push(item);
        } else {
          categories[category].push(item);
        }
        return categories;
      }
    }, {});
  };

  const entreeCategories = sortEntrees(entrees);
  //console.log(entreeCategories);

  //Add Side to userMealOptions
  const [indexOfSideTC, setIndexOfSideTC] = useState(1);

  /**
 * Adds a side item to the user's meal options. If no sides are selected yet, 
 * it adds the side twice to ensure there are two sides in the meal. If a side 
 * is already selected, it swaps the current side with the new one.
 * 
 * @param {Object} item - The side item to be added to the meal options.
 * 
 * @returns {void} This function updates the `userMealOptions` state with the new side item(s).
 */ 
  const addSideToOrder = (item) => {
    if (userMealOptions["SIDE"].length === 0) {
      setUserMealOptions((prevOptions) => {
        const updatedMealOptions = { ...prevOptions };
        updatedMealOptions["SIDE"][0] = item;
        updatedMealOptions["SIDE"][1] = item;
        return updatedMealOptions;
      });
    } else if (
      !userMealOptions["SIDE"].some((iterator) => iterator.name === item.name)
    ) {
      setUserMealOptions((prevOptions) => {
        const updatedMealOptions = { ...prevOptions };
        updatedMealOptions["SIDE"][indexOfSideTC] = item;
        if (indexOfSideTC === 0) {
          setIndexOfSideTC(1);
        } else {
          setIndexOfSideTC(0);
        }
        return updatedMealOptions;
      });
    }
  };

  /**
 * Removes a side item from the user's meal options. If both sides are the same, 
 * it clears the side options. Otherwise, it swaps the sides to ensure that one 
 * side remains selected.
 * 
 * @param {Object} item - The side item to be removed from the meal options.
 * 
 * @returns {void} This function updates the `userMealOptions` state to reflect the removal of the side item.
 */ 
  const removeSideFromOrder = (item) => {
    if (userMealOptions["SIDE"][0].name === userMealOptions["SIDE"][1].name) {
      setUserMealOptions((prevOptions) => {
        const updatedMealOptions = { ...prevOptions };
        updatedMealOptions["SIDE"] = [];
        return updatedMealOptions;
      });
    } else {
      const index = userMealOptions["SIDE"].findIndex(
        (iterator) => iterator.name === item.name
      );
      if (index === 1) {
        setUserMealOptions((prevOptions) => {
          const updatedMealOptions = { ...prevOptions };
          updatedMealOptions["SIDE"][index] = updatedMealOptions["SIDE"][0];
          return updatedMealOptions;
        });
      } else {
        setUserMealOptions((prevOptions) => {
          const updatedMealOptions = { ...prevOptions };
          updatedMealOptions["SIDE"][index] = updatedMealOptions["SIDE"][1];
          return updatedMealOptions;
        });
      }
    }
  };

  /**
 * Checks if a specific side item is already selected in the user's meal options.
 * 
 * @param {Object} item - The side item to check for selection.
 * 
 * @returns {boolean} Returns `true` if the side item is selected in the user's meal options, 
 *                   otherwise returns `false`.
 */ 
  const sideItemSelected = (item) => {
    if (
      userMealOptions[item.item_type].some(
        (iterator) => iterator.name === item.name
      )
    ) {
      return true;
    } else {
      return false;
    }
  };

  //add Entree to userMealOptions
  const addEntreeToOrder = (item) => {
    const tabIndex = modalTabs.indexOf(selectedTab);
    if (visitedTabs) {
      setUserMealOptions((prevOptions) => {
        const updatedMealOptions = { ...prevOptions };
        updatedMealOptions["ENTREE"][tabIndex - 1] = item;
        //console.log("Changed entree item to, " + item.name);
        return updatedMealOptions;
      });
    } else {
      setUserMealOptions((prevOptions) => {
        const updatedMealOptions = { ...prevOptions };
        updatedMealOptions["ENTREE"] = [...updatedMealOptions["ENTREE"], item];
        //console.log("Added entree item, " + item.name);
        return updatedMealOptions;
      });
    }

    changeVisistedTabs(tabIndex);
    canProceedToNext(tabIndex);
  };

  /**
 * Checks if a specific entree item is already selected in the user's meal options based on the active tab.
 * 
 * @param {Object} item - The entree item to check for selection.
 * 
 * @returns {boolean} Returns `true` if the entree item is selected in the user's meal options, 
 *                   otherwise returns `false`.
 */ 
  const entreeItemSelected = (item) => {
    const tabIndex = modalTabs.indexOf(selectedTab);
    if (
      tabIndex > 0 && // Ensure tabIndex - 1 is valid
      userMealOptions["ENTREE"][tabIndex - 1] && // Ensure the element exists
      userMealOptions["ENTREE"][tabIndex - 1].name === item.name // Compare names
    ) {
      return true;
    }

    return false;
  };

  /**
 * Determines if the user can proceed to the next step in the meal building process based on the current tab and selections.
 * 
 * @returns {boolean} Returns `true` if the user has made valid selections and can proceed to the next tab, 
 *                   otherwise returns `false`.
 */ 
  const canProceedToNext = () => {
    if (selectedTab === "SIDE") {
      if (userMealOptions["SIDE"].length === 2) {
        return true;
      } else {
        return false;
      }
    } else {
      if (
        userMealOptions["ENTREE"][modalTabs.indexOf(selectedTab) - 1] &&
        modalTabs.indexOf(selectedTab) !== numOfComponents - 1
      ) {
        return true;
      } else {
        return false;
      }
    }
  };

  /**
 * Finalizes the order by passing the completed order to the order handler and closing the modal.
 * 
 * @param {Object} completedOrder - The completed order object that contains all the finalized details of the meal.
 * @returns {void} This function does not return anything.
 */ 
  const completeOrder = (completedOrder) => {
    orderHandler(completedOrder);
    onClose();
  };

  useEffect(() => {
    //console.log(selectedTab); //DELETE LATER
  }, [goBack]);

  useEffect(() => {
    setSelectedTab("SIDE");
    setVisitedTabs([false, false, false, false]);
    setUserMealOptions(generateUserMealOptions());
  }, [onClose]);

  useEffect(() => {
    console.log(visitedTabs);
  }, [visitedTabs]);
  useEffect(() => {
    console.log(userMealOptions);
  }, [userMealOptions]);

  return (
    <div className="w-full h-full flex flex-col font-sans">
      {/*Header*/}
      <div className="w-full h-[10%] bg-red-600 rounded-t-lg flex items-center justify-center">
        <button
          className="absolute left-3 top-2 text-white rounded-md font-semibold text-3xl hover:text-black"
          onClick={() => onClose()}
        >
          X
        </button>

        <p className="text-white text-2xl font-semibold">
          Build Your <u>{userMealOptions["MEAL"]?.[0]?.name || "Meal"}</u>{" "}
        </p>

        <button
          className={`${
            !visitedTabs[numOfComponents - 1]
              ? "opacity-0 pointer-events-none"
              : userMealOptions["SIDE"].length === 2
              ? ""
              : "opacity-0 pointer-events-none"
          }
                bg-white text-black rounded-md w-[20%] h-[6%]
                absolute right-2 top-3
                hover:bg-black hover:text-yellow-300
                text-md font-semibold`}
          onClick={() => completeOrder(userMealOptions)}
        >
          Complete {userMealOptions["MEAL"]?.[0]?.name || "Meal"}
        </button>
      </div>

      {/*Top Tab System */}
      <div className="w-full h-[30%] flex justify-center items-center border-b border-black shadow-sm shadow-black">
        <button
          className={`${
            modalTabs.indexOf(selectedTab) === 0
              ? "opacity-0 pointer-events-none"
              : ""
          } 
                rounded w-[10%] h-[30%] bg-red-600 text-white`}
          onClick={() => goBack()}
        >
          Go Back
        </button>

        <div className="w-[70%] h-full flex justify-center gap-4 ">
          {modalTabs.map((tabs, index) => (
            <div
              key={tabs}
              className={`${
                numOfComponents < index + 1 ? "hidden" : ""
              } w-[20%] h-[98%] flex flex-col items-center`}
            >
              <p>{tabs.charAt(0) + tabs.slice(1).toLowerCase()}</p>
              <div
                className={`${
                  selectedTab === tabs ? selectedStyle : normalStyle
                } 
	                    w-[100%] h-[80%] mt-1
                        flex items-center justify-center
                        2xl:text-5xl font-extrabold lg:text-4xl`}
              >
                {(() => {
                  if (tabs === "SIDE" && userMealOptions["SIDE"].length === 2) {
                    if (
                      userMealOptions["SIDE"][0].name !==
                      userMealOptions["SIDE"][1].name
                    ) {
                      return (
                        <div className="relative w-full h-full overflow-hidden">
                          <p className={tabItemStyle}>
                            1/2 {userMealOptions["SIDE"][0].name} <br /> 1/2{" "}
                            {userMealOptions["SIDE"][1].name}
                          </p>
                          <img
                            src={userMealOptions["SIDE"][0].itemImage}
                            alt={userMealOptions["SIDE"][0].name}
                            className="absolute w-full h-full object-cover transform scale-150  translate-y-4"
                          />
                          <img
                            src={userMealOptions["SIDE"][1].itemImage}
                            alt={userMealOptions["SIDE"][1].name}
                            className="absolute w-full h-full object-cover transform scale-150  translate-y-12"
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div className="relative w-full h-full overflow-hidden">
                          <p className={tabItemStyle}>
                            {userMealOptions["SIDE"][0].name}
                          </p>
                          <img
                            src={userMealOptions["SIDE"][0].itemImage}
                            alt={userMealOptions["SIDE"][0].name}
                            className="absolute w-full h-full object-cover transform scale-150  translate-y-12"
                          />
                        </div>
                      );
                    }
                  } else if (
                    tabs === "ENTREE 1" &&
                    userMealOptions["ENTREE"].length >= 1
                  ) {
                    return (
                      <div className="relative w-full h-full overflow-hidden">
                        <p className={tabItemStyle}>
                          {userMealOptions["ENTREE"][0].name}
                        </p>
                        <img
                          src={userMealOptions["ENTREE"][0].itemImage}
                          alt={userMealOptions["ENTREE"][0].name}
                          className="absolute w-full h-full object-cover transform scale-150  translate-y-9"
                        />
                      </div>
                    );
                  } else if (
                    tabs === "ENTREE 2" &&
                    userMealOptions["ENTREE"].length >= 2
                  ) {
                    return (
                      <div className="relative w-full h-full overflow-hidden">
                        <p className={tabItemStyle}>
                          {userMealOptions["ENTREE"][1].name}
                        </p>
                        <img
                          src={userMealOptions["ENTREE"][1].itemImage}
                          alt={userMealOptions["ENTREE"][1].name}
                          className="absolute w-full h-full object-cover transform scale-150  translate-y-9"
                        />
                      </div>
                    );
                  } else if (
                    tabs === "ENTREE 3" &&
                    userMealOptions["ENTREE"].length >= 3
                  ) {
                    return (
                      <div className="relative w-full h-full overflow-hidden">
                        <p className={tabItemStyle}>
                          {userMealOptions["ENTREE"][2].name}
                        </p>
                        <img
                          src={userMealOptions["ENTREE"][2].itemImage}
                          alt={userMealOptions["ENTREE"][2].name}
                          className="absolute w-full h-full object-cover transform scale-150  translate-y-9"
                        />
                      </div>
                    );
                  } else {
                    return <p>+</p>;
                  }
                })()}
              </div>
            </div>
          ))}
        </div>

        <button
          className={`${
            canProceedToNext() ? "" : "opacity-0 pointer-events-none"
          } 
                rounded w-[10%] h-[30%] bg-red-600 text-white`}
          onClick={() => changeSelectedTab(modalTabs.indexOf(selectedTab))}
        >
          Next
        </button>
      </div>

      {/*Tab System */}
      <div className="h-[60%] bg-amber-50 p-2">
        <div className=" w-[100%] h-[100%] overflow-auto pb-1 flex flex-col">
          {selectedTab === "SIDE" ? (
            <div>
              <div className="w-full flex gap-2">
                <p className="text-4xl font-semibold">Sides</p>
                <p className="text-lg flex items-end">
                  (Select 1 Full Side or 2 Half Sides)
                </p>
              </div>
              <div className="mt-1 grid grid-cols-4 grid-rows-auto gap-2">
                {sides.map((item) => (
                  <BuildYourMealCard
                    key={item.name}
                    item={item}
                    picture={item.itemImage}
                    isSelected={sideItemSelected(item)}
                    onAdd={addSideToOrder}
                    onRemove={removeSideFromOrder}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              {Object.keys(entreeCategories).map((category) => (
                <div>
                  <p className="mt-4 text-5xl font-semibold">{category}</p>
                  <div className="mt-5 grid grid-cols-4 grid-rows-auto gap-x-2 gap-y-5">
                    {entreeCategories[category].map((item) => (
                      <BuildYourMealCard
                        key={item.name}
                        item={item}
                        picture={item.itemImage}
                        isSelected={entreeItemSelected(item)}
                        onAdd={addEntreeToOrder}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * A menu for every regular item that allows to add multiple items at once to an order 
 * 
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.item - The menu item that displays on the modal 
 * @param {Function} props.addItemHandler - The function that adds the selected item to the order.
 * @param {Function} props.onClose - The function to close the item menu.
 * @param {number} props.remainingPoints - The number of points the user has remaining.
 * 
 * @returns {React.JSX.Element} A React component that renders the add multiple item menu.
 * 
 */
const AddItemMenu = ({ item, addItemHandler, onClose, remainingPoints }) => {
    const  [numberOfItems, setNumberOfItems] = useState(1);
    const [currentTotal, setCurrentTotal] = useState(parseFloat(item.price)); 

  /**
   * Increases the number of items selected and updates the total price.
   * This function also checks if the user has enough reward points to add another item of type "REWARD".
   * It prevents the user from selecting more items than they can afford based on their available points.
   * 
   * @returns {void}
   */ 
    const increaseCount = () => {
        let total = currentTotal;
        if(numberOfItems !== 99){
          // Prevent user from incrementing past how many items they have points for
          const nextPoints = (numberOfItems + 1) * item.rewardPoints; // Points needed after increment
          if (item.item_type === "REWARD" && nextPoints > remainingPoints) {
              console.log("Cannot add more items due to insufficient points.");
              return; // Prevent increment
          }

          setNumberOfItems(numberOfItems + 1);
          total = currentTotal + parseFloat(item.price); 
          setCurrentTotal(parseFloat(total.toFixed(2)));
        }
    }
    /**
    * Decreases the number of items selected and updates the total price.
    * The function ensures that the number of items cannot go below 1.
    * 
    * @returns {void}
    */ 
    const decreaseCount = () => {
        let total = currentTotal;
        if(numberOfItems !== 1){
            setNumberOfItems(numberOfItems - 1);
            total = currentTotal - parseFloat(item.price);
            setCurrentTotal(parseFloat(total.toFixed(2)));
        }
    }

    /**
    * Adds the selected item to the order based on the number of items.
    * This function calls the `addItemHandler` function for each item added.
    * After adding the items, it closes the menu.
    * 
    * @returns {void}
    */
    const addToOrder = () => {
        for(let i = 1; i <= numberOfItems; i++){
            addItemHandler(item);
        }
        onClose();
    }

  useEffect(() => {
    setNumberOfItems(1);
    setCurrentTotal(parseFloat(item.price));
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="w-full h-full flex flex-col">
      <div
        className="w-full h-[10%] bg-red-600 text-white text-semibold text-xl 2xl:text-3xl 
                    flex items-center rounded-t-md justify-center shadow-sm shadow-black"
      >
        {item.name}
        <button
          className="absolute left-3 top-2 2xl:top-4 hover:text-black"
          onClick={() => onClose()}
        >
          X
        </button>
      </div>

      {/*BODY*/}
      <div className = "w-full h-[75%] flex flex-col items-center">
        <img src = {item.itemImage} alt = {item.name} className='w-full border-b-2 h-[50%] mt-1 mb-1 object-contain'/>
        <div className="w-[35%] h-[15%] border border-black mt-8 rounded-full flex items-center justify-evenly font-semibold">
            <button className="text-4xl flex justify-center items-center h-[80%] w-[10%] hover:text-red-600" style={{transform: 'translateY(-4px)' }}
            onClick={() => decreaseCount()}>-</button>
            <p className="bg-red-600 w-[35px] h-[35px] rounded-full text-xl text-white flex items-center justify-center">{numberOfItems}</p>
            <button className="text-4xl flex justify-center items-center h-[100%] w-[10%] hover:text-red-600"
            onClick={() => increaseCount()}>+</button>
        </div>
        <p className="w-[30%] h-[12%] flex items-center justify-center font-semibold text-lg">
          {item.item_type === "REWARD" ? `${item.rewardPoints * numberOfItems} points` : `+$${parseFloat(currentTotal).toFixed(2)}`}  
        </p>
      </div>

      {/*FOOTER*/}
      <div className = "w-full h-[15%] bg-red-600 flex items-center justify-center shadow-sm shadow-black rounded-b-md">
        <div className = "w-[80%] h-[80%] rounded-md flex items-center justify-center bg-white hover:bg-black hover:text-yellow-300 font-semibold text-xl"
        onClick={() => addToOrder()}>Add to Order</div>
      </div>
    </div>
  );
};

/**
 * A menu for La Carte items that allows the selection of multiple La Carte sizes and adding multiple La Carte
 * to the order at once. 
 * 
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.item - The menu item that displays on the modal 
 * @param {Function} props.addItemHandler - The function that adds the selected item to the order.
 * @param {Function} props.onClose - The function to close the item menu.
 * 
 * @returns {React.JSX.Element} A React component that renders the add multiple item menu.
 * 
 */
const LaCarteMenu = ({item, menuItems, addItemHandler, onClose}) => {

  const laCarteList = menuItems.filter((item) => item.item_type === "LACARTE"); 

  const generateCarteList = () => {
    if(item.item_type === "SIDE"){
      return laCarteList.filter(item => item.name.includes("Side"));
    }else if (item.premium){
      return laCarteList.filter(item => item.name.includes("Premium"));
    }else{
      return laCarteList.filter(item => item.name.includes("Entree") && !item.name.includes("Premium"));
    }
  }
  const [carteList, setCarteList] = useState(generateCarteList());

  useEffect(() => {
    const newCarteList = generateCarteList();
    setCarteList(newCarteList);
  }, [item]);

  useEffect(() => {
    if (carteList.length > 0) {
      setSelectedSize(carteList[0]); // Select the first item in the new carteList
    }
  }, [carteList]);

  console.log("carteList is:", carteList);

  const [selectedSize, setSelectedSize] = useState(carteList.length > 0 ? carteList[0] : null);
  const  [numberOfItems, setNumberOfItems] = useState(1);
  const [currentTotal, setCurrentTotal] = useState(selectedSize ? parseFloat(selectedSize.price) : 0);

   /**
   * Increases the number of items selected and updates the total price.
   * 
   * @returns {void}
   */ 
  const increaseCount = () => {
    let total = currentTotal;
    if(numberOfItems !== 99){
        setNumberOfItems(numberOfItems + 1);
        total = currentTotal + parseFloat(selectedSize.price); 
        setCurrentTotal(parseFloat(total.toFixed(2)));
    }
  }

   /**
    * Decreases the number of items selected and updates the total price.
    * The function ensures that the number of items cannot go below 1.
    * 
    * @returns {void}
    */ 
  const decreaseCount = () => {
      let total = currentTotal;
      if(numberOfItems !== 1){
        setNumberOfItems(numberOfItems - 1);
        total = currentTotal - parseFloat(selectedSize.price);
        setCurrentTotal(parseFloat(total.toFixed(2)));
      }
  }

  /**
    * Adds the selected item to the order based on the number of items.
    * This function calls the `addItemHandler` function for each item added.
    * After adding the items, it closes the menu.
    * 
    * @returns {void}
    */
  const addToOrder = () => {
    for(let i = 1; i <= numberOfItems; i++){
      addItemHandler(selectedSize, item);
    }
    onClose();
  }

  useEffect(() => {
    setNumberOfItems(1);
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (selectedSize && selectedSize.price) {
      setCurrentTotal(parseFloat(selectedSize.price) * numberOfItems);
    }
  }, [selectedSize, numberOfItems]);

  return (
    <div className="w-full h-full flex flex-col">
      {/*HEADER*/}
      <div className="bg-red-600 w-full h-[10%] text-white rounded-t-md shadow-sm shadow-black flex items-center justify-center">
        <button
          className="absolute left-3 top-2 2xl:top-4 text-3xl hover:text-black"
          onClick={() => onClose()}
        >
          X
        </button>
        <div className="text-2xl font-semibold">{item.name}</div>
      </div>

      {/*BODY*/}
      <div className="w-full h-[80%] flex flex-col items-center">
        <img src = {item.itemImage} alt = {item.name} className='w-full border-b-2 h-[45%] mt-1 mb-1 object-contain'/>
        <div className="w-full h-[20%] flex justify-center mt-2 gap-3">
          {carteList.map(size => (
            <div className = {`${selectedSize === size ? "bg-red-600 text-white" : "bg-white"} shadow-sm shadow-black rounded-md w-[30%] h-full flex flex-col items-center justify-center border hover:border-red-600`}
            onClick={() => setSelectedSize(size)}>
              <p className="text-lg font-semibold">{size.name.split(" ")[0]} La Carte</p>
              <p className="text-lg ">+${size.price}</p>
            </div>
          ))}
        </div>
        <div className="w-[30%] h-[15%] bg-white border border-black shadow-sm shadow-black mt-6 rounded-full flex items-center justify-evenly font-semibold">
            <button className="text-4xl flex justify-center items-center h-[80%] w-[10%] hover:text-red-600" style={{transform: 'translateY(-4px)' }}
            onClick={() => decreaseCount()}>-</button>
            <p className="bg-red-600 w-[35px] h-[35px] rounded-full text-xl text-white flex items-center justify-center">{numberOfItems}</p>
            <button className="text-4xl flex justify-center items-center h-[100%] w-[10%] hover:text-red-600"
            onClick={() => increaseCount()}>+</button>
        </div>
        <p className="text-lg">+${parseFloat(currentTotal).toFixed(2)}</p>
      </div>

      {/*FOOTER*/}
      <div className = "w-full h-[10%] bg-red-600 flex items-center justify-center shadow-sm shadow-black rounded-b-md">
        <div className = "w-[80%] h-[80%] rounded-md flex items-center justify-center bg-white hover:bg-black hover:text-yellow-300 font-semibold text-xl"
        onClick={() => addToOrder()}>Add to Order</div>
      </div>
    </div>
  );
};

export { KioskModal, AddItemMenu, LaCarteMenu};
