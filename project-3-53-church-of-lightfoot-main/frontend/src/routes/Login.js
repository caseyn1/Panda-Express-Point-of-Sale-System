import React, { useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { UserContext } from "../context/UserContext";
import { executeGet, executePost } from "../util/Requests";

const Login = () => {
  const { user, setUser } = useContext(UserContext);
  /**
   * Handles the successful Google login.
   * @param {Object} credentialResponse - The response object from Google containing the user's credentials.
   * @returns {Promise<void>}
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));

      const userResponse = await executeGet(`employees/${payload.sub}`);
      console.log(userResponse);

      if (userResponse.message != "User not found") {
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
        alert("New account created! Please wait for your manager to assign you a role.");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  /**
   * Handles user sign out by clearing user data and local storage.
   * @returns {void}
   */
  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("userData");
    console.log("User signed out");
  };

  return (
    <div>
      {user ? (
        <>
          <button onClick={handleSignOut} className="text-lg font-bold text-white bg-red-500 p-2 rounded">
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
    </div>
  );
};

export default Login;
