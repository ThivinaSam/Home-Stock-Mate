import { useState, useEffect } from "react";
import { FaFileAlt, FaExclamationTriangle, FaSyncAlt } from "react-icons/fa";
import { geminiModel } from "../../firebase";

function Summary({file}) {
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("idle");

  async function getSummary(){
    setStatus('loading');

    try {
      const result = await geminiModel.generateContent([
        {
            inlineData: {
                data: file.file,
                mimeType: file.type,
            },
        },
        `
          Summarize the document
          in one short paragraph (less than 100 words).
          Use just plain text with no markdowns or html tags
        `,
      ]);
      setStatus('success');
      setSummary(result.response.text());
    } catch (error) {
      setStatus('error');
    }
  }

  useEffect(() => {
    if(status === 'idle'){
      getSummary();
    }
  },[status]);

  const handleRetry = () => {
    setStatus('idle');
  };

  return (
    <section className="w-full max-w-4xl mx-auto mb-6 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Stack preview and summary vertically on all screen sizes for maximum preview size */}
      <div className="flex flex-col">
        {/* Document Preview - EXTRA LARGE */}
        <div className="p-6 bg-gray-50 flex flex-col items-center justify-center border-b border-gray-200">
          {file.type.includes('pdf') ? (
            <div className="h-72 w-56 flex items-center justify-center bg-red-50 rounded-lg shadow-md">
              <FaFileAlt className="h-32 w-32 text-red-500" />
            </div>
          ) : (
            <div className="w-full max-w-2xl rounded-lg overflow-hidden border border-gray-200 shadow-md">
              <img 
                src={file.imageUrl} 
                alt="Document Preview" 
                className="max-h-[500px] w-full object-contain"
              />
            </div>
          )}
          <p className="mt-4 text-sm text-gray-600 text-center font-medium max-w-full px-2">
            {file.name}
          </p>
        </div>
        
        {/* Summary Content */}
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Document Summary</h2>
            {status === 'error' && (
              <button 
                onClick={handleRetry} 
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <FaSyncAlt className="mr-1" /> Try Again
              </button>
            )}
          </div>
          
          <div className="min-h-[100px] flex items-center justify-center">
            {status === 'loading' ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-500 text-sm">Generating summary...</p>
              </div>
            ) : status === 'success' ? (
              <div className="w-full">
                <p className="text-gray-700 leading-relaxed font-">{summary}</p>
              </div>
            ) : status === 'error' ? (
              <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg flex flex-col items-center">
                <FaExclamationTriangle className="mb-2" />
                <p>There was an error generating the summary.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Summary;
