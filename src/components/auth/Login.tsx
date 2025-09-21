import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-accent-cyan mb-2">Gestion des Devis</h1>
          <h2 className="text-2xl font-semibold text-text-primary">
            Content de vous revoir
          </h2>
          <p className="mt-2 text-text-secondary">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>
        
        <div className="bg-dark-card rounded-xl shadow-card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 bg-dark-bg border border-gray-600 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan transition-colors"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 bg-dark-bg border border-gray-600 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan transition-colors"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-cyan text-dark-bg font-semibold py-3 px-4 rounded-lg hover:bg-accent-cyan/90 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-dark-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-dark-bg/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-text-primary mb-3">Comptes de démo :</h3>
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span className="font-medium text-accent-cyan">Admin :</span>
                <span>admin@example.com / password</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-accent-cyan">Utilisateur :</span>
                <span>user@example.com / password</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              N'hésitez pas à utiliser l'un de ces comptes pour explorer l'application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
