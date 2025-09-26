import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsAPI } from '../../services/api';
import type { Client } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchClients();
  }, [currentPage]);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll(currentPage);
      setClients(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await clientsAPI.delete(id);
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center justify-between">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors sm:hidden"
            >
              <ArrowLeftIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Clients</h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Liste de tous les clients avec leurs coordonnées et adresse.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/clients/new')}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 transition-colors shadow-sm hover:shadow-md"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter un client
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-700/30">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Nom
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th scope="col" className="relative px-6 py-3.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700/50">
                {clients.length > 0 ? (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {client.nom}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {client.email && (
                          <div className="text-sm text-neutral-600 dark:text-neutral-300">{client.email}</div>
                        )}
                        {client.telephone && (
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">{client.telephone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-white">
                          {client.ville}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {client.code_postal}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => navigate(`/clients/${client.id}/quotes`)}
                            className="text-neutral-400 hover:text-primary dark:hover:text-primary-light transition-colors p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            title="Voir les devis"
                          >
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/clients/edit/${client.id}`)}
                            className="text-neutral-400 hover:text-blue-500 transition-colors p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            title="Modifier"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="text-neutral-400 hover:text-status-error transition-colors p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Aucun client trouvé.
                      </div>
                      <div className="mt-2">
                        <button
                          onClick={() => navigate('/clients/new')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
                        >
                          <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                          Ajouter un client
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              Suivant
              <svg className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
