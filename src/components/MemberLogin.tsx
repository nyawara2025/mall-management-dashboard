import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function MemberLogin({ shopId }: { shopId: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border">
        <h2 className="text-2xl font-black mb-6 text-center">Church Member Login</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <input 
          type="text" placeholder="Username" 
          className="w-full p-4 mb-4 border rounded-xl"
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="password" placeholder="Password" 
          className="w-full p-4 mb-6 border rounded-xl"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">
          Access Church Hub
        </button>
      </form>
    </div>
  );
}
