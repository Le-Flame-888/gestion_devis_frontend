import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import type { Product } from '../../types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ProductFormData {
  nom: string;
  description: string;
  prix_unitaire: string;
  unite: 'm2' | 'm3';
  stock: string;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<ProductFormData>({
    nom: '',
    description: '',
    prix_unitaire: '',
    unite: 'm2',
    stock: '',
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
        description: product.description,
        prix_unitaire: product.prix_unitaire.toString(),
        unite: product.unite,
        stock: product.stock.toString(),
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
    if (!formData.description.trim()) {
      errors.description = 'La description est requise';
    }
    if (!formData.prix_unitaire || Number(formData.prix_unitaire) <= 0) {
      errors.prix_unitaire = 'Un prix valide est requis';
    }
    if (!formData.stock || Number(formData.stock) < 0) {
      errors.stock = 'Une quantité en stock valide est requise';
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
        description: formData.description,
        prix_unitaire: Number(formData.prix_unitaire),
        unite: formData.unite,
        stock: Number(formData.stock),
      };

      if (isEdit && id) {
        await productsAPI.update(Number(id), productData);
      } else {
        await productsAPI.create(productData);
      }

      navigate('/products');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save product');
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                validationErrors.description ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Entrez la description du produit"
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="prix_unitaire" className="block text-sm font-medium text-gray-300 mb-2">
                Prix unitaire (€) *
              </label>
              <input
                type="number"
                id="prix_unitaire"
                name="prix_unitaire"
                value={formData.prix_unitaire}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                  validationErrors.prix_unitaire ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="0.00"
              />
              {validationErrors.prix_unitaire && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.prix_unitaire}</p>
              )}
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-2">
                Quantité en stock *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                  validationErrors.stock ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="0"
              />
              {validationErrors.stock && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.stock}</p>
              )}
            </div>
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
