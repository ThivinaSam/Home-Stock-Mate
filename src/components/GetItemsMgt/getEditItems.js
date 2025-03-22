import React, { useState, useEffect } from "react";
import { Button, Form, Grid, Loader } from "semantic-ui-react";
import { collection, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../../firebase";
import MainSideBar from "../MainSideBar/mainSideBer";

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

    try {
      const q = query(collection(db, "addItems"), where("item", "==", item));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("❌ Item does not exist in addItems collection.");
        return;
      }

      querySnapshot.forEach(async (document) => {
        const docData = document.data();
        const docId = document.id;

        await setDoc(doc(db, "getItems", docId), docData);
        await deleteDoc(doc(db, "addItems", docId));

        console.log("✅ Item moved successfully.");
      });
    } catch (error) {
      console.error("🔥 Error moving item:", error);
    }
  };

  return (
    <div>
      <MainSideBar />
      <Grid
        centered
        verticalAlign="middle"
        columns="3"
        style={{ height: "80vh" }}
      >
        <Grid.Row>
          <Grid.Column textAlign="center">
            <div>
              {isSubmit ? (
                <Loader active inline="centered" size="huge" />
              ) : (
                <>
                  <h2>Get Item</h2>
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
                      error={
                        errors.statuss ? { content: errors.statuss } : null
                      }
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
                      Submit
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

export default GetEditItems;
