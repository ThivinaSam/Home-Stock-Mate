import { useState } from 'react';
import { geminiModel } from "../../firebase";
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

function Chat({file}) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSendMessage() {
        if(input.length) {
            setIsLoading(true);
            let chatMessages = [...messages, {role: "user", text: input}, {role: "loader", text: ""}];
            setInput("");
            setMessages(chatMessages);

            try {
                const result = await geminiModel.generateContent([
                  {
                      inlineData: {
                          data: file.file,
                          mimeType: file.type,
                      },
                  },
                  `
                    Answer this question about the attached document: ${input}.
                    Answer as a chatbot with short messages and text only (no markdowns, tags or symbols)
                    Chat history: ${JSON.stringify(messages)}
                  `,
                ]);

                chatMessages = [...chatMessages.filter((msg)=>msg.role != 'loader'), {role: "model", text: result.response.text()}];
                setMessages(chatMessages);
            } catch (error) {
                chatMessages = [...chatMessages.filter((msg)=>msg.role != 'loader'), {role: "error", text: "Error sending messages, please try again later."}];
                setMessages(chatMessages);
                console.log('error');
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
                <h2 className="text-xl font-semibold">Chat with your document</h2>
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
                        <p>Ask a question about your document to get started</p>
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
                        placeholder="Ask any question about the uploaded document..."
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
