import React, { useState, useEffect } from "react";
import { Button, Form, Grid, Loader } from "semantic-ui-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import MainSideBar from "../MainSideBar/mainSideBer";

const initialState = {
  item: "",
  exDate: "",
  statuss: "",
  qty: "",
};

const UpdateGetItem = () => {
  const { id } = useParams(); // Assuming the item ID is passed in the URL
  const navigate = useNavigate(); // For redirecting after form submission
  const [data, setData] = useState(initialState);
  const { item, exDate, statuss, qty } = data;
  const [errors, setErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  // Fetch item details when the component is mounted
  useEffect(() => {
    const fetchItemDetails = async () => {
      const docRef = doc(db, "getItems", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchItemDetails();
  }, [id]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let errors = {};
    if (!item) errors.item = "Item is required";
    if (!exDate) errors.exDate = "Expire Date is required";
    if (!statuss) errors.statuss = "Status is required";
    if (!qty) errors.qty = "Quantity is required";
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

      console.log("✅ Item updated successfully.");

      // Redirect to /getItemHome after successful update
      navigate("/getItemHome");
    } catch (error) {
      console.error("🔥 Error updating item:", error);
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <div>
      <MainSideBar />
      <Grid centered verticalAlign="middle" columns="3" style={{ height: "80vh" }}>
        <Grid.Row>
          <Grid.Column textAlign="center">
            <div>
              {isSubmit ? (
                <Loader active inline="centered" size="huge" />
              ) : (
                <>
                  <h2>Update Get Item</h2>
                  <Form onSubmit={handleSubmit}>
                    <Form.Input
                      label="Item"
                      error={errors.item ? { content: errors.item } : null}
                      placeholder="Enter Item"
                      name="item"
                      onChange={handleChange}
                      value={item}
                      autoFocus
                    />
                    <Form.Input
                      label="Expire Date"
                      error={errors.exDate ? { content: errors.exDate } : null}
                      placeholder="Enter Expire Date"
                      name="exDate"
                      onChange={handleChange}
                      value={exDate}
                    />
                    <Form.Input
                      label="Status"
                      error={errors.statuss ? { content: errors.statuss } : null}
                      placeholder="Enter Status"
                      name="statuss"
                      onChange={handleChange}
                      value={statuss}
                    />
                    <Form.Input
                      label="Quantity"
                      error={errors.qty ? { content: errors.qty } : null}
                      placeholder="Enter Quantity"
                      name="qty"
                      onChange={handleChange}
                      value={qty}
                    />
                    <Button primary type="submit">
                      Update
                    </Button>
                  </Form>
                </>
              )}
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default UpdateGetItem;
