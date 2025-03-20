import React, { useEffect, useState } from "react";
import { db, storage } from "../../firebase";
import {
  Button,
  // Card,
  // Grid,
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
import AddItemModal from "./AddEditItemModal"; // Import the AddItemModal component

const AddItemsHome = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false); // State for AddItemModal
  const [selectedItemId, setSelectedItemId] = useState(null); // State for selected item ID

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
      <NavBar refreshItems={refreshItems} />
      <Container style={{ marginTop: "20px" }}>
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
              {items &&
                items.map((item) => (
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

        {/* Add the modal component outside of the map function */}
        {/* <Modal open={open} onClose={() => setOpen(false)}>
        <Modal.Header>Item Details</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            {item.image && (
              <Image
                src={item.image}
                size="medium"
                centered
                style={{ marginBottom: "20px" }}
              />
            )}
            <h3>Name: {item.item}</h3>
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Date:</strong> {item.date}</p>
            <p><strong>Price:</strong> {item.price}</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color="red" onClick={() => setOpen(false)}>
            Close
          </Button>
        </Modal.Actions>
      </Modal> */}
      </Container>
    </div>
  );
};

export default AddItemsHome;
