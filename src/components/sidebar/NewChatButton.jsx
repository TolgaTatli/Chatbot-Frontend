import { Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";

const NewChatButton = ({ onCreateNew }) => {
  const { isDarkMode } = useTheme();

  const handleNewChat = () => {
    onCreateNew();
    
    // Yeni sohbet toast'ı
    toast.info('Yeni sohbet oluşturuldu! ✨', {
      position: "top-right",
      autoClose: 2000,
    });
  };
  return (
    <button
      onClick={handleNewChat}
      className={`w-full flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
        isDarkMode 
          ? 'border-gray-600 hover:bg-gray-700 text-white hover:border-gray-500' 
          : 'border-gray-300 hover:bg-gray-50 text-gray-900 hover:border-gray-400'
      }`}
      title="Yeni sohbet başlat"
    >
      <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
      <span>Yeni Sohbet</span>
    </button>
  );
};
export default NewChatButton;
