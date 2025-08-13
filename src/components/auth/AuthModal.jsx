import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/auth";
import { toast } from "react-toastify";
const AuthModal = ({ onLoadConversations }) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    showAuthModal, 
    authMode, 
    authForm, 
    setAuthMode, 
    setAuthForm, 
    login, 
    closeAuthModal 
  } = useAuth();
  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authMode === 'signin') {
        const data = await authAPI.signIn(authForm.email, authForm.password);
        
        const clearChat = data.clear_chat || false;
        
        login(data.user, data.access_token, clearChat);
        
        if (onLoadConversations) {
          onLoadConversations();
        }
        
        toast.success(`Hoş geldiniz, ${data.user.email}!`, {
          position: "top-right",
          autoClose: 3000,
        });
        
      } else {
        await authAPI.signUp(authForm.email, authForm.password, authForm.fullName);
        setAuthMode('signin');
        setAuthForm({ email: authForm.email, password: '', fullName: '' });
        
        toast.success('Kayıt başarılı! Şimdi giriş yapabilirsiniz.', {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } catch (error) {
      toast.error(error.message || 'Bir hata oluştu!', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const switchMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    setAuthForm({ email: '', password: '', fullName: '' });
  };
  if (!showAuthModal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {authMode === 'signin' ? 'Giriş Yap' : 'Kayıt Ol'}
            </h2>
            <button
              onClick={closeAuthModal}
              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Ad Soyad
                </label>
                <input
                  type="text"
                  disabled={isLoading}
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isLoading 
                      ? isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } focus:outline-none`}
                  placeholder="Adınızı girin"
                />
              </div>
            )}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                E-posta
              </label>
              <input
                type="email"
                required
                disabled={isLoading}
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isLoading 
                    ? isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                } focus:outline-none`}
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Şifre
              </label>
              <input
                type="password"
                required
                disabled={isLoading}
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isLoading 
                    ? isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                } focus:outline-none`}
                placeholder="••••••••"
                minLength="6"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                isLoading
                  ? isDarkMode 
                    ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                    : 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-[1.02] active:scale-[0.98]' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              <span>
                {isLoading 
                  ? (authMode === 'signin' ? 'Giriş yapılıyor...' : 'Kayıt yapılıyor...')
                  : (authMode === 'signin' ? 'Giriş Yap' : 'Kayıt Ol')
                }
              </span>
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              disabled={isLoading}
              className={`text-sm transition-colors ${
                isLoading
                  ? isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                  : isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              {authMode === 'signin' 
                ? 'Hesabınız yok mu? Kayıt olun' 
                : 'Zaten hesabınız var mı? Giriş yapın'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AuthModal;
