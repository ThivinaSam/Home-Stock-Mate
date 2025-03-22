import React, { useState, useEffect } from "react";
import { Table, Button } from "semantic-ui-react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import MainSideBar from "../MainSideBar/mainSideBer";

const GetItemsHome = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRemovedItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "getItems"));
        const itemsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(itemsList);
      } catch (error) {
        console.error("Error fetching removed items:", error);
      }
    };

    fetchRemovedItems();
  }, []);

  const handleEdit = (itemId) => {
    // Navigate to the edit page with the item ID
    navigate(`/updateGetItem/${itemId}`);
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteDoc(doc(db, "getItems", itemId));
      setItems(items.filter((item) => item.id !== itemId)); // Remove the item from the state
      console.log("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div>
      <MainSideBar />
      <h2>Removed Items</h2>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Item</Table.HeaderCell>
            <Table.HeaderCell>Description</Table.HeaderCell>
            <Table.HeaderCell>Quantity</Table.HeaderCell>
            <Table.HeaderCell>Price</Table.HeaderCell>
            <Table.HeaderCell>Date Moved</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell> {/* Added Actions column */}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.item}</Table.Cell>
              <Table.Cell>{item.description}</Table.Cell>
              <Table.Cell>{item.quantity}</Table.Cell>
              <Table.Cell>{item.price}</Table.Cell>
              <Table.Cell>{item.movedAt ? item.movedAt.toDate().toLocaleString() : "N/A"}</Table.Cell>
              <Table.Cell>
                {/* Action Buttons */}
                <Button color="blue" onClick={() => handleEdit(item.id)}>
                  Edit
                </Button>
                <Button color="red" onClick={() => handleDelete(item.id)}>
                  Delete
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default GetItemsHome;
