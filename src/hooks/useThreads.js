import { useState, useEffect } from 'react';
import { threadsAPI, conversationsAPI } from '../services/api';
import { convertConversationToMessages } from '../utils/helpers';
import { toast } from 'react-toastify';

export const useThreads = (user) => {
  const [threads, setThreads] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  
  useEffect(() => {
    const handleThreadSaved = (event) => {
      const { threadId, question, answer } = event.detail;
      console.log('ThreadSaved event yakalandı:', { threadId, question: question?.substring(0, 50), answer: answer?.substring(0, 50) });
      
      setThreads(prevThreads => {
        const existingThread = prevThreads.find(t => t.thread_id === threadId || t.id?.toString() === threadId);
        
        if (!existingThread) {
          const newThread = {
            id: threadId,
            thread_id: threadId,
            thread_title: question?.slice(0, 100) || 'Yeni Sohbet',
            title: question?.slice(0, 100) || 'Yeni Sohbet',
            first_message: question?.slice(0, 200) || '',
            last_message: answer?.slice(0, 200) || '',
            message_count: 2,
            thread_created_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            last_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('Yeni thread listeye ekleniyor:', newThread);
          return [newThread, ...prevThreads];
        } else {
          console.log('Mevcut thread güncelleniyor:', threadId);
          return prevThreads.map(thread => 
            (thread.thread_id === threadId || thread.id?.toString() === threadId)
              ? { 
                  ...thread, 
                  last_message: answer?.slice(0, 200) || thread.last_message,
                  last_updated_at: new Date().toISOString(),
                  message_count: (thread.message_count || 0) + 2
                }
              : thread
          );
        }
      });
    };

    console.log('ThreadSaved event listener kuruluyor...');
    window.addEventListener('threadSaved', handleThreadSaved);
    
    return () => {
      console.log('ThreadSaved event listener temizleniyor...');
      window.removeEventListener('threadSaved', handleThreadSaved);
    };
  }, []); 
  
  const loadThreads = async () => {
    if (!user) {
      console.log('User yoktu, threads yüklenmiyor');
      return;
    }
    
    console.log('Threads API çağrılıyor...');
    try {
      let data;
      try {
        data = await threadsAPI.getAll();
        console.log('Threads API\'den gelen data:', data.length, 'adet');
      } catch (threadsError) {
        console.warn('Threads API başarısız, conversations API deneniyor...', threadsError);
        const conversations = await conversationsAPI.getAll();
        data = conversations.map(conv => ({
          id: conv.id,
          thread_id: conv.id.toString(), 
          thread_title: conv.question,
          title: conv.question, 
          first_message: conv.question,
          last_message: conv.answer,
          message_count: 2,
          thread_created_at: conv.created_at,
          created_at: conv.created_at,
          last_updated_at: conv.updated_at || conv.created_at,
          updated_at: conv.updated_at || conv.created_at
        }));
        console.log('Conversations API\'den çevrilen threads:', data.length, 'adet');
      }
      
      console.log('Threads listesi:', data);
      setThreads(data);
    } catch (error) {
      console.error('Load threads error:', error);
    }
  };
  
  const loadThreadMessages = async (threadId, setMessages, setCurrentThreadId) => {
    if (!user || !threadId) return;
    
    try {
      console.log('📂 Thread mesajları yükleniyor:', threadId, typeof threadId);
      
      const threadIdStr = threadId.toString();
      
      const currentThread = threads.find(t => t.thread_id === threadIdStr || t.id?.toString() === threadIdStr);
      
      let messages;
      try {
        messages = await threadsAPI.getMessages(threadIdStr);
        if (messages && messages.length > 0) {
          console.log('✅ Thread messages API başarılı:', messages.length, 'mesaj');
          const convertedMessages = convertThreadMessagesToChat(messages);
          setMessages(convertedMessages);
          setCurrentThreadId(threadIdStr);
          if (setCurrentThreadId) {
            setCurrentThreadId(threadIdStr); 
          }
          
          if (currentThread && messages[0]) {
            const firstUserMessage = messages.find(m => m.message_type === 'user');
            if (firstUserMessage && firstUserMessage.question) {
              console.log('🏷️ Thread başlığı güncelleniyor:', firstUserMessage.question.substring(0, 50));
              setThreads(prev => prev.map(thread => 
                (thread.thread_id === threadIdStr || thread.id?.toString() === threadIdStr)
                  ? { ...thread, thread_title: firstUserMessage.question, title: firstUserMessage.question }
                  : thread
              ));
            }
          }
          
          return;
        } else {
          console.warn('⚠️ Thread messages boş:', threadIdStr);
        }
      } catch (threadsError) {
        console.warn('⚠️ Threads messages API başarısız, conversation API deneniyor...', threadsError);
      }
      
      try {
        const conversation = await conversationsAPI.getById(threadId);
        if (conversation) {
          console.log('✅ Conversation API fallback başarılı');
          const convertedMessages = convertConversationToMessages(conversation);
          setMessages(convertedMessages);
          setCurrentThreadId(threadIdStr);
          if (setCurrentThreadId) {
            setCurrentThreadId(threadIdStr);
          }
        } else {
          console.warn('❌ Conversation bulunamadı:', threadId);
        }
      } catch (conversationError) {
        console.error('❌ Conversation API de başarısız:', conversationError);
      }
    } catch (error) {
      console.error('❌ Load thread messages error:', error);
    }
  };
  
  const deleteThread = async (threadId, createNewConversation) => {
    if (!user || !threadId) return false;
    
    const confirmed = window.confirm('Bu sohbeti silmek istediğinizden emin misiniz?');
    if (!confirmed) {
      return false;
    }

    try {
      const success = await threadsAPI.delete(threadId);
      
      if (success) {
        setThreads(prev => prev.filter(thread => thread.thread_id !== threadId));
        
        if (currentThreadId === threadId) {
          createNewConversation();
        }
        
        toast.success('Sohbet başarıyla silindi! 🗑️', {
          position: "top-right",
          autoClose: 3000,
        });
        
        return true;
      } else {
        toast.error('Sohbet silinirken hata oluştu!', {
          position: "top-right",
          autoClose: 4000,
        });
        return false;
      }
    } catch (error) {
      console.error('Delete thread error:', error);
      toast.error('Bağlantı hatası - Sohbet silinemedi!', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }
  };
  
  const createNewConversation = (setMessages, setCurrentThreadId) => {
    setCurrentThreadId(null);
    if (setCurrentThreadId) {
      setCurrentThreadId(null); 
    }
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
      loadThreads();
    } else {
      setThreads([]);
      setCurrentThreadId(null);
    }
  }, [user]);
  
  useEffect(() => {
    const handleClearChat = () => {
      setThreads([]);
      setCurrentThreadId(null);
    };
    
    const handleThreadSaved = (event) => {
      const { threadId, question, answer } = event.detail || {};
      console.log('🔔 Yeni thread event alındı:', threadId);
      
      if (threadId && question && answer) {
        addNewThread(threadId, question, answer);
        
        setTimeout(() => {
          console.log('🔄 Background thread refresh başlatılıyor...');
          loadThreads().then(() => {
            console.log('✅ Background thread refresh tamamlandı');
          }).catch(error => {
            console.error('❌ Background thread refresh başarısız:', error);
          });
        }, 1000);
      } else {
        console.warn('⚠️ Thread event data eksik:', { threadId, question, answer });
      }
    };
    
    window.addEventListener('clearChat', handleClearChat);
    window.addEventListener('threadSaved', handleThreadSaved);
    
    return () => {
      window.removeEventListener('clearChat', handleClearChat);
      window.removeEventListener('threadSaved', handleThreadSaved);
    };
  }, []);
  
  return {
    threads,
    currentThreadId,
    loadThreads,
    loadThreadMessages,
    deleteThread,
    createNewConversation
  };
};

const convertThreadMessagesToChat = (threadMessages) => {
  console.log('🔄 Thread mesajları çevriliyor:', threadMessages);
  
  const chatMessages = [
    {
      id: 1,
      type: "bot",
      content: "Hello, I'm your AI assistant. How can I assist you?",
      timestamp: new Date(),
    }
  ];
  
  const sortedMessages = threadMessages.sort((a, b) => (a.message_order || 0) - (b.message_order || 0));
  
  let currentQuestion = null;
  let messageId = 2;
  
  for (const msg of sortedMessages) {
    console.log(`📝 İşleniyor:`, {
      id: msg.id,
      type: msg.message_type,
      order: msg.message_order,
      question: msg.question?.slice(0, 30),
      answer: msg.answer?.slice(0, 30)
    });
    
    if (msg.message_type === 'user' && (msg.question || msg.content)) {
      chatMessages.push({
        id: messageId++,
        type: "user",
        content: msg.question || msg.content,
        timestamp: new Date(msg.created_at),
      });
      currentQuestion = msg.question || msg.content;
    } else if (msg.message_type === 'assistant' && (msg.answer || msg.content)) {
      chatMessages.push({
        id: messageId++,
        type: "bot",
        content: msg.answer || msg.content,
        timestamp: new Date(msg.created_at),
      });
    } else if (msg.question && msg.answer) {
      chatMessages.push({
        id: messageId++,
        type: "user",
        content: msg.question,
        timestamp: new Date(msg.created_at),
      });
      
      chatMessages.push({
        id: messageId++,
        type: "bot",
        content: msg.answer,
        timestamp: new Date(msg.created_at),
      });
    }
  }
  
  console.log('✅ Çevrilmiş chat mesajları:', chatMessages.length, 'adet');
  return chatMessages;
};
