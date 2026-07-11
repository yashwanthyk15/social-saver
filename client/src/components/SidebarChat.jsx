import React, { useState, useRef, useEffect } from 'react';
import { askChatbot } from '../utils/api';
import { Send, Bot, User } from 'lucide-react';

const SidebarChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: 'Hi! Ask me anything about your saved content.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askChatbot(userMessage.text);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: response.data.reply }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: "Sorry, I couldn't process that right now." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sidebar-chat-container">
      <div className="sidebar-chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className="chat-avatar">
              {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className="chat-text">{msg.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message bot">
            <div className="chat-avatar"><Bot size={14} /></div>
            <div className="chat-text typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="sidebar-chat-input-wrapper">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="sidebar-chat-input"
          disabled={isLoading}
        />
        <button type="submit" className="sidebar-chat-submit" disabled={!input.trim() || isLoading}>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default SidebarChat;
