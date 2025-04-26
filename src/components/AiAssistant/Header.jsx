import React from "react";
import { FaRobot } from "react-icons/fa";

function Header() {
  return (
    <header className="flex flex-col items-center py-8 mb-8">
      <div className="flex items-center mb-3">
        <FaRobot className="text-blue-600 text-3xl mr-3" />
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Chat with our Assistant
        </h1>
      </div>
      <p className="text-lg text-gray-600 mb-4 text-center">
        Simplifying the way you track and manage household items
      </p>
      <div className="w-full max-w-4xl border-b border-gray-200"></div>
    </header>
  );
}

export default Header;
