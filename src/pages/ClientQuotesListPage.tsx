import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientsAPI } from '../services/api';
import {
  UserGroupIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  XMarkIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Client {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  ville?: string;
  code_postal?: string;
  created_at?: string;
  updated_at?: string;
}

const ClientQuotesListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.telephone && client.telephone.includes(searchTerm))
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const fetchClients = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const response = await clientsAPI.getAll(1);
      setClients(response.data.data);
      setFilteredClients(response.data.data);
    } catch (err) {
      setError('Erreur lors du chargement des clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClients(false);
  };

  if (loading && !refreshing) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement des clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Erreur</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-200 shadow-sm hover:bg-red-100 dark:hover:bg-red-800/30"
                >
                  <ArrowPathIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Clients</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 transition-colors"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
          <Link
            to="/clients/new"
            className="inline-flex items-center px-4 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Nouveau client
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-colors"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300" />
            </button>
          )}
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 p-8 text-center">
          <UserGroupIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">Aucun client trouvé</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {searchTerm
              ? "Aucun client ne correspond à votre recherche."
              : "Commencez par ajouter votre premier client."}
          </p>
          <div className="mt-6">
            <Link
              to="/clients/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nouveau client
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {client.nom}
                    </h3>
                    {client.email && (
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                        {client.email}
                      </p>
                    )}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserGroupIcon className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {(client.telephone || client.ville || client.code_postal) && (
                  <div className="mt-4 space-y-2">
                    {client.telephone && (
                      <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="text-neutral-500 dark:text-neutral-500 mr-2">Tél:</span>
                        <a href={`tel:${client.telephone}`} className="hover:text-primary">
                          {client.telephone}
                        </a>
                      </div>
                    )}
                    {(client.ville || client.code_postal) && (
                      <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="text-neutral-500 dark:text-neutral-500 mr-2">Adresse:</span>
                        <span>{[client.ville, client.code_postal].filter(Boolean).join(' - ')}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex justify-between items-center">
                  <Link
                    to={`/clients/${client.id}/quotes`}
                    className="inline-flex items-center px-3 py-1.5 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700/30 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/30 transition-colors"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Voir les devis
                  </Link>
                  <Link
                    to={`/clients/${client.id}/edit`}
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientQuotesListPage;
