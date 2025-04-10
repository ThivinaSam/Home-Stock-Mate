import React from 'react'
import { useState } from 'react'
import { geminiModel } from "../../firebase";
import { useEffect } from 'react';
import Loader from './Loader'
import Chat from './Chat'
import Summary from './Summary'
import FileUpload from './FileUpload'
import Header from './Header'

function ChatHome() {
    const [uploadedFile, setUploadedFile] = useState(null);
  return (
    <>
        <main className="container mx-auto px-4 py-6">
          <Header />
          {
            uploadedFile ?
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left side - Summary (takes 40% width on large screens) */}
              <div className="w-full lg:w-[40%]">
                <Summary file={uploadedFile} />
              </div>
              
              {/* Right side - Chat (takes 60% width on large screens) */}
              <div className="w-full lg:w-[60%]">
                <Chat file={uploadedFile} />
              </div>
            </div>
            :
            <FileUpload setFile={setUploadedFile} />
          }
        </main>
    </>
  )
}

export default ChatHome
