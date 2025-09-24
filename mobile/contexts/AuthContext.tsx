import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RegistrationApprovalService } from '../services/RegistrationApprovalService';

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

  // Test credentials for development (in production, this should be secured)
  const TEST_CREDENTIALS: Array<{
    username: string;
    password: string;
    name: string;
    id: string;
    role: 'admin' | 'doctor' | 'patient' | 'pharmacy';
  }> = [
    {
      username: 'doctor1',
      password: 'doctor123',
      name: 'Dr. Rajesh Kumar',
      id: 'doc_001',
      role: 'doctor'
    },
    {
      username: 'chemist1',
      password: 'chemist123',
      name: 'Pharmacist Priya Singh',
      id: 'pharm_001',
      role: 'pharmacy'
    },
    {
      username: 'che_bhal_2373',
      password: 'che2373@79OX',
      name: 'Pharmacist Bhal',
      id: 'pharm_002',
      role: 'pharmacy'
    },
    {
      username: 'che_lol_2215',
      password: 'che2215@SED1',
      name: 'Pharmacist Lol',
      id: 'pharm_003',
      role: 'pharmacy'
    },
    {
      username: 'patient1',
      password: 'patient123',
      name: 'Amit Sharma',
      id: 'pat_001',
      role: 'patient'
    }
  ];

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Check if admin credentials
      if (username.toLowerCase() === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: ADMIN_CREDENTIALS.id,
          email: 'admin@sihmedical.com',
          name: ADMIN_CREDENTIALS.name,
          role: 'admin',
          isAdmin: true
        };
        setUserState(adminUser);
        return true;
      }

      // Check test credentials (for development)
      const testUser = TEST_CREDENTIALS.find(cred => 
        cred.username.toLowerCase() === username.toLowerCase() && cred.password === password
      );
      
      if (testUser) {
        const user: User = {
          id: testUser.id,
          email: `${testUser.username}@sihmedical.com`,
          name: testUser.name,
          role: testUser.role,
          isAdmin: testUser.role === 'admin'
        };
        setUserState(user);
        return true;
      }

      // Check approved users from registration system
      const approvedUser = await RegistrationApprovalService.authenticateUser(username, password);
      if (approvedUser) {
        const user: User = {
          id: approvedUser.id,
          email: approvedUser.email,
          name: approvedUser.fullName,
          role: approvedUser.role,
          isAdmin: approvedUser.role === 'admin'
        };
        setUserState(user);
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