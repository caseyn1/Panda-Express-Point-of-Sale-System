import React, { useState, useEffect } from "react";

/**
 * Tabs container component that manages tab switching and active states
 * @param {Object} props - Component props
 * @param {string} props.active - Initially active tab label
 * @param {React.ReactElement[]} props.children - Tab components to be rendered
 * @returns {JSX.Element} A tabbed interface container
 */
const Tabs = ({ active, children }) => {
  const [activeTab, setActiveTab] = useState(active);

  // Sync activeTab with the active prop from parent component
  useEffect(() => {
    setActiveTab(active);
  }, [active]);

  const handleClick = (e, newActiveTab) => {
    e.preventDefault();
    setActiveTab(newActiveTab);
  };

  return (
    <div className="w-[85%] mx-auto">
      <div className="flex border-b border-gray-300">
        {children.map((child) => (
          <button
            key={child.props.label}
            className={`${activeTab === child.props.label ? "bg-gray-100 border-b-2 border-red-500" : ""} flex-1 text-gray-700 font-medium py-2`}
            onClick={(e) => handleClick(e, child.props.label)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="py-4">
        {children.map((child) => {
          if (child.props.label === activeTab) {
            return <div key={child.props.label}>{child.props.children}</div>;
          }
          return null;
        })}
      </div>
    </div>
  );
};

/**
 * Individual Tab component that represents a single tab panel
 * @param {Object} props - Component props
 * @param {string} props.label - Label text for the tab
 * @param {React.ReactNode} props.children - Content to be displayed when tab is active
 * @returns {JSX.Element} A tab panel container
 */
const Tab = ({ label, children }) => {
  return (
    <div label={label} className="hidden">
      {children}
    </div>
  );
};

export { Tabs, Tab };
