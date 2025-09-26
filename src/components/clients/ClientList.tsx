import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsAPI } from '../../services/api';
import type { Client } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="mt-2 text-sm text-gray-300">
            Liste de tous les clients avec leurs coordonnées et adresse.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/clients/new')}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-primary shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary transition-colors"
            style={{ backgroundColor: '#D7FEFA' }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter un client
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-secondary divide-y divide-gray-600">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {client.nom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{client.email}</div>
                    <div className="text-sm text-gray-300">{client.telephone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{client.ville}</div>
                    <div className="text-sm text-gray-300">{client.code_postal}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => navigate(`/clients/${client.id}/quotes`)}
                      className="text-green-400 hover:text-green-300"
                      title="Voir les devis"
                    >
                      <DocumentTextIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/clients/edit/${client.id}`)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Modifier"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-white bg-secondary border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-white bg-secondary border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientList;
