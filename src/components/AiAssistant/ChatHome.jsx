import React from "react";
import { useState } from "react";
import { geminiModel } from "../../firebase";
import { useEffect } from "react";
import Loader from "./Loader";
import Chat from "./Chat";
import Summary from "./Summary";
import FileUpload from "./FileUpload";
import Header from "./Header";
import MainSideBar from "../MainSideBar/mainSideBer";

function ChatHome() {
  const [uploadedFile, setUploadedFile] = useState(null);
  return (
    <>
      <main className="container mx-auto px-4 py-6">
        <MainSideBar />
        <Header />
        {uploadedFile ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side - Summary (takes 40% width on large screens) */}
            <div className="w-full lg:w-[50%]">
              <Summary file={uploadedFile} />
            </div>

            {/* Right side - Chat (takes 60% width on large screens) */}
            <div className="w-full lg:w-[60%]">
              <Chat file={uploadedFile} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-24">
            <FileUpload setFile={setUploadedFile} />
          </div>
        )}
      </main>
    </>
  );
}

export default ChatHome;
