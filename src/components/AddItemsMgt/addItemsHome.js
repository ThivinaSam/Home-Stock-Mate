import React, { useEffect, useState } from "react";
import { db, storage } from "../../firebase";
import {
  Button,
  Container,
  Image,
  Table,
  Loader,
} from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import NavBar from "../AddItemNavBar/navBar";
import { collection, deleteDoc, onSnapshot, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import ModelComp from "./modelComp";
import AddItemModal from "./AddEditItemModal";
import MainSideBar from "../MainSideBar/mainSideBer";

const AddItemsHome = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to refresh items list
  const refreshItems = () => {
    setLoading(true);
    // You can re-fetch data if needed, but the onSnapshot should handle updates automatically
  };

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
    if (searchQuery === '') return true; // Show all items when search is empty
    
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
          // Extract the path from the full URL
          // Firebase Storage URLs typically contain a path like "gs://bucket-name/path/to/file.jpg"
          // or https://firebasestorage.googleapis.com/v0/b/bucket-name/o/path%2Fto%2Ffile.jpg

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

  return (
    <div>
      <MainSideBar />
      <NavBar refreshItems={refreshItems} />
      <div className="ml-64 p-4"> {/* Add margin to account for sidebar */}
        <Container>
          {/* Search Bar */}
          <div className="mb-6 relative">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {filteredItems.length === 0 && searchQuery && (
              <p className="text-red-500 mt-2">No items match your search criteria.</p>
            )}
          </div>

          {loading ? (
            <Loader active inline="centered" />
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Image</Table.HeaderCell>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Description</Table.HeaderCell>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell>Quantity</Table.HeaderCell>
                  <Table.HeaderCell>Price</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {filteredItems.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <Image
                        src={
                          item.image ||
                          "https://react.semantic-ui.com/images/wireframe/image.png"
                        }
                        size="tiny"
                        circular
                        style={{ width: "50px", height: "50px" }}
                      />
                    </Table.Cell>
                    <Table.Cell>{item.item}</Table.Cell>
                    <Table.Cell>{item.description}</Table.Cell>
                    <Table.Cell>{item.date}</Table.Cell>
                    <Table.Cell>{item.quantity}</Table.Cell>
                    <Table.Cell>{item.price}</Table.Cell>
                    <Table.Cell>
                      <Button
                        color="green"
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setAddItemModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button color="purple" onClick={() => handleModel(item)}>
                        View
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
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
            refreshItems={refreshItems}
          />
        </Container>
      </div>
    </div>
  );
};

export default AddItemsHome;
