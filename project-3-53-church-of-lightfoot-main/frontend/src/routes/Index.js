import { Navbar } from "../components/Navbar";
import Snowfall from "react-snowfall";

export const Index = () => {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 overflow-hidden">
        <Snowfall />
        <h1 className="text-4xl font-bold text-center text-orange-600 mt-10">Welcome to Panda Express</h1>
        <p className="text-lg text-center text-gray-100 mt-4 px-4">
          Enjoy delicious Chinese cuisine with a modern twist. Order online or visit us today!
        </p>
        <footer className="mt-10 mb-4">
          <p className="text-sm text-gray-100">&copy; 2023 Panda Express. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};
