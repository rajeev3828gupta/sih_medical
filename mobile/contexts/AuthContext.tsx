import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'patient' | 'pharmacy';
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);

  // Admin credentials (in production, this should be secured)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123',
    name: 'System Administrator',
    id: 'admin_001',
    role: 'admin' as const
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Check if admin credentials
      if (username.toLowerCase() === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: ADMIN_CREDENTIALS.id,
          email: 'admin@sihmedical.com', // Keep email for display purposes
          name: ADMIN_CREDENTIALS.name,
          role: 'admin',
          isAdmin: true
        };
        setUserState(adminUser);
        return true;
      }

      // Regular user authentication (mock implementation)
      // In production, this would call your backend API
      if (username && password) {
        // Simulate different user types based on username
        let userRole: 'doctor' | 'patient' | 'pharmacy' = 'patient';
        let userName = username;
        
        if (username.toLowerCase().includes('doctor') || username.toLowerCase().includes('dr')) {
          userRole = 'doctor';
          userName = `Dr. ${username}`;
        } else if (username.toLowerCase().includes('chemist') || username.toLowerCase().includes('pharmacy')) {
          userRole = 'pharmacy';
          userName = `${username} Pharmacy`;
        }

        const regularUser: User = {
          id: 'user_' + Date.now(),
          email: username + '@sihmedical.com', // Generate email from username
          name: userName, // Use username as name
          role: userRole,
          isAdmin: false
        };
        setUserState(regularUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUserState(null);
  };

  const setUser = (newUser: User) => {
    setUserState(newUser);
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.isAdmin || false,
    login,
    logout,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};