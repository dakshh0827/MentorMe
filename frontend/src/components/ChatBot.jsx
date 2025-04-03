import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { DotLoader } from 'react-spinners';
import ReactMarkdown from 'react-markdown';
import config from '../lib/config.js';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
  
    const userMessage = inputMessage.trim();
    setMessages((prev) => [...prev, { content: userMessage, isUser: true }]);
    setInputMessage('');
    setIsLoading(true);
  
    try {
      // Create conversation history for context
      const conversationHistory = [
        ...messages.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.models.llama,
          messages: conversationHistory,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("API Response:", data);  // Log the full response
      const botResponse = data.choices?.[0]?.message?.content || "I couldn't process that query.";
      setMessages((prev) => [...prev, { content: botResponse, isUser: false }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [...prev, { content: "Error connecting to guidance knowledge base.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-96 h-[500px] bg-white rounded-2xl shadow-lg flex flex-col border border-gray-300 animate-fadeIn">
          <div className="p-4 bg-purple-600 text-white rounded-t-2xl flex justify-between items-center">
            <h3 className="text-lg font-semibold">Scholar Sync</h3>
            <button onClick={() => setIsOpen(false)} className="text-xl">
              <FaTimes />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-100">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 max-w-[80%] rounded-xl ${msg.isUser ? 'bg-blue-100 ml-auto' : 'bg-gray-200 mr-auto'}`}
              >
                {msg.isUser ? (
                  <span className="text-black">{msg.content}</span>
                ) : (
                  <div className="markdown-content text-black">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {isLoading && <DotLoader size={30} color="#2c3e50" />}
            <div ref={messagesEndRef} />
          </div>

          <form className="p-3 flex gap-2 border-t border-gray-300" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Seek guidance..."
              className="flex-1 p-2 border border-gray-300 rounded-full outline-none text-black"
            />
            <button type="submit" className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}

      <button
        className="bg-purple-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform transform hover:scale-110"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaRobot size={28} />
      </button>
    </div>
  );
}
