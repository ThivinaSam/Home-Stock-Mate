import React, { useEffect, useState } from "react";
import { db, storage } from "../../firebase";
import { Button, Container, Image, Loader, Icon } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import NavBar from "../AddItemNavBar/navBar";
import { collection, deleteDoc, onSnapshot, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import ModelComp from "./modelComp";
import AddItemModal from "./AddEditItemModal";
import MainSideBar from "../MainSideBar/mainSideBer";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Changed to import as side effect instead of named import

const AddItemsHome = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const unsub = onSnapshot(
      collection(db, "addItems"),
      (snapshot) => {
        let list = [];
        snapshot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setItems(list);
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  const handleModel = (item) => {
    setOpen(true);
    setItem(item);
  };

  // Filter items based on search query
  const filteredItems = items.filter((item) => {
    if (searchQuery === "") return true; // Show all items when search is empty

    const searchLower = searchQuery.toLowerCase();
    return (
      (item.item && item.item.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        // Find the item to get its image URL
        const itemToDelete = items.find((item) => item.id === id);

        // Close the modal
        setOpen(false);

        // Delete the Firestore document
        await deleteDoc(doc(db, "addItems", id));

        // If the item has an image, delete it from storage
        if (itemToDelete && itemToDelete.image) {
          try {
            // For a URL like https://firebasestorage.googleapis.com/...
            const imageUrl = new URL(itemToDelete.image);
            const pathWithQuery = imageUrl.pathname.split("/o/")[1];
            const imagePath = pathWithQuery
              ? decodeURIComponent(pathWithQuery.split("?")[0])
              : null;

            if (imagePath) {
              // Create a reference to the file
              const imageRef = ref(storage, imagePath);

              // Delete the file
              await deleteObject(imageRef);
              console.log("Image deleted successfully");
            }
          } catch (error) {
            console.error("Error deleting image:", error);
            // Continue with document deletion even if image deletion fails
          }
        }

        // Update the UI by filtering out the deleted item
        setItems(items.filter((item) => item.id !== id));
      } catch (error) {
        console.log("Error during deletion:", error);
      }
    }
  };

  // Enhanced PDF generation with a styled table
  const generatePDFWithStyledTable = async () => {
    setPdfLoading(true);

    try {
      console.log("Starting PDF generation with styled table...");

      // Create a new PDF document
      const doc = new jsPDF();

      const today = new Date();
      const formattedDate = today.toLocaleDateString();
      const formattedTime = today.toLocaleTimeString();

      // Set font styles for header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);

      // Add title
      doc.text("Home Stock Inventory Report", 105, 15, { align: "center" });

      // Add summary
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Items: ${filteredItems.length}`, 20, 30);

      // Calculate total value
      let totalValue = 0;
      try {
        totalValue = filteredItems.reduce((sum, item) => {
          const price = parseFloat(item.price) || 0;
          const quantity = parseInt(item.quantity) || 0;
          return sum + price * quantity;
        }, 0);
      } catch (err) {
        console.error("Error calculating total value:", err);
      }

      doc.text(`Total Value: LKR ${totalValue.toFixed(2)}`, 20, 40);

      // Add date generated
      doc.text(`Generated on: ${formattedDate} at ${formattedTime}`, 20, 50);

      // Create table data - REMOVED "Image" column
      const tableColumn = [
        "Item Name",
        "Description",
        "Date Added",
        "Qty",
        "Price",
        "Total",
      ];

      // Prepare table rows data
      const tableRows = [];

      // Process items for the table - REMOVED image placeholder
      for (const item of filteredItems) {
        const itemData = [
          item.item || "Unnamed Item",
          item.description
            ? item.description.length > 30
              ? item.description.substring(0, 27) + "..."
              : item.description
            : "No description",
          item.date || "N/A",
          item.quantity || "0",
          `LKR ${parseFloat(item.price || 0).toFixed(2)}`,
          `LKR ${(
            parseFloat(item.price || 0) * parseInt(item.quantity || 0)
          ).toFixed(2)}`,
        ];

        tableRows.push(itemData);
      }

      // Generate the table - matching the styling from your UI
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: "grid",
        headStyles: {
          fillColor: [52, 152, 219], // #3498db color
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
          fontSize: 10,
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4,
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250], // Light gray for alternate rows
        },
        columnStyles: {
          0: {
            // Item name (was index 1)
            cellWidth: 40,
          },
          1: {
            // Description (was index 2)
            cellWidth: 50,
          },
          2: {
            // Date (was index 3)
            cellWidth: 25,
            halign: "left",
          },
          3: {
            // Quantity (was index 4)
            cellWidth: 15,
            halign: "center",
          },
          4: {
            // Price (was index 5)
            cellWidth: 25,
            halign: "right",
          },
          5: {
            // Total (was index 6)
            cellWidth: 25,
            halign: "right",
          },
        },
        didDrawPage: (data) => {
          // Add page numbers
          doc.setFontSize(10);
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        },
      });

      // Add a footer to the document
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 60;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "This report was generated by Home Stock Mate application.",
        105,
        finalY,
        { align: "center" }
      );

      // Save the PDF
      doc.save("home-stock-inventory-table.pdf");
      console.log("PDF with styled table saved successfully");
    } catch (error) {
      console.error("Error generating PDF with styled table:", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div>
      <MainSideBar />
      {/* <NavBar refreshItems={() => setLoading(true)} /> */}
      <h2 className="mt-6">Add Item</h2>
      <div>
        <Container>
          {/* Search and Download Button Row */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {filteredItems.length === 0 && searchQuery && (
                <p className="text-red-500 mt-2">
                  No items match your search criteria.
                </p>
              )}
            </div>

            {/* Download PDF Button */}
            <Button primary onClick={() => setAddItemModalOpen(true)}>Add New Item</Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader active inline="centered" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                {/* Table Header - Enhanced styling */}
                <thead className="bg-[#3498db] text-white">
                  <tr>
                    <th className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider w-20">
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mb-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Image
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                        Item Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h7"
                          />
                        </svg>
                        Description
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Date Added
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                          />
                        </svg>
                        Quantity
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Price
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">
                      <div className="flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>

                {/* Table Body - Enhanced row styling */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-gray-400 mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          {searchQuery ? (
                            <p className="text-lg font-medium">
                              No items match your search criteria.
                            </p>
                          ) : (
                            <p className="text-lg font-medium">
                              No items available. Add your first item!
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition-colors duration-150 ease-in-out`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            <img
                              src={
                                item.image ||
                                "https://react.semantic-ui.com/images/wireframe/image.png"
                              }
                              alt={item.item}
                              className="h-14 w-14 rounded-full object-cover border-2 border-gray-200 shadow-sm hover:border-blue-400 transition-all duration-200 transform hover:scale-110"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.item}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {item.description || "No description available"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {item.date || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {item.quantity || "0"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            LKR {parseFloat(item.price || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedItemId(item.id);
                                setAddItemModalOpen(true);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleModel(item)}
                              className="bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Download PDF Button */}
              <div className="flex justify-end m-6">
                <Button
                  primary
                  onClick={generatePDFWithStyledTable}
                  disabled={filteredItems.length === 0 || pdfLoading}
                  loading={pdfLoading}
                >
                  <Icon name="file pdf outline" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}

          <ModelComp
            open={open}
            setOpen={setOpen}
            item={item}
            handleDelete={handleDelete}
          />

          <AddItemModal
            open={addItemModalOpen}
            setOpen={setAddItemModalOpen}
            itemId={selectedItemId}
            refreshItems={() => setLoading(true)}
          />
        </Container>
      </div>
    </div>
  );
};

export default AddItemsHome;
