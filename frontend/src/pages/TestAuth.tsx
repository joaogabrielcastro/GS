import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const TestAuth: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1>Estado da Autenticação</h1>
      <div className="mt-4">
        <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        <p><strong>LocalStorage token:</strong> {localStorage.getItem('token') ? 'exists' : 'null'}</p>
        <p><strong>LocalStorage user:</strong> {localStorage.getItem('user') || 'null'}</p>
      </div>
    </div>
  );
};

export default TestAuth;