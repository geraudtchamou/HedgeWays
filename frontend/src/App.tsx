import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppStore } from '@/hooks/useStore';

const App: React.FC = () => {
  const { login } = useAppStore();
  
  useEffect(() => {
    // Simulate authentication - in production, validate token with backend
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // Demo login for development
      const demoUser = {
        id: 'user-1',
        email: 'investor@example.com',
        name: 'Alex Johnson',
        role: 'INVESTOR' as const,
        kycStatus: 'VERIFIED' as const,
        createdAt: new Date().toISOString(),
      };
      login(demoUser, 'demo-token');
    }
  }, [login]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
};

export default App;
