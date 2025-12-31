import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { matchingService, Match, Message } from '../services/matching';
import { ROUTES } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

const ChatPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const [matchData, messagesData] = await Promise.all([
        matchingService.getMyMatch(),
        matchingService.getMessages(),
      ]);
      setMatch(matchData);
      setMessages(messagesData);
      scrollToBottom();
    } catch (err) {
      console.error('Error loading messages:', err);
      if ((err as any).response?.status === 404) {
        navigate(ROUTES.DASHBOARD);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    loadMessages();

    // Poll for new messages every 3 seconds
    pollingRef.current = setInterval(() => {
      matchingService.getMessages().then(setMessages).catch(console.error);
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const sentMessage = await matchingService.sendMessage(newMessage.trim());
      setMessages([...messages, sentMessage]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-yildiz-dark text-white flex items-center justify-center px-4">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!match || !match.partner_profile) {
    return (
      <div className="min-h-screen bg-yildiz-dark text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="mb-4">No match found.</p>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="bg-yildiz-gold text-yildiz-dark px-6 py-2 rounded-xl hover:bg-yellow-400 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-yildiz-dark text-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Chat with {match.partner_profile.initials}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {match.partner_profile.department} • {match.partner_profile.study_level}
          </p>
        </div>

        {/* Messages */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-lg mb-2">No messages yet.</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-3 ${
                      message.is_own
                        ? 'bg-christmas-green text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm sm:text-base break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.is_own ? 'text-green-100' : 'text-gray-400'}`}>
                      {formatTime(message.created_at)}
                      {message.is_own && (message.read ? ' • Read' : ' • Sent')}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                maxLength={2000}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yildiz-gold/50 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-yildiz-gold text-yildiz-dark font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
