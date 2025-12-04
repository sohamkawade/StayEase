import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Calendar, User, Phone, MoveRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { deleteContactMessage, getAllContactMessages } from '../../services/apiService';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAllContactMessages();
      const messagesData = res?.data?.data ?? res?.data ?? [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (err) {
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const res = await deleteContactMessage(id);
      if (res?.status === 200 || res?.status === 201) {
        setMessages(messages.filter((msg) => msg.id !== id));
      } else {
        alert('Failed to delete message');
      }
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Contact Messages</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            Contact Messages
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Messages from users</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm mb-4 sm:mb-6">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <Mail size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4" />
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">No messages found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 hover:shadow-2xl transition-shadow"
              >
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="bg-black text-white p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                    <User size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                      {message.firstname} {message.lastname}
                    </h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail size={12} />
                        <span className="truncate">{message.email}</span>
                      </div>
                      {message.contactNumber && (
                        <div className="flex items-center gap-1">
                          <Phone size={12} />
                          <span>{message.contactNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(message.id)}
                  className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">{message.message}</p>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <Calendar size={12} />
                <span>{formatDate(message.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
};

export default Messages;

