import { useState, useEffect } from 'react';
import { conversationsAPI } from '../services/api';
import { convertConversationToMessages } from '../utils/helpers';
export const useConversations = (user) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  
  const loadConversations = async () => {
    if (!user) {
      console.log('🚫 User yoktu, conversations yüklenmiyor');
      return;
    }
    
    console.log('📡 Conversations API çağrılıyor...');
    try {
      const data = await conversationsAPI.getAll();
      console.log('📝 API\'den gelen conversations:', data.length, 'adet');
      console.log('📋 Conversations listesi:', data);
      setConversations(data);
    } catch (error) {
      console.error('❌ Load conversations error:', error);
    }
  };
  
  const addNewConversation = (conversationId, question, answer) => {
    const newConversation = {
      id: conversationId,
      question: question.slice(0, 100),
      answer: answer.slice(0, 200),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('➕ Yeni conversation listeye ekleniyor:', newConversation);
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(conversationId);
  };
  
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
  const deleteConversation = async (conversationId, createNewConversation) => {
    if (!user || !conversationId) return false;
    if (!confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) {
      return false;
    }
    try {
      const success = await conversationsAPI.delete(conversationId);
      
      if (success) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
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
  const createNewConversation = (setMessages) => {
    setCurrentConversationId(null);
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "Hello, I'm your AI assistant. How can I assist you?",
        timestamp: new Date(),
      },
    ]);
  };
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversationId(null);
    }
  }, [user]);
  
  useEffect(() => {
    loadConversations();
  }, [user]);
  
  useEffect(() => {
    const handleClearChat = () => {
      setConversations([]);
      setCurrentConversationId(null);
    };
    
    const handleConversationSaved = (event) => {
      const { conversationId, question, answer } = event.detail || {};
      console.log('Yeni conversation event alındı:', conversationId);
      
      if (conversationId && question && answer) {
        addNewConversation(conversationId, question, answer);
        
        setTimeout(() => {
          console.log('Background refresh başlatılıyor...');
          loadConversations().then(() => {
            console.log('Background refresh tamamlandı');
          }).catch(error => {
            console.error('Background refresh başarısız:', error);
          });
        }, 1000); 
      } else {
        console.warn('Event data eksik:', { conversationId, question, answer });
      }
    };
    
    window.addEventListener('clearChat', handleClearChat);
    window.addEventListener('conversationSaved', handleConversationSaved);
    
    return () => {
      window.removeEventListener('clearChat', handleClearChat);
      window.removeEventListener('conversationSaved', handleConversationSaved);
    };
  }, []);
  
  return {
    conversations,
    currentConversationId,
    loadConversations,
    loadConversationById,
    deleteConversation,
    createNewConversation,
    addNewConversation
  };
};
