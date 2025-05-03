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
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import {
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { db, storage } from "../../firebase";
import { useNavigate } from "react-router-dom";
import MainSideBar from "../MainSideBar/mainSideBer";
import Swal from "sweetalert2";

const initialState = {
  item: "",
  exDate: "",
  statuss: "",
  qty: "",
};

const GetEditItems = () => {
  const [data, setData] = useState(initialState);
  const { item, exDate, statuss, qty } = data;
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (file) {
      const uploadFile = () => {
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
          },
          (error) => {
            console.log(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setData((prev) => ({ ...prev, img: downloadURL }));
            });
          }
        );
      };
      uploadFile();
    }
  }, [file]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "qty" && value < 0) return;
    setData({ ...data, [name]: value });
  };

  const validate = () => {
    let errors = {};
    if (!item) errors.item = "Item is required";
    if (!exDate) errors.exDate = "Expire Date is required";
    if (!statuss) errors.statuss = "Status is required";
    if (!qty || qty <= 0) errors.qty = "Quantity must be positive";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmit(true);

    try {
      const q = query(collection(db, "addItems"), where("item", "==", item));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Swal.fire("Not Found", "Item not found in addItems collection", "error");
        setIsSubmit(false);
        return;
      }

      querySnapshot.forEach(async (document) => {
        const docData = document.data();
        const docId = document.id;

        const updatedData = {
          item: docData.item,
          exDate,
          statuss,
          qty,
          getDate: new Date().toISOString(),
        };

        if (docData.img) {
          updatedData.img = docData.img;
        }

        await setDoc(doc(db, "getItems", docId), updatedData);
        await deleteDoc(doc(db, "addItems", docId));

        Swal.fire({
          icon: "success",
          title: "Item Retrieved",
          text: "Item moved and updated successfully!",
          confirmButtonColor: "#3085d6",
        });

        setIsSubmit(false);
        navigate("/getItemHome");
      });
    } catch (error) {
      console.error("🔥 Error:", error);
      Swal.fire("Error", "Failed to process item", "error");
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
        <Grid.Column style={{ maxWidth: 600 }}>
          <Segment padded="very" raised>
            {isSubmit ? (
              <Loader active inline="centered" size="large" />
            ) : (
              <>
                <Header as="h2" icon textAlign="center">
                  <Icon name="arrow circle down" />
                  Retrieve Item
                  <Header.Subheader>
                    Fill out the details to retrieve and save the item
                  </Header.Subheader>
                </Header>

                <Form onSubmit={handleSubmit}>
                  <Form.Input
                    fluid
                    label="Item"
                    name="item"
                    placeholder="Enter item name"
                    value={item}
                    onChange={handleChange}
                    error={errors.item ? { content: errors.item, pointing: "below" } : null}
                  />
                  <Form.Input
                    fluid
                    label="Expiry Date"
                    type="date"
                    name="exDate"
                    value={exDate}
                    onChange={handleChange}
                    error={errors.exDate ? { content: errors.exDate, pointing: "below" } : null}
                  />
                  <Form.Input
                    fluid
                    label="Status"
                    name="statuss"
                    placeholder="Enter status"
                    value={statuss}
                    onChange={handleChange}
                    error={errors.statuss ? { content: errors.statuss, pointing: "below" } : null}
                  />
                  <Form.Input
                    fluid
                    label="Quantity"
                    type="number"
                    min="1"
                    name="qty"
                    placeholder="Enter quantity"
                    value={qty}
                    onChange={handleChange}
                    error={errors.qty ? { content: errors.qty, pointing: "below" } : null}
                  />

                  <Button type="submit" color="blue" fluid size="large" icon labelPosition="left">
                    <Icon name="save" />
                    Save Item
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

export default GetEditItems;
