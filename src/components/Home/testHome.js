import React from "react";
import "./testHome.css";
import { db } from "../../firebase";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { useState, useEffect } from "react";
import MainSideBar from "../MainSideBar/mainSideBer";
import { useNavigate } from 'react-router-dom';

// Summary card component
const SummaryCard = ({ title, icon, count, recentItems, color, onClick }) => (
  <div 
    className={`bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-200 cursor-pointer`}
    onClick={onClick}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className={`p-2 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
    <div className="mb-4">
      <p className="text-gray-600">Total Count</p>
      <p className="text-3xl font-bold">{count}</p>
    </div>
    {recentItems && recentItems.length > 0 && (
      <div>
        <p className="text-gray-600 mb-2">Recent Items</p>
        <ul className="text-sm space-y-1">
          {recentItems.map((item, index) => (
            <li key={index} className="truncate">• {item.name || item.title || item.description}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

function Home() {
  const [summaryData, setSummaryData] = useState({
    inventory: { count: 0, recentItems: [] },
    consumption: { count: 0, recentItems: [] },
    finance: { count: 0, recentItems: [] },
    utility: { count: 0, recentItems: [] }
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        // Fetch inventory items
        const inventoryRef = collection(db, "inventory");
        const inventoryQuery = query(inventoryRef, orderBy("createdAt", "desc"), limit(3));
        const inventorySnapshot = await getDocs(inventoryQuery);
        const inventoryItems = inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch consumption items
        const consumptionRef = collection(db, "consumption");
        const consumptionQuery = query(consumptionRef, orderBy("createdAt", "desc"), limit(3));
        const consumptionSnapshot = await getDocs(consumptionQuery);
        const consumptionItems = consumptionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch finance items
        const financeRef = collection(db, "finance");
        const financeQuery = query(financeRef, orderBy("date", "desc"), limit(3));
        const financeSnapshot = await getDocs(financeQuery);
        const financeItems = financeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch utility items
        const utilityRef = collection(db, "utility");
        const utilityQuery = query(utilityRef, orderBy("date", "desc"), limit(3));
        const utilitySnapshot = await getDocs(utilityQuery);
        const utilityItems = utilitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setSummaryData({
          inventory: { 
            count: inventorySnapshot.size, 
            recentItems: inventoryItems 
          },
          consumption: { 
            count: consumptionSnapshot.size, 
            recentItems: consumptionItems 
          },
          finance: { 
            count: financeSnapshot.size, 
            recentItems: financeItems 
          },
          utility: { 
            count: utilitySnapshot.size, 
            recentItems: utilityItems 
          }
        });
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };
    
    fetchSummaryData();
  }, []);
  
  return (
    <div>
      <MainSideBar />
      <div className="ml-64 p-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Inventory Summary */}
          <SummaryCard 
            title="Inventory" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>}
            count={summaryData.inventory.count}
            recentItems={summaryData.inventory.recentItems}
            color="bg-blue-500"
            onClick={() => navigate('/addItemHome')}
          />
          
          {/* Consumption Summary */}
          <SummaryCard 
            title="Consumption" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>}
            count={summaryData.consumption.count}
            recentItems={summaryData.consumption.recentItems}
            color="bg-green-500"
            onClick={() => navigate('/getItems')}
          />
          
          {/* Finance Summary */}
          <SummaryCard 
            title="Finance" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>}
            count={summaryData.finance.count}
            recentItems={summaryData.finance.recentItems}
            color="bg-yellow-500"
            onClick={() => navigate('/finance')}
          />
          
          {/* Utility Summary */}
          <SummaryCard 
            title="Utility" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>}
            count={summaryData.utility.count}
            recentItems={summaryData.utility.recentItems}
            color="bg-purple-500"
            onClick={() => navigate('/utility')}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
