import { Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const NewChatButton = ({ onCreateNew }) => {
  const { isDarkMode } = useTheme();

  return (
    <button
      onClick={onCreateNew}
      className={`w-full flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
        isDarkMode 
          ? 'border-gray-600 hover:bg-gray-700 text-white' 
          : 'border-gray-300 hover:bg-gray-50 text-gray-900'
      }`}
    >
      <Plus className="w-4 h-4" />
      <span>Yeni Sohbet</span>
    </button>
  );
};

export default NewChatButton;
