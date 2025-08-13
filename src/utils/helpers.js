export const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Kopyalama başarısız:", err);
    return false;
  }
};
export const getWelcomeMessage = () => ({
  id: 1,
  type: "bot",
  content: "Hello, I'm your AI assistant. How can I assist you?",
  timestamp: new Date(),
});
export const convertConversationToMessages = (conversation) => {
  const conversationDate = new Date(conversation.created_at);
  
  return [
    {
      id: 1,
      type: "bot",
      content: "Hello, I'm your AI assistant. How can I assist you?",
      timestamp: new Date(conversationDate.getTime() - 1000),
    },
    {
      id: 2,
      type: "user",
      content: conversation.question,
      timestamp: conversationDate,
    },
    {
      id: 3,
      type: "bot",
      content: conversation.answer,
      timestamp: new Date(conversationDate.getTime() + 1000),
    }
  ];
};
