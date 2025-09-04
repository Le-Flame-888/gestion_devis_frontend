import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsAPI } from '../../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ClientFormData {
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  code_postal: string;
}

const ClientForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<ClientFormData>({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      fetchClient(Number(id));
    }
  }, [id, isEdit]);

  const fetchClient = async (clientId: number) => {
    try {
      setLoading(true);
      const response = await clientsAPI.getById(clientId);
      const client = response.data;
      setFormData({
        nom: client.nom,
        email: client.email,
        telephone: client.telephone,
        adresse: client.adresse,
        ville: client.ville,
        code_postal: client.code_postal,
      });
    } catch (error) {
      setError('Échec du chargement du client');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      errors.nom = 'Le nom du client est requis';
    }
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email est invalide';
    }
    if (!formData.telephone.trim()) {
      errors.telephone = 'Le numéro de téléphone est requis';
    }
    if (!formData.adresse.trim()) {
      errors.adresse = 'L\'adresse est requise';
    }
    if (!formData.ville.trim()) {
      errors.ville = 'La ville est requise';
    }
    if (!formData.code_postal.trim()) {
      errors.code_postal = 'Le code postal est requis';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit && id) {
        await clientsAPI.update(Number(id), formData);
      } else {
        await clientsAPI.create(formData);
      }

      navigate('/clients');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour aux clients
        </button>
        <h1 className="text-2xl font-bold text-white">
          {isEdit ? 'Modifier le client' : 'Ajouter un client'}
        </h1>
        <div className="w-24"></div> {/* Pour l'alignement */}
      </div>

      <div className="bg-secondary rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Modifier le client' : 'Ajouter un client'}
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            {isEdit ? 'Mettre à jour les informations du client' : 'Ajouter un nouveau client à votre base de données'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-300 mb-1">
                Nom du client *
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                  validationErrors.nom ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Entrez le nom du client"
              />
              {validationErrors.nom && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.nom}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="client@example.com"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-300 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                validationErrors.telephone ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="+33 1 23 45 67 89"
            />
            {validationErrors.telephone && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.telephone}</p>
            )}
          </div>

          <div>
            <label htmlFor="adresse" className="block text-sm font-medium text-gray-300 mb-1">
              Adresse *
            </label>
            <textarea
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                validationErrors.adresse ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Entrez l'adresse"
            />
            {validationErrors.adresse && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.adresse}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ville" className="block text-sm font-medium text-gray-300 mb-1">
                Ville *
              </label>
              <input
                type="text"
                id="ville"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                  validationErrors.ville ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Entrez la ville"
              />
              {validationErrors.ville && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.ville}</p>
              )}
            </div>

            <div>
              <label htmlFor="code_postal" className="block text-sm font-medium text-gray-300 mb-1">
                Code postal *
              </label>
              <input
                type="text"
                id="code_postal"
                name="code_postal"
                value={formData.code_postal}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                  validationErrors.code_postal ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="75001"
              />
              {validationErrors.code_postal && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.code_postal}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent-cyan hover:bg-accent-cyan/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Enregistrement...'
              ) : isEdit ? (
                'Mettre à jour le client'
              ) : (
                'Ajouter le client'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
