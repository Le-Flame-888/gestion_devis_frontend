import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ProductFormData {
  nom: string;
  categorie: 'Marbre' | 'Carrelage' | 'Autre';
  unite: 'm2' | 'm3';
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<ProductFormData>({
    nom: '',
    categorie: 'Marbre',
    unite: 'm2',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      fetchProduct(Number(id));
    }
  }, [id, isEdit]);

  const fetchProduct = async (productId: number) => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(productId);
      const product = response.data;
      setFormData({
        nom: product.nom,
        categorie: product.categorie,
        unite: product.unite,
      });
    } catch (error) {
      setError('Échec du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      errors.nom = 'Le nom du produit est requis';
    }
    if (!formData.categorie) {
      errors.categorie = 'La catégorie est requise';
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

      const productData = {
        nom: formData.nom,
        categorie: formData.categorie,
        unite: formData.unite,
      };

      console.log('Données envoyées au serveur:', productData);

      let response;
      if (isEdit && id) {
        response = await productsAPI.update(Number(id), productData);
      } else {
        response = await productsAPI.create(productData);
      }

      console.log('Réponse du serveur:', response.data);
      navigate('/products');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du produit:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        if (error.response.status === 422 && error.response.data.errors) {
          // Formater les erreurs de validation du backend
          const formattedErrors: Record<string, string> = {};
          for (const [key, value] of Object.entries(error.response.data.errors)) {
            formattedErrors[key] = Array.isArray(value) ? value[0] : String(value);
          }
          setValidationErrors(formattedErrors);
          setError('Veuillez corriger les erreurs dans le formulaire.');
        } else {
          setError(error.response.data.message || 'Une erreur est survenue lors de la sauvegarde du produit.');
        }
      } else {
        setError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          onClick={() => navigate('/products')}
          className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux produits
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700/50">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {isEdit ? 'Mettez à jour les informations du produit' : 'Ajoutez un nouveau produit à votre catalogue'}
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
                Nom du produit *
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
                  placeholder="Entrez le nom du produit"
                />
              </div>
              {validationErrors.nom && (
                <p className="mt-1.5 text-sm text-status-error dark:text-status-error-light">
                  {validationErrors.nom}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="unite" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Unité *
              </label>
              <div className="relative">
                <select
                  id="unite"
                  name="unite"
                  value={formData.unite}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 bg-white dark:bg-neutral-700/50 border rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                    validationErrors.unite ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                  }`}
                >
                  <option value="m2" className="text-neutral-900 dark:text-white">m²</option>
                  <option value="m3" className="text-neutral-900 dark:text-white">m³</option>
                </select>
              </div>
              {validationErrors.unite && (
                <p className="mt-1.5 text-sm text-status-error dark:text-status-error-light">
                  {validationErrors.unite}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="categorie" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Catégorie *
            </label>
            <div className="relative">
              <select
                id="categorie"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-neutral-700/50 border rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  validationErrors.categorie ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                }`}
              >
                <option value="Marbre" className="text-neutral-900 dark:text-white">Marbre</option>
                <option value="Carrelage" className="text-neutral-900 dark:text-white">Carrelage</option>
                <option value="Autre" className="text-neutral-900 dark:text-white">Autre</option>
              </select>
            </div>
            {validationErrors.categorie && (
              <p className="mt-1.5 text-sm text-status-error dark:text-status-error-light">
                {validationErrors.categorie}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-neutral-200 dark:border-neutral-700/50">
            <button
              type="button"
              onClick={() => navigate('/products')}
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
                'Mettre à jour le produit'
              ) : (
                'Créer le produit'
              )}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;