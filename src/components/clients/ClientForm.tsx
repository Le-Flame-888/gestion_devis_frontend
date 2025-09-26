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

    // Seul le nom est obligatoire
    if (!formData.nom.trim()) {
      errors.nom = 'Le nom du client est requis';
    }

    // Validation optionnelle de l'email s'il est renseigné
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email est invalide';
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux clients
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700/50">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {isEdit ? 'Modifier le client' : 'Nouveau client'}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {isEdit ? 'Mettez à jour les informations du client' : 'Ajoutez un nouveau client à votre base de données'}
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-status-error/10 border border-status-error/30 rounded-lg p-4">
              <div className="text-sm text-status-error dark:text-status-error-light">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nom du client *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-white dark:bg-neutral-700/50 border rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                      validationErrors.nom ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                    placeholder="Entrez le nom du client"
                  />
                </div>
                {validationErrors.nom && (
                  <p className="mt-1.5 text-sm text-status-error dark:text-status-error-light">
                    {validationErrors.nom}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-white dark:bg-neutral-700/50 border rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                      validationErrors.email ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                    placeholder="client@example.com"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1.5 text-sm text-status-error dark:text-status-error-light">
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Téléphone
            </label>
            <div className="relative">
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-neutral-700/50 border rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  validationErrors.telephone ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            {validationErrors.telephone && (
              <p className="mt-1.5 text-sm text-status-error dark:text-status-error-light">
                {validationErrors.telephone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="adresse" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Adresse
            </label>
            <div className="relative">
              <textarea
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-neutral-700/50 border rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  validationErrors.adresse ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="Entrez l'adresse complète"
              />
            </div>
            {validationErrors.adresse && (
              <p className="mt-1.5 text-sm text-status-error dark:text-status-error-light">
                {validationErrors.adresse}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ville" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Ville
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 bg-white dark:bg-neutral-700/50 border rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                    validationErrors.ville ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                  }`}
                  placeholder="Entrez la ville"
                />
              </div>
              {validationErrors.ville && (
                <p className="mt-1.5 text-sm text-status-error dark:text-status-error-light">
                  {validationErrors.ville}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="code_postal" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Code postal
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="code_postal"
                  name="code_postal"
                  value={formData.code_postal}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 bg-white dark:bg-neutral-700/50 border rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                    validationErrors.code_postal ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                  }`}
                  placeholder="75001"
                />
              </div>
              {validationErrors.code_postal && (
                <p className="mt-1.5 text-sm text-status-error dark:text-status-error-light">
                  {validationErrors.code_postal}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-neutral-200 dark:border-neutral-700/50">
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 inline-flex items-center shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
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
    </div>
  );
};

export default ClientForm;