import React from "react";
import "./testHome.css";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { useState, useEffect } from "react";
import { storage } from "../../firebase";
import MainSideBar from "../MainSideBar/mainSideBer";

function Home() {
  const messageRef = React.useRef();
  const ref1 = collection(db, "messages");

  const handleSave = async (e) => {
    e.preventDefault();
    console.log(messageRef.current.value);

    let data = {
      message: messageRef.current.value,
    };

    try {
      addDoc(ref1, data);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);

  const imageListRef = ref(storage, "images/");
  const uploadImage = () => {
    if (imageUpload == null) {
      return;
    }

    const imageRef = ref(storage, `images/${imageUpload.name}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageList((prev) => [...prev, url]);
      });
      alert("Image uploaded successfully");
    });
  };

  useEffect(() => {
    listAll(imageListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageList((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  return (
    <div>
      <MainSideBar />
      <h2>Home</h2>
      {/* <p>Welcome to the Home page!</p>
      <form onSubmit={handleSave}>
        <label>Message</label>
        <input type="text" ref={messageRef} />
        <button type="submit">Save</button>

        <div>
          <input
            type="file"
            onChange={(event) => {
              setImageUpload(event.target.files[0]);
            }}
          />
          <button onClick={uploadImage}>Upload</button>
        </div>
        {imageList.map((url) => {
          return <img src={url} alt="" />;
        })}
      </form> */}
    </div>
  );
}

export default Home;
