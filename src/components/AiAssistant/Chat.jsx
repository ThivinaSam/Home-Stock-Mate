import { useState } from 'react';
import { geminiModel } from "../../firebase";
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

// Add post-processing to improve response formatting
function processResponse(text) {
  // Remove any markdown artifacts that might appear
  let processed = text.replace(/```[a-z]*\n?|\n?```/g, '');
  
  // Ensure proper sentence formatting
  processed = processed.trim();
  
  // Add additional formatting as needed
  return processed;
}

function Chat({file}) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [temperature, setTemperature] = useState(0.7); // Default middle ground

    // Function to check if query is asking about expiration
    const isExpirationQuery = (query) => {
      const lowerQuery = query.toLowerCase();
      return lowerQuery.includes('expired') || 
             lowerQuery.includes('expiration') || 
             lowerQuery.includes('expiry date') ||
             lowerQuery.includes('still good') ||
             lowerQuery.includes('past date');
    };

    async function handleSendMessage() {
        if(input.length) {
            setIsLoading(true);
            let chatMessages = [...messages, {role: "user", text: input}, {role: "loader", text: ""}];
            setInput("");
            setMessages(chatMessages);

            try {
                // Set up configuration
                const generationConfig = {
                  temperature: temperature,
                  maxOutputTokens: 1024,
                };

                // Check if the question is about expiration
                const checkingExpiration = isExpirationQuery(input);
                
                // Get current date for expiration comparisons
                const currentDate = new Date();
                const formattedCurrentDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

                // Construct context prompt based on file type
                let contextPrompt = "This document appears to be ";
                if (file.type.includes('pdf')) {
                  contextPrompt += "a PDF, likely containing structured information about household items.";
                } else if (file.type.includes('image')) {
                  contextPrompt += "an image, possibly showing household items or a receipt.";
                }

                // Enhanced prompt for expiration date questions
                let promptText = `
                    ${contextPrompt} Please analyze it and answer: "${input}"
                    
                    Context: This is for a home inventory management application.
                    
                    Format your response to be:
                    - Clear and concise
                    - Focused specifically on the question
                    - Helpful for managing household items
                    - Include specific item details from the document when relevant
                `;
                
                // Add special instructions for expiration date queries
                if (checkingExpiration) {
                  promptText += `
                    Today's date is ${formattedCurrentDate}.
                    
                    Since this question is about expiration:
                    1. Look for and extract any expiration dates in the document
                    2. Compare each date with today's date (${formattedCurrentDate})
                    3. Clearly state if the item is expired or not
                    4. If multiple dates are found, address each one
                    5. If no expiration date is found, please state that clearly
                  `;
                }

                // Add previous conversation context
                promptText += `
                    Previous conversation for context:
                    ${messages.filter(m => m.role !== 'loader').map(m => `${m.role}: ${m.text}`).join('\n')}
                `;

                // Send to Gemini
                const result = await geminiModel.generateContent([
                  {
                    inlineData: {
                      data: file.file,
                      mimeType: file.type,
                    },
                  },
                  promptText,
                ], { generationConfig });

                chatMessages = [...chatMessages.filter((msg)=>msg.role != 'loader'), {
                  role: "model", 
                  text: processResponse(result.response.text())
                }];
                setMessages(chatMessages);
            } catch (error) {
                let errorMessage = "Error sending messages, please try again later.";
                
                // Provide more specific fallback responses
                if (error.message?.includes('quota')) {
                  errorMessage = "We've reached our usage limit. Please try again in a few minutes.";
                } else if (error.message?.includes('content_blocked')) {
                  errorMessage = "I couldn't process this request. Please try a different question.";
                }
                
                chatMessages = [...chatMessages.filter((msg)=>msg.role != 'loader'), {
                  role: "error", 
                  text: errorMessage
                }];
                setMessages(chatMessages);
                console.error('Error in chat:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <section className="flex flex-col h-[740px] w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="py-3 px-4 bg-blue-600 text-white">
                <h2 className="text-xl font-semibold">Chat about your product</h2>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.length ? (
                    <div className="flex flex-col space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div 
                                    className={`px-4 py-3 rounded-lg max-w-[75%] ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : msg.role === 'error'
                                                ? 'bg-red-100 text-red-600'
                                                : msg.role === 'loader'
                                                    ? 'bg-gray-100 text-gray-600'
                                                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                    }`}
                                >
                                    {msg.role === 'loader' ? (
                                        <div className="flex items-center space-x-2">
                                            <FaSpinner className="animate-spin" />
                                            <span>Thinking...</span>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        <p>Ask a question about your image to get started</p>
                    </div>
                )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type="text"
                        autoFocus
                        placeholder="Ask any question about the uploaded product..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()} 
                        className={`p-2 rounded-lg ${
                            isLoading || !input.trim() 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        } transition-colors`}
                    >
                        {isLoading ? (
                            <FaSpinner className="animate-spin w-5 h-5" />
                        ) : (
                            <FaPaperPlane className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Chat;
