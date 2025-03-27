import React, { useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import LanguageSelector from "./LanguageSelector";
import { UserContext } from "../context/UserContext";
import { executePost, executeGet } from "../util/Requests";
import { Link } from "react-router-dom";

/**
 * Navigation bar component that handles user authentication and menu navigation
 * @component
 * @returns {JSX.Element} A responsive navigation bar with authentication and role-based navigation
 */
export const Navbar = () => {
  const { user, setUser } = useContext(UserContext);

  /**
   * Handles successful Google OAuth login
   * @param {Object} credentialResponse - Response from Google OAuth
   * @param {string} credentialResponse.credential - JWT token from Google
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));

      const userResponse = await executeGet(`employees/${payload.sub}`);
      console.log(userResponse);

      if (userResponse) {
        setUser({ email: userResponse.email, sub: userResponse.sub, role: userResponse.role });
        console.log("User retrieved successfully", userResponse);
      } else {
        await executePost("employees", {
          name: payload.name,
          userId: payload.sub,
          role: -1,
        });

        setUser({ email: payload.email, sub: payload.sub, role: -1 });
        console.log("New account created", { email: payload.email, sub: payload.sub, role: -1 });
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  /**
   * Handles user sign out by clearing user data from context and local storage
   */
  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("userData");
    console.log("User signed out");
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold">
              Panda Express
            </a>
            <div className="hidden md:block ml-10 space-x-4">
              {user && user.role == 0 && (
                <Link to="/KioskStart" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Kiosk
                </Link>
              )}
              {user && user.role >= 1 && (
                <Link to="/POS" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  POS
                </Link>
              )}
              {user && user.role >= 2 && (
                <Link to="/KitchenView" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Kitchen
                </Link>
              )}
              {user && user.role >= 3 && (
                <>
                  <Link to="/manager" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    Manager
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button onClick={handleSignOut} className="text-sm font-medium">
                  Sign Out
                </button>
              </>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.log("Login failed");
                }}
              />
            )}
            <button type="button" className="md:hidden text-gray-400 hover:text-white focus:outline-none focus:text-white" aria-label="Toggle menu">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
