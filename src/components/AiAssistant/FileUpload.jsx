import { useState, useRef } from 'react';
import { Buffer } from 'buffer';
import { FaCloudUploadAlt, FaFilePdf, FaFileImage, FaTrash } from 'react-icons/fa';

function FileUpload({ setFile }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileUpload(event) {
    try {
      setLoading(true);
      const selectedFile = event.target.files[0];
      
      if (!selectedFile) return;
      
      setSelectedFile(selectedFile);
      
      const fileUpload = await selectedFile.arrayBuffer();
      const file = {
        type: selectedFile.type,
        file: Buffer.from(fileUpload).toString("base64"),
        imageUrl: selectedFile.type.includes("pdf") 
          ? "/document-icon.png" 
          : URL.createObjectURL(selectedFile),
        name: selectedFile.name
      };
      
      console.log(file);
      setFile(file);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(e.dataTransfer.files[0]);
      
      fileInputRef.current.files = dataTransfer.files;
      handleFileUpload({ target: { files: dataTransfer.files } });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload a Document</h2>
      
      <div 
        className={`w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } flex flex-col items-center justify-center`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Processing document...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center space-y-4 py-4">
            {selectedFile.type.includes('pdf') ? (
              <FaFilePdf className="h-16 w-16 text-red-500" />
            ) : (
              <div className="relative h-36 w-36 rounded-md overflow-hidden border border-gray-200">
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="text-center">
              <p className="text-gray-800 font-medium">{selectedFile.name}</p>
              <p className="text-gray-500 text-sm">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center"
            >
              <FaTrash className="mr-2" /> Remove
            </button>
          </div>
        ) : (
          <>
            <FaCloudUploadAlt className="h-16 w-16 text-blue-500 mb-4" />
            <p className="text-gray-600 text-center mb-2">
              Drag & drop your file here or click to browse
            </p>
            <p className="text-gray-500 text-sm text-center">
              Supports PDF, JPG, JPEG, PNG (max 10MB)
            </p>
          </>
        )}
      </div>
      
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".pdf, .jpg, .jpeg, .png"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {!selectedFile && (
        <p className="mt-6 text-gray-600 text-center">
          Upload a document to start analyzing with AI
        </p>
      )}
    </section>
  );
}

export default FileUpload;
