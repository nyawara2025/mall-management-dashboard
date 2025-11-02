import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const realCredentials = [
    { username: 'bosco', password: 'demo123', role: 'Super Admin', description: 'Access to all malls and shops' },
    { username: 'jane', password: 'demo123', role: 'Mall Admin', description: 'China Square Mall only' },
    { username: 'faith', password: 'demo123', role: 'Mall Admin', description: 'Langata Mall only' },
    { username: 'ngina', password: 'demo123', role: 'Mall Admin', description: 'NHC Mall only' },
    { username: 'ben', password: 'demo123', role: 'Shop Admin', description: 'Spatial Barbershop - China Square Mall' },
    { username: 'sandra', password: 'demo123', role: 'Shop Admin', description: 'Kika Wines - Langata Mall' },
    { username: 'andrew', password: 'demo123', role: 'Shop Admin', description: 'The Phone Shop - Langata Mall' },
    { username: 'fred', password: 'demo123', role: 'Shop Admin', description: 'Cleanshelf SupaMarket - Langata Mall' },
    { username: 'ibrahim', password: 'demo123', role: 'Shop Admin', description: 'Maliet Salon & Spa - NHC Mall' },
  ];

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Building2 className="w-8 h-8 text-primary-700" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Mall Management
            </h1>
            <p className="text-text-secondary">
              Secure access to your mall management dashboard
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-text-secondary" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field pl-10 w-full"
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-text-secondary" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10 w-full"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  
``` setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-text-secondary hover:text-text-primary" />
                    ) : (
                      <Eye className="h-5 w-5 text-text-secondary hover:text-text-primary" />
                    )}
                  ```

                </div>
              </div>

              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-sm">
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}

                        {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          ```

        </form>
      </div>
    </div>

    <div className="hidden lg:block">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Real User Credentials
          </h2>
          <p className="text-text-secondary">
            Use these accounts to access different user roles
          </p>
        </div>

        <div className="space-y-4">
          {realCredentials.map((cred, index) => (
            <div key={index} className="card border-l-4 border-primary-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text-primary">
                      {cred.username}
                    </h3>
                    <span className="tag">
                      {cred.role}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">
                    {cred.description}
                  </p>
                  <p className="text-xs text-text-secondary font-mono">
                    Password: {cred.password}
                  </p>
                </div>
                
                        setUsername(cred.username);
                        setPassword(cred.password);
                      }}
                      className="btn-secondary text-xs px-3 py-1"
                      disabled={isLoading}
                    >
                      Use
                    ```

                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface-bg border border-border-subtle rounded-md p-4">
              <h4 className="font-medium text-text-primary mb-2">
                Role-Based Access
              </h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• <strong>Super Admin:</strong> Can see all malls and shops</li>
                <li>• <strong>Mall Admin:</strong> Can see only their assigned mall</li>
                <li>• <strong>Shop Admin:</strong> Can see only their shop</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  
