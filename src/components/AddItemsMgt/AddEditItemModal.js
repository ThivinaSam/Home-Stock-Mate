import React, { useState, useEffect } from "react";
import { Button, Modal, Loader, Progress } from "semantic-ui-react"; // Import the Progress component
import { storage, db } from "../../firebase";
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

// Add this helper function to get today's date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function AddItemModal({ open, setOpen, itemId = null, refreshItems }) {
  const [data, setData] = useState(initialState);
  const { item, description, price, quantity, date, image } = data;
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null); // Track upload progress
  const [errors, setErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      if (!itemId) {
        setData(initialState);
        setFile(null);
        setProgress(null);
        setErrors({});
      } else {
        getSingleItem();
      }
    }
  }, [open, itemId]);

  const getSingleItem = async () => {
    const docRef = doc(db, "addItems", itemId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      setData({ ...snapshot.data() });
    }
  };

  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, `addItemImgs/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress); // Update progress state
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
            setData((prev) => ({ ...prev, image: downloadURL }));
            setProgress(null); // Reset progress after upload is complete
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For price field, only allow numbers, decimal point, and prevent multiple decimal points
    if (name === "price") {
      // Validate that input only contains numbers and at most one decimal point
      const regex = /^(\d+\.?\d*|\.\d+)$/;

      // Empty value is allowed (for clearing the field)
      if (value === "" || regex.test(value)) {
        setData({ ...data, [name]: value });
      }
      // Don't update state if input doesn't match the pattern
    } else {
      // For other fields, update normally
      setData({ ...data, [name]: value });
    }
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
    } else if (isNaN(parseFloat(price))) {
      errors.price = "Price must be a valid number";
    }
    if (!quantity) {
      errors.quantity = "Quantity is required";
    }
    if (!date) {
      errors.date = "Date is required";
    }
    if (!image && !itemId) {
      // Only require image for new items
      errors.image = "Image is required";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = validate();
    if (Object.keys(errors).length) return setErrors(errors);
    setIsSubmit(true);

    try {
      if (!itemId) {
        // Add new item
        await addDoc(collection(db, "addItems"), {
          ...data,
          timestamp: serverTimestamp(),
        });
      } else {
        // Update existing item
        await updateDoc(doc(db, "addItems", itemId), {
          ...data,
          timestamp: serverTimestamp(),
        });
      }

      // Close modal and refresh items list
      setOpen(false);
      if (refreshItems) refreshItems();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} size="small" closeIcon>
      <Modal.Header>{itemId ? "Update Item" : "Add New Item"}</Modal.Header>
      <Modal.Content scrolling>
        {isSubmit ? (
          <div className="flex justify-center p-8">
            <Loader active inline="centered" size="huge" />
          </div>
        ) : (
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
                <span className="text-red-500 text-sm mt-1">{errors.item}</span>
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
                  errors.description ? "border-red-500" : "border-gray-300"
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
                placeholder="Enter price (numbers only)"
                inputMode="decimal" // Shows number keyboard on mobile
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

            {/* Date Field - updated with max attribute */}
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
                max={getCurrentDate()} // Restrict to today and earlier dates
                className={`mt-2 p-2 border ${
                  errors.date ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.date && (
                <span className="text-red-500 text-sm mt-1">{errors.date}</span>
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

            {/* Progress Bar */}
            {progress !== null && (
              <div className="mt-4">
                <Progress
                  percent={Math.round(progress)} // Show progress percentage
                  indicating
                  progress
                />
              </div>
            )}
          </form>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button color="red" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          color="green"
          onClick={handleSubmit}
          disabled={progress !== null && progress < 100} // Disable button during upload
        >
          {itemId ? "Update" : "Add"}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default AddItemModal;
