import { createContext, useContext, useState, useEffect } from 'react';
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
      setUser(JSON.parse(savedUser));
    }
  }, []);
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
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
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};
