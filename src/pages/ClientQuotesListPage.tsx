import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientsAPI } from '../services/api';
import { UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Client {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  ville?: string;
  code_postal?: string;
}

const ClientQuotesListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await clientsAPI.getAll(1); // Récupère la première page
        setClients(response.data.data);
      } catch (err) {
        setError('Erreur lors du chargement des clients');
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Devis par client</h1>
        <p className="text-gray-300">Sélectionnez un client pour voir ses devis</p>
      </div>

      <div className="bg-secondary rounded-lg shadow-lg p-6">
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucun client trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div 
                key={client.id} 
                className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-white">{client.nom}</h3>
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <UserGroupIcon className="h-5 w-5 text-accent" />
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-300 mb-4">
                  {client.email && <p>{client.email}</p>}
                  {client.telephone && <p>{client.telephone}</p>}
                  {(client.ville || client.code_postal) && (
                    <p>{[client.ville, client.code_postal].filter(Boolean).join(' - ')}</p>
                  )}
                </div>

                <Link
                  to={`/clients/${client.id}/quotes`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-sm font-medium transition-colors"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  Voir les devis
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientQuotesListPage;
