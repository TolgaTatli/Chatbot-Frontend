import { User, LogIn, LogOut } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const UserSection = () => {
  const { isDarkMode } = useTheme();
  const { user, logout, openAuthModal } = useAuth();

  if (user) {
    return (
      <div className="space-y-3">
        <div className={`flex items-center space-x-3 p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-purple-600'}`}>
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'text-red-400 hover:bg-red-900/20' 
              : 'text-red-600 hover:bg-red-50'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => openAuthModal('signin')}
      className={`w-full flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
        isDarkMode 
          ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700' 
          : 'border-purple-600 bg-purple-600 text-white hover:bg-purple-700'
      }`}
    >
      <LogIn className="w-4 h-4" />
      <span>Giriş Yap</span>
    </button>
  );
};

export default UserSection;
