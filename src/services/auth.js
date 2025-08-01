const API_BASE = 'http://localhost:8000';
export const authAPI = {
  signIn: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Giriş başarısız');
    }
    
    return data;
  },
  signUp: async (email, password, fullName) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName
      }),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Kayıt başarısız');
    }
    
    return data;
  },
  signOut: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      await fetch(`${API_BASE}/auth/signout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};
