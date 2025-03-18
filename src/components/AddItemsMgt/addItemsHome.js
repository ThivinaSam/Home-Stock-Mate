import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  Button,
  // Card,
  // Grid,
  Container,
  Image,
  Table,
  Loader,
  Modal,
} from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import ModelComp from "./modelComp";

const AddItemsHome = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(false);
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

  return (
    <Container>
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
                  <Table.Cell>{item.price}</Table.Cell>
                  <Table.Cell>
                    <Button
                      color="green"
                      onClick={() => navigate(`/updateItem/${item.id}`)}
                    >
                      Update
                    </Button>
                    <Button color="purple" onClick={() => handleModel(item)}>
                      View
                    </Button>
                    {/* {open && (
                      <ModelComp
                        open={open}
                        setOpen={setOpen}
                        handleDelete={() => console.log("delete")}
                        {...item}
                      />
                    )} */}
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      )}

      <ModelComp open={open} setOpen={setOpen} item={item} />

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
  );
};

export default AddItemsHome;
