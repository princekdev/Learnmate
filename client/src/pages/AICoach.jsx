import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { aiAPI } from '../services/api.js';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Send, Trash2, Bot, User, Loader2, MessageSquare, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const suggestions = [
  'What should I learn next?',
  'Give me practice questions for my current topic.',
  'I have only 5 hours this week. What should I study?',
  'What skills am I missing for a frontend internship?',
  'Explain React hooks in simple language.',
];

const AICoach = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const [sending, setSending] = useState(false);
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const res = await aiAPI.getAllChats();
      setChats(res.data.chats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadChat = async (id) => {
    try {
      const res = await aiAPI.getChatHistory(id);
      setChatId(id);
      setMessages(res.data.chat.messages);
    } catch (err) {
      toast.error('Failed to load chat');
    }
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: messageText, timestamp: new Date() }]);
    setSending(true);
    try {
      const res = await aiAPI.chat({ message: messageText, chatId });
      setChatId(res.data.chatId);
      setMessages(res.data.messages);
      fetchChats();
    } catch (err) {
      const msg = err.response?.data?.message || 'AI Coach is unavailable';
      if (msg.includes('IBM') || msg.includes('configured')) {
        toast.error('IBM Granite not configured. Add credentials to server .env', { duration: 6000 });
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '⚠️ IBM Granite AI is not configured. Please add IBM_API_KEY and IBM_PROJECT_ID to the server .env file to enable AI chat.',
            timestamp: new Date(),
          },
        ]);
      } else {
        toast.error(msg);
      }
      setSending(false);
    } finally {
      setSending(false);
    }
  };

  const newChat = () => {
    setChatId(null);
    setMessages([]);
  };

  const deleteChat = async (id) => {
    try {
      await aiAPI.deleteChat(id);
      setChats((prev) => prev.filter((c) => c._id !== id));
      if (chatId === id) newChat();
      toast.success('Chat deleted');
    } catch (err) {
      toast.error('Failed to delete chat');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] gap-4">
        {/* Sidebar: chat list */}
        <div className="hidden lg:flex flex-col w-64 bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Conversations</h2>
            <button onClick={newChat} className="p-1.5 rounded-lg hover:bg-gray-100" title="New Chat">
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingChats ? <LoadingSpinner size="sm" /> : chats.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No conversations yet</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${chat._id === chatId ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'}`}
                  onClick={() => loadChat(chat._id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-800 truncate">{chat.title || 'Chat'}</p>
                    <p className="text-xs text-gray-400">{new Date(chat.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat._id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all ml-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">LearnMate AI Coach</h2>
              <p className="text-xs text-gray-500">Powered by IBM Granite · Ask anything about your learning</p>
            </div>
            <button onClick={newChat} className="ml-auto btn-secondary text-xs flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Your AI Learning Coach</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm">
                  Hi {user?.name?.split(' ')[0]}! I'm your personalized learning coach. Ask me anything about your roadmap, topics, or learning strategy.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary-600' : 'bg-gray-200'}`}>
                  {msg.role === 'user'
                    ? <User className="h-4 w-4 text-white" />
                    : <Bot className="h-4 w-4 text-gray-600" />
                  }
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Ask your AI coach anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="btn-primary px-4 flex items-center justify-center"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AICoach;
