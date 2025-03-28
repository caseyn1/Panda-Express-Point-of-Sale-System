import React, { useState, useEffect } from "react";

/**
 * A component that renders tab content for the kiosk interface.
 * It conditionally renders the content based on the active tab.
 * 
 * @component
 * @param {Object} props - React props passed to the component.
 * @param {boolean} props.active - A flag indicating whether the tab is active.
 * @param {React.JSX.Element} props.children - The content to be rendered within the tab.
 * 
 * @returns {React.JSX.Element} A React component that conditionally displays the content based on the active prop.
 */ 
const KioskTabs = ({ active, children }) => {
  const iconStyle = `w-auto h-full object-cover -mt-1`;
  const [activeTab, setActiveTab] = useState(active);
  const tabHeight = children.length === 4 ? "20%" : children.length === 5 ? "18%" : `${100 / children.length}%`; // Dynamically sets tab height to fit my reards tab if user signs in

  useEffect(() => {
    setActiveTab(active);
  }, [active]);

  /**
 * Handles the click event for switching tabs in the kiosk interface.
 * Prevents the default behavior and updates the active tab state based on the provided tab identifier.
 * 
 * @param {Object} e - The event object generated by the click event.
 * @param {string} newActiveTab - The identifier of the new active tab to be set.
 * 
 * @returns {void} This function does not return any value.
 */ 
  const handleClick = (e, newActiveTab) => {
    e.preventDefault();
    setActiveTab(newActiveTab);
  };

  return (
    <div className="w-full h-[80%] flex font-sans">
      <div className="w-[15%] h-full flex flex-col items-center shadow-sm shadow-black ">
        {/*TABS*/}
        {children.map((child) => (
          <button
            key={child.props.label}
            className={`${
              activeTab === child.props.label ? "bg-red-600 text-white" : "bg-white text-black"
            } w-[80%] flex flex-col items-center justify-center
                        rounded-md shadow-sm shadow-black
                        font-semibold 2xl:text-2xl ${ children.length === 5 ? "mt-2" : "mt-5" } `}
            style={{ height: tabHeight }}
            onClick={(e) => handleClick(e, child.props.label)}
          >
            {child.props.label}
            <div className="w-full h-[75%] flex items-center justify-center">
              {(() => {
                if (child.props.label === "Build Your Meal") {
                  return (
                    <img
                      className={iconStyle}
                      alt = "Build Your Meal Tab"
                      src="/ImageFolder/build_your_own1.png"
                    />
                  );
                } else if (child.props.label === "Appetizers") {
                  return (
                    <img
                      className={iconStyle}
                      alt = "Appetizer Tab"
                      src="/ImageFolder/appetizer.png"
                    />
                  );
                } else if (child.props.label === "Drinks"){
                  return (
                    <img
                      className={iconStyle}
                      alt="Drink Tab"
                      src="/ImageFolder/drink.png"
                    />
                  );
                }else if (child.props.label === "La Carte") {
                  return (
                    <img
                      className={iconStyle}
                      alt="La Carte Tab"
                      src="/ImageFolder/la_carte.png"
                    />
                  );
                }
                else {
                  return (
                    <img
                      className={iconStyle}
                      alt="Rewards Tab"
                      src="/ImageFolder/rewards_icon.png"
                    />
                  );
                }
              })()}
            </div>
          </button>
        ))}
      </div>
      <div className="w-[85%] h-[100%]">
        {children.map((child) => {
          if (child.props.label === activeTab && child.props.label !== "La Carte") {
            return (
              <div key={child.props.label} className="w-full h-full">

                {/*HEADER OF TAB*/}
                <p className="ml-2 mt-2 2xl:text-5xl lg:text-4xl font-semibold">
                  {child.props.label}
                </p>

                {/*CONTENTS OF TAB*/}
                <div className="w-full 2xl:h-[625px] lg:h-[390px] pb-5 overflow-y-scroll">
                  <div className=" mt-3 mr-2 ml-2 grid grid-cols-3 grid-rows-auto gap-x-[2%] gap-y-[2%]">
                  {child.props.children}
                  </div>
                </div>
              </div>
            );
          }else if (child.props.label === activeTab && child.props.label === "La Carte") {
            return (
              <div key={child.props.label} className="w-full h-full">

                {/*HEADER OF TAB*/}
                <div className="ml-2 mt-2 flex items-end">
                  <p className="2xl:text-5xl lg:text-4xl font-semibold">{child.props.label}</p>
                  <p className="2xl:text-2xl lg:text-xl "> (Individual Sides or Entrees)</p>
                </div>

                {/*CONTENTS OF TAB*/}
                <div className="w-full 2xl:h-[625px] lg:h-[390px] pb-5 overflow-y-scroll ">
                  <div className=" mt-3 mr-2 ml-2 grid grid-cols-4 grid-rows-auto gap-x-[2%] gap-y-[2%]">
                  {child.props.children}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

const KioskTab = ({ label, children }) => {
  return (
    <div label={label} className="hidden">
      {children}
    </div>
  );
};

export { KioskTabs, KioskTab };
