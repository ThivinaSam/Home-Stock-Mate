import React, { useState, useEffect } from "react";
import { Button, Grid, GridColumn, Loader } from "semantic-ui-react";
import { storage, db } from "../../firebase";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../AddItemNavBar/navBar";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const initialState = {
  item: "",
  description: "",
  price: "",
  quantity: "",
  date: "",
  image: "",
};

function AddItems() {
  const [data, setData] = useState(initialState);
  const { item, description, price, quantity, date, image } = data;
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    id && getSingleItem();
  }, [id]);

  const getSingleItem = async () => {
    const docRef = doc(db, "addItems", id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      setData({ ...snapshot.data() });
    }
  };

  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;
      // const imageRef = ref(storage, `images/${imageUpload.name}`);
      const storageRef = ref(storage, `addItemImgs/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setData((prev) => ({ ...prev, image: downloadURL })); // Changed img to image
          }); // Added missing closing parenthesis here
        }
      );
    };
    file && uploadFile();
  }, [file]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let errors = {};
    if (!item) {
      errors.item = "Item is required";
    }
    if (!description) {
      errors.description = "Description is required";
    }
    if (!price) {
      errors.price = "Price is required";
    }
    if (!quantity) {
      errors.quantity = "Quantity is required";
    }
    if (!date) {
      errors.date = "Date is required";
    }
    if (!image) {
      errors.image = "Image is required";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = validate();
    if (Object.keys(errors).length) return setErrors(errors);
    setIsSubmit(true);
    if (!id) {
      try {
        await addDoc(collection(db, "addItems"), {
          ...data,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await updateDoc(doc(db, "addItems", id), {
          ...data,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.log(error);
      }
    }
    navigate("/addItemHome");
  };

  return (
    <div>
      <NavBar />
      <Grid
        centered
        verticalAlign="middle"
        columns="3"
        style={{ height: "80vh" }}
      >
        <Grid.Row>
          <GridColumn textAlign="center">
            <div>
              {isSubmit ? (
                <Loader active inline="centered" size="huge" />
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-6">
                    {id ? "Update Item" : "Add Item"}
                  </h2>
                  <form className="space-y-4">
                    {/* Item Field */}
                    <div className="flex flex-col">
                      <label className="text-lg font-semibold text-gray-700">
                        Item
                      </label>
                      <input
                        type="text"
                        name="item"
                        value={item}
                        onChange={handleChange}
                        placeholder="Enter item"
                        autoFocus
                        className={`mt-2 p-2 border ${
                          errors.item ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.item && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.item}
                        </span>
                      )}
                    </div>

                    {/* Description Field */}
                    <div className="flex flex-col">
                      <label className="text-lg font-semibold text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={description}
                        onChange={handleChange}
                        placeholder="Enter description"
                        rows="4"
                        className={`mt-2 p-2 border ${
                          errors.description
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.description && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.description}
                        </span>
                      )}
                    </div>

                    {/* Price Field */}
                    <div className="flex flex-col">
                      <label className="text-lg font-semibold text-gray-700">
                        Price
                      </label>
                      <input
                        type="text"
                        name="price"
                        value={price}
                        onChange={handleChange}
                        placeholder="Enter price"
                        className={`mt-2 p-2 border ${
                          errors.price ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.price && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.price}
                        </span>
                      )}
                    </div>

                    {/* Quantity Field */}
                    <div className="flex flex-col">
                      <label className="text-lg font-semibold text-gray-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={quantity}
                        onChange={handleChange}
                        placeholder="Enter quantity"
                        className={`mt-2 p-2 border ${
                          errors.quantity ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.quantity && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.quantity}
                        </span>
                      )}
                    </div>

                    {/* Date Field */}
                    <div className="flex flex-col">
                      <label className="text-lg font-semibold text-gray-700">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={date}
                        onChange={handleChange}
                        placeholder="Enter date you bought"
                        className={`mt-2 p-2 border ${
                          errors.date ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.date && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.date}
                        </span>
                      )}
                    </div>

                    {/* Image Field */}
                    <div className="flex flex-col">
                      <label className="text-lg font-semibold text-gray-700">
                        Choose an image
                      </label>
                      <input
                        type="file"
                        name="image"
                        onChange={(e) => setFile(e.target.files[0])}
                        className={`mt-2 p-2 border ${
                          errors.image ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.image && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.image}
                        </span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                      <Button
                        primary
                        type="submit"
                        onClick={handleSubmit}
                        disabled={progress !== null && progress < 100}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        Submit
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </GridColumn>
        </Grid.Row>
      </Grid>
    </div>
  );
}

export default AddItems;
