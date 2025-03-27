import React from "react";
import Footer from "./Footer.js";
import Allergy from "./Allergy.js";

/**
 * MenuHeader Component
 * @description Displays the header section of the menu, including the Panda Express logo, a welcome message, the weather section (via the Footer component), and an allergy information section.
 *
 * @component
 *
 * @returns {React.JSX.Element} A React component representing the menu header.
 */
const MenuHeader = () => (
  <section className="logo-section">
    <img src="/ImageFolder/logo2.webp" alt="Panda Express Logo" />
    <div className="logo-text">Welcome To Panda Express</div>
    <div className="weather">
      <Footer />
    </div>
    <div className = "allergy-container">
      <Allergy />
    </div>
  </section>
);

export default MenuHeader;
