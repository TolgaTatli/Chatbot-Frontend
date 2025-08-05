import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
const AuthContext = createContext();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '' });
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      // Token'ı doğrula
      validateToken(token);
    }

    // Auth error listener ekle
    const handleAuthError = () => {
      logout();
    };

    window.addEventListener('authError', handleAuthError);
    return () => window.removeEventListener('authError', handleAuthError);
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        // Token geçersiz - temizle
        console.log('🔄 Token geçersiz, temizleniyor...');
        logout();
      }
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      logout();
    }
  };
  const login = (userData, token, clearChat = false) => {
    setUser(userData);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Eğer backend clear_chat flag'ini gönderdiyse chat geçmişini temizle
    if (clearChat) {
      localStorage.removeItem('chatHistory');
      localStorage.removeItem('currentConversation');
      // Custom event dispatch ederek chat component'inin dinlemesini sağla
      window.dispatchEvent(new CustomEvent('clearChat'));
    }
    
    setShowAuthModal(false);
  };
  const logout = async () => {
    try {
      await fetch('http://localhost:8000/auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Çıkış başarılı toast'ı
      toast.info('Başarıyla çıkış yaptınız! 👋', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const openAuthModal = (mode = 'signin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };
  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthForm({ email: '', password: '', fullName: '' });
  };
  return (
    <AuthContext.Provider value={{
      user,
      showAuthModal,
      authMode,
      authForm,
      setAuthMode,
      setAuthForm,
      login,
      logout,
      openAuthModal,
      closeAuthModal,
      validateToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
