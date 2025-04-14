import React, { useState, useEffect } from "react";
import "./testHome.css";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  limit,
  orderBy,
  where,
} from "firebase/firestore";
import MainSideBar from "../MainSideBar/mainSideBer";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaMoneyBillWave,
  FaBolt,
  FaBell,
  FaCalendarAlt,
  FaChartLine,
  FaSearch,
} from "react-icons/fa";

// Summary card component
const SummaryCard = ({ title, icon, count, recentItems, color, onClick }) => (
  <div
    className={`bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-200 cursor-pointer`}
    onClick={onClick}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className={`p-2 rounded-full ${color}`}>{icon}</div>
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
            <li key={index} className="truncate">
              • {item.name || item.title || item.item || item.description}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// Notification component for alerts
const NotificationItem = ({ title, message, date, isNew }) => (
  <div className={`p-4 border-b ${isNew ? "bg-blue-50" : ""}`}>
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
      <span className="text-xs text-gray-500">{date}</span>
    </div>
  </div>
);

// Quick action button component
const QuickActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-4 hover:bg-gray-50 transition-colors"
  >
    <div className="text-blue-600 mb-2">{icon}</div>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
);

function Home() {
  const [summaryData, setSummaryData] = useState({
    inventory: { count: 0, recentItems: [] },
    consumption: { count: 0, recentItems: [] },
    finance: { count: 0, recentItems: [] },
    utility: { count: 0, recentItems: [] },
  });
  const [expiringItems, setExpiringItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  // Get current date and date 7 days from now for expiration check
  const currentDate = new Date();
  const nextWeekDate = new Date();
  nextWeekDate.setDate(currentDate.getDate() + 7);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        // Fetch inventory items (using "addItems" collection from your code)
        const inventoryRef = collection(db, "addItems");
        const inventoryQuery = query(
          inventoryRef,
          orderBy("timestamp", "desc"),
          limit(3)
        );
        const inventorySnapshot = await getDocs(inventoryQuery);
        const inventoryItems = inventorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch consumption items (using "getItems" collection)
        const consumptionRef = collection(db, "getItems");
        const consumptionQuery = query(
          consumptionRef,
          orderBy("timestamp", "desc"),
          limit(3)
        );
        const consumptionSnapshot = await getDocs(consumptionQuery);
        const consumptionItems = consumptionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch finance items
        const financeRef = collection(db, "finance");
        const financeQuery = query(
          financeRef,
          orderBy("timestamp", "desc"),
          limit(3)
        );
        const financeSnapshot = await getDocs(financeQuery);
        const financeItems = financeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch utility items
        const utilityRef = collection(db, "utility");
        const utilityQuery = query(
          utilityRef,
          orderBy("timestamp", "desc"),
          limit(3)
        );
        const utilitySnapshot = await getDocs(utilityQuery);
        const utilityItems = utilitySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSummaryData({
          inventory: {
            count: inventorySnapshot.size,
            recentItems: inventoryItems,
          },
          consumption: {
            count: consumptionSnapshot.size,
            recentItems: consumptionItems,
          },
          finance: {
            count: financeSnapshot.size,
            recentItems: financeItems,
          },
          utility: {
            count: utilitySnapshot.size,
            recentItems: utilityItems,
          },
        });

        // Check for items expiring within the next week
        const expiryCheckQuery = query(
          collection(db, "addItems"),
          where("expiryDate", ">=", currentDate.toISOString().split("T")[0]),
          where("expiryDate", "<=", nextWeekDate.toISOString().split("T")[0]),
          limit(5)
        );

        const expirySnapshot = await getDocs(expiryCheckQuery);
        const expiring = expirySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExpiringItems(expiring);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };

    fetchSummaryData();
  }, []);

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Search in inventory (addItems)
      const inventoryRef = collection(db, "addItems");
      const inventoryQuery = query(
        inventoryRef,
        where("item", ">=", searchQuery),
        where("item", "<=", searchQuery + "\uf8ff"),
        limit(5)
      );
      const inventorySnapshot = await getDocs(inventoryQuery);
      const inventoryResults = inventorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "Inventory",
      }));

      setSearchResults(inventoryResults);
    } catch (error) {
      console.error("Error searching items:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainSideBar />
      <div className="lg:ml-64 p-6">
        {/* Header section with enhanced styling */}
        <header className="mb-10 bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </span>
            <div className="ml-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          </h1>
          <p className="text-gray-600 text-lg ml-1 leading-relaxed">
            Welcome to{" "}
            <span className="font-medium text-blue-600">Home Stock Mate</span>,
            <span className="italic">
              {" "}
              your household inventory management system
            </span>
          </p>
        </header>

        {/* Search section */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search for items..."
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                className="absolute right-3 top-3 text-gray-500"
                onClick={handleSearch}
              >
                <FaSearch />
              </button>
            </div>
            <button
              className="ml-3 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Search Results</h3>
              <div className="divide-y">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="py-2 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.item}</p>
                      <p className="text-sm text-gray-600">
                        {item.type} • Quantity: {item.quantity}
                      </p>
                    </div>
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => navigate(`/addItemHome?id=${item.id}`)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <QuickActionButton
              icon={<FaBoxOpen size={22} />}
              label="Add Item"
              onClick={() => navigate("/addItemHome")}
            />
            <QuickActionButton
              icon={<FaShoppingCart size={22} />}
              label="Get Item"
              onClick={() => navigate("/getItems")}
            />
            <QuickActionButton
              icon={<FaChartLine size={22} />}
              label="Reports"
              onClick={() => navigate("/reports")}
            />
            <QuickActionButton
              icon={<FaMoneyBillWave size={22} />}
              label="Finance"
              onClick={() => navigate("/finance")}
            />
            <QuickActionButton
              icon={<FaBolt size={22} />}
              label="Utilities"
              onClick={() => navigate("/utility")}
            />
            <QuickActionButton
              icon={<FaCalendarAlt size={22} />}
              label="Calendar"
              onClick={() => navigate("/calendar")}
            />
          </div>
        </section>

        {/* Summary Cards Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Inventory Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Inventory Summary */}
            <SummaryCard
              title="Inventory"
              icon={<FaBoxOpen className="h-6 w-6 text-white" />}
              count={summaryData.inventory.count}
              recentItems={summaryData.inventory.recentItems}
              color="bg-blue-500"
              onClick={() => navigate("/addItemHome")}
            />

            {/* Consumption Summary */}
            <SummaryCard
              title="Consumption"
              icon={<FaShoppingCart className="h-6 w-6 text-white" />}
              count={summaryData.consumption.count}
              recentItems={summaryData.consumption.recentItems}
              color="bg-green-500"
              onClick={() => navigate("/getItems")}
            />

            {/* Finance Summary */}
            <SummaryCard
              title="Finance"
              icon={<FaMoneyBillWave className="h-6 w-6 text-white" />}
              count={summaryData.finance.count}
              recentItems={summaryData.finance.recentItems}
              color="bg-yellow-500"
              onClick={() => navigate("/finance")}
            />

            {/* Utility Summary */}
            <SummaryCard
              title="Utility"
              icon={<FaBolt className="h-6 w-6 text-white" />}
              count={summaryData.utility.count}
              recentItems={summaryData.utility.recentItems}
              color="bg-purple-500"
              onClick={() => navigate("/utility")}
            />
          </div>
        </section>

        {/* Split section: Expiring items and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expiring Items */}
          <section className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Items Expiring Soon</h2>
              <FaBell className="text-yellow-500" />
            </div>

            {expiringItems.length > 0 ? (
              <div className="divide-y">
                {expiringItems.map((item) => (
                  <div key={item.id} className="py-3">
                    <div className="flex justify-between">
                      <p className="font-medium">{item.item}</p>
                      <span className="text-red-500 text-sm">
                        {formatDate(item.expiryDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4">
                No items expiring in the next 7 days
              </p>
            )}

            <div className="mt-4 text-right">
              <button
                className="text-blue-600 text-sm font-medium hover:text-blue-800"
                onClick={() => navigate("/reports/expiring")}
              >
                View all expiring items →
              </button>
            </div>
          </section>

          {/* Recent Activity/Notifications */}
          <section className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <FaCalendarAlt className="text-blue-500" />
            </div>

            <div className="divide-y">
              <NotificationItem
                title="Inventory Updated"
                message="3 new items added to your inventory"
                date="Today"
                isNew={true}
              />
              <NotificationItem
                title="Item Consumed"
                message="2 items marked as consumed from kitchen"
                date="Yesterday"
                isNew={true}
              />
              <NotificationItem
                title="Expiring Soon"
                message="Milk expires in 2 days"
                date="2 days ago"
                isNew={false}
              />
              <NotificationItem
                title="Monthly Report"
                message="Your March consumption report is ready"
                date="1 week ago"
                isNew={false}
              />
            </div>

            <div className="mt-4 text-right">
              <button
                className="text-blue-600 text-sm font-medium hover:text-blue-800"
                onClick={() => navigate("/notifications")}
              >
                View all notifications →
              </button>
            </div>
          </section>
        </div>

        {/* Recent transactions or activity log */}
        <section className="bg-white rounded-lg shadow-md p-5 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  ...summaryData.consumption.recentItems,
                  ...summaryData.inventory.recentItems,
                ]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 5)
                  .map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.timestamp
                          ? new Date(
                              item.timestamp.toDate()
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.item}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.category === "Food"
                              ? "bg-green-100 text-green-800"
                              : item.category === "Cleaning"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.action ||
                          (summaryData.inventory.recentItems.some(
                            (i) => i.id === item.id
                          )
                            ? "Added"
                            : "Consumed")}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-right">
            <button
              className="text-blue-600 text-sm font-medium hover:text-blue-800"
              onClick={() => navigate("/transactions")}
            >
              View all transactions →
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2025 Home Stock Mate. All rights reserved.</p>
          <p className="mt-1">
            Simplifying the way you track and manage household items
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Home;
