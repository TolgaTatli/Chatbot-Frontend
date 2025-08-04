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
  
  // Yeni conversation'ı anında listeye ekle
  const addNewConversation = (conversationId, question, answer) => {
    const newConversation = {
      id: conversationId,
      question: question.slice(0, 100), // İlk 100 karakter
      answer: answer.slice(0, 200), // İlk 200 karakter
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('➕ Yeni conversation listeye ekleniyor:', newConversation);
    
    // Yeni conversation'ı listenin başına ekle
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
        content: "Merhaba! Ben AI asistanınızım. Size nasıl yardımcı olabilirim?",
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
  
  // Login sonrası chat temizleme event'ini dinle
  useEffect(() => {
    loadConversations();
  }, [user]);
  
  useEffect(() => {
    const handleClearChat = () => {
      setConversations([]);
      setCurrentConversationId(null);
    };
    
    // Yeni conversation kaydedildiğinde listeyi yenile
    const handleConversationSaved = (event) => {
      const { conversationId, question, answer } = event.detail || {};
      console.log('🔔 Yeni conversation event alındı:', conversationId);
      
      if (conversationId && question && answer) {
        // Önce anında listeye ekle
        addNewConversation(conversationId, question, answer);
        
        // Sonra backend'den güncel listeyi al (background'da)
        setTimeout(() => {
          console.log('🔄 Background refresh başlatılıyor...');
          loadConversations().then(() => {
            console.log('✅ Background refresh tamamlandı');
          }).catch(error => {
            console.error('❌ Background refresh başarısız:', error);
          });
        }, 1000); // 1 saniye sonra
      } else {
        console.warn('⚠️ Event data eksik:', { conversationId, question, answer });
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
