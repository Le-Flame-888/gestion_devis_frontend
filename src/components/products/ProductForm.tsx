import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import type { Product } from '../../types';
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center text-accent hover:text-accent/80 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Products
        </button>
      </div>

      <div className="bg-secondary rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            {isEdit ? 'Mettre à jour les informations du produit' : 'Ajouter un nouveau produit au catalogue'}
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
              <label htmlFor="nom" className="block text-sm font-medium text-gray-300 mb-2">
                Nom du produit *
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
                placeholder="Entrez le nom du produit"
              />
              {validationErrors.nom && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.nom}</p>
              )}
            </div>

            <div>
              <label htmlFor="unite" className="block text-sm font-medium text-gray-300 mb-2">
                Unité *
              </label>
              <select
                id="unite"
                name="unite"
                value={formData.unite}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              >
                <option value="m2">m²</option>
                <option value="m3">m³</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="categorie" className="block text-sm font-medium text-gray-300 mb-2">
              Catégorie *
            </label>
            <select
              id="categorie"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                validationErrors.categorie ? 'border-red-500' : 'border-gray-600'
              }`}
            >
              <option value="Marbre">Marbre</option>
              <option value="Carrelage">Carrelage</option>
              <option value="Autre">Autre</option>
            </select>
            {validationErrors.categorie && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.categorie}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-primary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#D7FEFA' }}
            >
              {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;