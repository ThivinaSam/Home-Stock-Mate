import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Container,
  Segment,
  Header,
  Icon,
  Grid,
  Label,
  Divider,
} from "semantic-ui-react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import MainSideBar from "../MainSideBar/mainSideBer";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GetItemsHome = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "getItems"));
        const itemList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(itemList);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const handleEdit = (id) => navigate(`/updateGetItem/${id}`);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteDoc(doc(db, "getItems", id));
        setItems(items.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "Item has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete item.", "error");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const filteredItems = items.filter((item) =>
    item.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Retrieved Items Report", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Item", "Expiry Date", "Status", "Quantity", "Date Retrieved"]],
      body: filteredItems.map((item) => [
        item.item,
        item.exDate,
        item.statuss,
        item.qty,
        formatDate(item.getDate),
      ]),
    });
    doc.save("RetrievedItemsReport.pdf");
  };

  return (
    <div style={{ background: "#f4f7fa", minHeight: "100vh" }}>
      <MainSideBar />
      <Container style={{ marginTop: "2em" }}>
        <Segment raised padded="very" style={{ borderRadius: "20px" }}>
          <Grid stackable>
            <Grid.Row verticalAlign="middle">
              <Grid.Column width={10}>
                <Header as="h2" icon textAlign="left">
                  <Icon name="archive" circular />
                  <Header.Content>Retrieved Items</Header.Content>
                </Header>
              </Grid.Column>
              <Grid.Column width={6} textAlign="right">
                <Input
                  icon="search"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "100%", marginBottom: "0.5em" }}
                />
                <Button
                  color="teal"
                  icon
                  labelPosition="left"
                  onClick={exportPDF}
                  style={{ marginTop: "0.5em" }}
                >
                  <Icon name="download" />
                  Export PDF
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Divider />

          <Table celled striped selectable>
            <Table.Header fullWidth>
              <Table.Row>
                <Table.HeaderCell>Item</Table.HeaderCell>
                <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Quantity</Table.HeaderCell>
                <Table.HeaderCell>Date Retrieved</Table.HeaderCell>
                <Table.HeaderCell textAlign="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <Label color="blue" ribbon>
                        {item.item}
                      </Label>
                    </Table.Cell>
                    <Table.Cell>{item.exDate}</Table.Cell>
                    <Table.Cell>{item.statuss}</Table.Cell>
                    <Table.Cell>{item.qty}</Table.Cell>
                    <Table.Cell>{formatDate(item.getDate)}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button.Group size="small">
                        <Button icon="edit" color="blue" onClick={() => handleEdit(item.id)} />
                        <Button icon="trash" color="red" onClick={() => handleDelete(item.id)} />
                      </Button.Group>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan="6" textAlign="center">
                    <Header as="h4" color="grey">
                      <Icon name="inbox" />
                      No items found.
                    </Header>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Segment>
      </Container>
    </div>
  );
};

export default GetItemsHome;
