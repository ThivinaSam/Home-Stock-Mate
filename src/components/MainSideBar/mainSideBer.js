import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  PlusCircleIcon, 
  ShoppingCartIcon, 
  CashIcon, 
  LightBulbIcon, 
  ChatIcon, 
  LogoutIcon,
  MenuIcon,
  XIcon 
} from '@heroicons/react/outline';
import { AuthContext } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

function MainSideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useContext(AuthContext);
  const [isHovered, setIsHovered] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Dispatch LOGOUT action to clear state
      dispatch({ type: "LOGOUT" });
      
      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const menuItems = [
    { name: 'Home', path: '/testHome', icon: HomeIcon },
    { name: 'Add Item', path: '/addItemHome', icon: PlusCircleIcon },
    { name: 'Get Item', path: '/getItems', icon: ShoppingCartIcon },
    { name: 'Finance', path: '/finance', icon: CashIcon },
    { name: 'Utility', path: '/utility', icon: LightBulbIcon },
    { name: 'Assistant', path: '/chat', icon: ChatIcon },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-2 left-4 z-20 bg-gray-800 text-white p-2 rounded-md shadow-lg hover:bg-gray-700 focus:outline-none"
      >
        {collapsed ? <MenuIcon className="h-6 w-6" /> : <XIcon className="h-6 w-6" />}
      </button>
      
      {/* Sidebar */}
      <div 
        className={`h-screen bg-gray-800 text-white fixed left-0 top-0 shadow-xl transition-all duration-300 ease-in-out z-10
          ${collapsed ? 'w-0 overflow-hidden' : 'w-64'}`}
      >
        {/* Logo Section */}
        <div className="p-6 flex justify-center text-xl font-bold mt-10">
          Home Stock Mate
        </div>
        
        {/* Menu Items */}
        <div className="mt-4 px-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <div
                key={index}
                className={`
                  flex items-center p-3 my-2 rounded-lg cursor-pointer transition-all duration-200
                  ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}
                  ${isHovered === index ? 'transform translate-x-2' : ''}
                `}
                onClick={item.onClick ? item.onClick : () => navigate(item.path)}
                onMouseEnter={() => setIsHovered(index)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <Icon className="h-6 w-6 mr-3" />
                <span className="font-medium">{item.name}</span>
              </div>
            );
          })}
        </div>
        
        {/* Logout Button (above footer) */}
        <div className="absolute bottom-16 w-full px-2">
          <div
            className={`
              flex items-center p-3 my-2 rounded-lg cursor-pointer transition-all duration-200
              hover:bg-gray-700
              ${isHovered === 'logout' ? 'transform translate-x-2' : ''}
            `}
            onClick={handleLogout}
            onMouseEnter={() => setIsHovered('logout')}
            onMouseLeave={() => setIsHovered(null)}
          >
            <LogoutIcon className="h-6 w-6 mr-3" />
            <span className="font-medium">Logout</span>
          </div>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 text-center text-gray-400 text-xs">
          <p>© 2025 Home Stock Mate</p>
          <p>Version 1.0</p>
        </div>
      </div>
      
      {/* Margin adjuster for content - pass this down */}
      <div id="content-wrapper" className={`transition-all duration-300 ease-in-out ${collapsed ? 'ml-0' : 'ml-64'}`}>
        {/* Content will go here */}
      </div>
    </>
  );
}

export default MainSideBar;