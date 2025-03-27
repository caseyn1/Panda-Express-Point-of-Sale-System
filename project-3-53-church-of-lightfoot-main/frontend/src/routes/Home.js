import React, { useContext } from "react";
import Snowfall from "react-snowfall";
import { UserContext } from "../context/UserContext";
import { Link } from "react-router-dom";
import { executePost, executeGet } from "../util/Requests";
import { GoogleLogin } from "@react-oauth/google";
import Login from "./Login";

export const Home = () => {
  const { user, setUser } = useContext(UserContext);

  return (
    <>
      {/* <Navbar /> */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 overflow-hidden">
        <Snowfall />
        <Login />

        <div className="w-3/4 h-[70vh]">
          <div className="grid grid-cols-3 gap-4 h-full">
            {user && user.role >= 0 && (
              <Link
                to="/KioskStart"
                className="bg-red-200 p-8 rounded-lg text-center text-black hover:bg-red-300 text-2xl h-full flex items-center justify-center"
              >
                Kiosk
              </Link>
            )}
            <Link
              to="/menuboard"
              className="bg-red-200 p-8 rounded-lg text-center text-black hover:bg-red-300 text-2xl h-full flex items-center justify-center"
            >
              Menu Board
            </Link>
            {user && user.role >= 1 && (
              <Link
                to="/POS"
                className="bg-red-200 p-8 rounded-lg text-center text-black hover:bg-red-300 text-2xl h-full flex items-center justify-center"
              >
                POS
              </Link>
            )}
            {user && user.role >= 2 && (
              <Link
                to="/KitchenView"
                className="bg-red-200 p-8 rounded-lg text-center text-black hover:bg-red-300 text-2xl h-full flex items-center justify-center"
              >
                Kitchen
              </Link>
            )}
            {user && user.role >= 3 && (
              <Link
                to="/manager"
                className="bg-red-200 p-8 rounded-lg text-center text-black hover:bg-red-300 text-2xl h-full flex items-center justify-center"
              >
                Manager
              </Link>
            )}
            {/* Additional links can be added here if needed */}
          </div>
        </div>
      </div>
    </>
  );
};
