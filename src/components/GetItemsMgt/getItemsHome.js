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

  // Format date string to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString || "N/A";
    }
  };

  return (
    <div>
      <MainSideBar />
      <h2>Retrieved Items</h2>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Item</Table.HeaderCell>
            <Table.HeaderCell>Expiry Date</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Quantity</Table.HeaderCell>
            <Table.HeaderCell>Date Retrieved</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.item}</Table.Cell>
              <Table.Cell>{item.exDate}</Table.Cell>
              <Table.Cell>{item.statuss}</Table.Cell>
              <Table.Cell>{item.qty}</Table.Cell>
              <Table.Cell>{formatDate(item.getDate)}</Table.Cell>
              <Table.Cell>
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
