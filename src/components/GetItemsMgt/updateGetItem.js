import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Grid,
  Loader,
  Segment,
  Header,
  Icon,
} from "semantic-ui-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import MainSideBar from "../MainSideBar/mainSideBer";
import Swal from "sweetalert2";

const initialState = {
  item: "",
  exDate: "",
  statuss: "",
  qty: "",
};

const UpdateGetItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(initialState);
  const { item, exDate, statuss, qty } = data;
  const [errors, setErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      const docRef = doc(db, "getItems", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data());
      } else {
        Swal.fire("Not Found", "Item does not exist.", "error");
      }
    };

    fetchItemDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent negative quantity
    if (name === "qty" && value < 0) return;

    setData({ ...data, [name]: value });
  };

  const validate = () => {
    let errors = {};
    if (!item) errors.item = "Item is required";
    if (!exDate) errors.exDate = "Expiry Date is required";
    if (!statuss) errors.statuss = "Status is required";
    if (!qty || qty <= 0) errors.qty = "Quantity must be a positive number";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = validate();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    setIsSubmit(true);

    try {
      const docRef = doc(db, "getItems", id);
      await updateDoc(docRef, {
        item,
        exDate,
        statuss,
        qty,
      });

      Swal.fire({
        icon: "success",
        title: "Item Updated",
        text: "The item was successfully updated!",
        confirmButtonColor: "#3085d6",
      });

      navigate("/getItemHome");
    } catch (error) {
      Swal.fire("Error", "Failed to update item", "error");
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <div>
      <MainSideBar />
      <Grid
        centered
        verticalAlign="middle"
        style={{ height: "100vh", backgroundColor: "#f4f7f9" }}
      >
        <Grid.Column style={{ maxWidth: 550 }}>
          <Segment raised padded="very">
            {isSubmit ? (
              <Loader active inline="centered" size="large" />
            ) : (
              <>
                <Header as="h2" icon textAlign="center">
                  <Icon name="edit" />
                  Update Retrieved Item
                  <Header.Subheader>
                    Make changes to the selected item
                  </Header.Subheader>
                </Header>

                <Form onSubmit={handleSubmit}>
                  <Form.Input
                    fluid
                    label="Item"
                    placeholder="Enter item name"
                    name="item"
                    value={item}
                    onChange={handleChange}
                    error={
                      errors.item ? { content: errors.item, pointing: "below" } : null
                    }
                  />

                  <Form.Input
                    fluid
                    label="Expiry Date"
                    type="date"
                    name="exDate"
                    value={exDate}
                    onChange={handleChange}
                    error={
                      errors.exDate ? { content: errors.exDate, pointing: "below" } : null
                    }
                  />

                  <Form.Input
                    fluid
                    label="Status"
                    placeholder="Enter status"
                    name="statuss"
                    value={statuss}
                    onChange={handleChange}
                    error={
                      errors.statuss ? { content: errors.statuss, pointing: "below" } : null
                    }
                  />

                  <Form.Input
                    fluid
                    label="Quantity"
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    name="qty"
                    value={qty}
                    onChange={handleChange}
                    error={
                      errors.qty ? { content: errors.qty, pointing: "below" } : null
                    }
                  />

                  <Button type="submit" color="blue" fluid>
                    <Icon name="save" /> Update Item
                  </Button>
                </Form>
              </>
            )}
          </Segment>
        </Grid.Column>
      </Grid>
    </div>
  );
};

export default UpdateGetItem;
