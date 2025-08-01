import { useState, useEffect } from 'react';
import { conversationsAPI } from '../services/api';
import { convertConversationToMessages } from '../utils/helpers';

export const useConversations = (user) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // Load all conversations
  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const data = await conversationsAPI.getAll();
      setConversations(data);
    } catch (error) {
      console.error('Load conversations error:', error);
    }
  };

  // Load conversation by ID
  const loadConversationById = async (conversationId, setMessages) => {
    if (!user || !conversationId) return;

    try {
      const conversation = await conversationsAPI.getById(conversationId);
      if (conversation) {
        const loadedMessages = convertConversationToMessages(conversation);
        setMessages(loadedMessages);
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error('Load conversation by ID error:', error);
    }
  };

  // Delete conversation
  const deleteConversation = async (conversationId, createNewConversation) => {
    if (!user || !conversationId) return false;

    if (!confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) {
      return false;
    }

    try {
      const success = await conversationsAPI.delete(conversationId);
      
      if (success) {
        // Remove from list
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        // If deleted conversation was active, start new conversation
        if (currentConversationId === conversationId) {
          createNewConversation();
        }
        
        return true;
      } else {
        alert('Sohbet silinirken hata oluştu');
        return false;
      }
    } catch (error) {
      console.error('Delete conversation error:', error);
      alert('Bağlantı hatası');
      return false;
    }
  };

  // Create new conversation
  const createNewConversation = (setMessages) => {
    setCurrentConversationId(null);
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "Merhaba! Ben AI asistanınızım. Size nasıl yardımcı olabilirim?",
        timestamp: new Date(),
      },
    ]);
  };

  // Load conversations when user changes
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversationId(null);
    }
  }, [user]);

  return {
    conversations,
    currentConversationId,
    loadConversations,
    loadConversationById,
    deleteConversation,
    createNewConversation
  };
};
