import { X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/auth";
const AuthModal = ({ onLoadConversations }) => {
  const { isDarkMode } = useTheme();
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
    
    try {
      if (authMode === 'signin') {
        const data = await authAPI.signIn(authForm.email, authForm.password);
        
        // Backend'den clear_chat flag'ini kontrol et
        const clearChat = data.clear_chat || false;
        
        login(data.user, data.access_token, clearChat);
        
        if (onLoadConversations) {
          onLoadConversations();
        }
      } else {
        await authAPI.signUp(authForm.email, authForm.password, authForm.fullName);
        setAuthMode('signin');
        setAuthForm({ email: authForm.email, password: '', fullName: '' });
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      }
    } catch (error) {
      alert(error.message);
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
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDarkMode 
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
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode 
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
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                } focus:outline-none`}
                placeholder="••••••••"
                minLength="6"
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {authMode === 'signin' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className={`text-sm ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-purple-600 hover:text-purple-700'
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
