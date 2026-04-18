import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (currentUser && token) {
      try {
        const userData = JSON.parse(currentUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        if (userData.role === 'parent' && userData.children?.length > 0) {
          const lastChildId = localStorage.getItem('selectedChildId');
          const found = userData.children.find(c => (c.studentId || c.id) === lastChildId);
          setSelectedChild(found || userData.children[0]);
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent-student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        const userData = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);

        if (userData.role === 'parent' && userData.children?.length > 0) {
          const firstChild = userData.children[0];
          setSelectedChild(firstChild);
          localStorage.setItem('selectedChildId', firstChild.studentId || firstChild.id);
        }

        navigate('/dashboard');
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Server connection failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setSelectedChild(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('selectedChildId');
    localStorage.removeItem('activeComponent');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, selectedChild, setSelectedChild, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};