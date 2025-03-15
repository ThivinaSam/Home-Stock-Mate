import React from "react";
import { firestore } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { storage } from "../../firebase";

function Home() {
  const messageRef = React.useRef();
  const ref1 = collection(firestore,"messages");

  const handleSave = async (e) => {
    e.preventDefault();
    console.log(messageRef.current.value);

    let data = {
        message: messageRef.current.value,
    }

    try {
      addDoc(ref1,data);
    }
    catch (error) {
      console.error("Error adding document: ", error);
    }

  };

  const [imageUpload, setImageUpload] = useState(null);
  const uploadImage = () => {
    if (imageUpload == null) {
        return;
    }

    const imageRef = ref(storage, `images/${imageUpload.name}`);
    uploadBytes(imageRef, imageUpload).then(() => {
        alert("Image uploaded successfully");
    })
  };

  return (
    <div>
      <h2>Home</h2>
      <p>Welcome to the Home page!</p>
      <form onSubmit={handleSave}>
        <label>Message</label>
        <input type="text" ref={messageRef} />
        <button type="submit">Save</button>

        <div>
            <input type="file" onChange={(event) => {
                setImageUpload(event.target.files[0]);
            }} />
            <button onClick={uploadImage}>Upload</button>
        </div>
      </form>
    </div>
  );
}

export default Home;
