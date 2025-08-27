import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quotesAPI, clientsAPI, productsAPI } from '../../services/api';
import type { Quote, Client, Product } from '../../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface QuoteFormData {
  numero_devis: string;
  client_id: string;
  date_devis: string;
  date_validite: string;
  statut: 'draft' | 'sent' | 'accepted' | 'refused';
  tva: string;
}

interface QuoteDetail {
  product_id: string;
  quantite: string;
  prix_unitaire: string;
}

const QuoteForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<QuoteFormData>({
    numero_devis: '',
    client_id: '',
    date_devis: new Date().toISOString().split('T')[0],
    date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statut: 'draft',
    tva: '20',
  });
  const [details, setDetails] = useState<QuoteDetail[]>([
    { product_id: '', quantite: '', prix_unitaire: '' }
  ]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchClients();
    fetchProducts();
    if (isEdit && id) {
      fetchQuote(Number(id));
    } else {
      generateQuoteNumber();
    }
  }, [id, isEdit]);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll(1);
      setClients(response.data.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll(1);
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const generateQuoteNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({ ...prev, numero_devis: `DEV-${year}${month}${day}-${random}` }));
  };

  const fetchQuote = async (quoteId: number) => {
    try {
      setLoading(true);
      const response = await quotesAPI.getById(quoteId);
      const quote = response.data;
      setFormData({
        numero_devis: quote.numero_devis,
        client_id: quote.client_id.toString(),
        date_devis: quote.date_devis.split('T')[0],
        date_validite: quote.date_validite.split('T')[0],
        statut: quote.statut,
        tva: quote.tva.toString(),
      });
      if (quote.details && quote.details.length > 0) {
        setDetails(quote.details.map((detail: any) => ({
          product_id: detail.product_id.toString(),
          quantite: detail.quantite.toString(),
          prix_unitaire: detail.prix_unitaire.toString(),
        })));
      }
    } catch (error) {
      setError('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.numero_devis.trim()) {
      errors.numero_devis = 'Quote number is required';
    }
    if (!formData.client_id) {
      errors.client_id = 'Client is required';
    }
    if (!formData.date_devis) {
      errors.date_devis = 'Quote date is required';
    }
    if (!formData.date_validite) {
      errors.date_validite = 'Validity date is required';
    }
    if (Number(formData.tva) < 0 || Number(formData.tva) > 100) {
      errors.tva = 'VAT must be between 0 and 100';
    }

    // Validate details
    details.forEach((detail, index) => {
      if (!detail.product_id) {
        errors[`detail_${index}_product`] = 'Product is required';
      }
      if (!detail.quantite || Number(detail.quantite) <= 0) {
        errors[`detail_${index}_quantite`] = 'Valid quantity is required';
      }
      if (!detail.prix_unitaire || Number(detail.prix_unitaire) <= 0) {
        errors[`detail_${index}_prix`] = 'Valid price is required';
      }
    });

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

      const quoteData = {
        numero_devis: formData.numero_devis,
        client_id: Number(formData.client_id),
        date_devis: formData.date_devis,
        date_validite: formData.date_validite,
        statut: formData.statut,
        tva: Number(formData.tva),
        details: details.map(detail => ({
          product_id: Number(detail.product_id),
          quantite: Number(detail.quantite),
          prix_unitaire: Number(detail.prix_unitaire),
        })),
      };

      if (isEdit && id) {
        await quotesAPI.update(Number(id), quoteData);
      } else {
        await quotesAPI.create(quoteData);
      }

      navigate('/quotes');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save quote');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDetailChange = (index: number, field: keyof QuoteDetail, value: string) => {
    setDetails(prev => prev.map((detail, i) => 
      i === index ? { ...detail, [field]: value } : detail
    ));

    // Auto-fill price when product is selected
    if (field === 'product_id' && value) {
      const product = products.find(p => p.id === Number(value));
      if (product) {
        setDetails(prev => prev.map((detail, i) => 
          i === index ? { ...detail, prix_unitaire: product.prix_unitaire.toString() } : detail
        ));
      }
    }

    // Clear validation errors
    const errorKey = `detail_${index}_${field === 'product_id' ? 'product' : field === 'quantite' ? 'quantite' : 'prix'}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const addDetail = () => {
    setDetails(prev => [...prev, { product_id: '', quantite: '', prix_unitaire: '' }]);
  };

  const removeDetail = (index: number) => {
    if (details.length > 1) {
      setDetails(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const totalHT = details.reduce((sum, detail) => {
      const quantity = Number(detail.quantite) || 0;
      const price = Number(detail.prix_unitaire) || 0;
      return sum + (quantity * price);
    }, 0);
    
    const tvaAmount = totalHT * (Number(formData.tva) / 100);
    const totalTTC = totalHT + tvaAmount;

    return { totalHT, tvaAmount, totalTTC };
  };

  const { totalHT, tvaAmount, totalTTC } = calculateTotals();

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
          onClick={() => navigate('/quotes')}
          className="inline-flex items-center text-accent hover:text-accent/80 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Quotes
        </button>
      </div>

      <div className="bg-secondary rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Quote' : 'Create New Quote'}
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            {isEdit ? 'Update quote information' : 'Create a new quote for your client'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quote Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="numero_devis" className="block text-sm font-medium text-gray-300 mb-2">
                Quote Number *
              </label>
              <input
                type="text"
                id="numero_devis"
                name="numero_devis"
                value={formData.numero_devis}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                  validationErrors.numero_devis ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="DEV-20240101-001"
              />
              {validationErrors.numero_devis && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.numero_devis}</p>
              )}
            </div>

            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-300 mb-2">
                Client *
              </label>
              <select
                id="client_id"
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                  validationErrors.client_id ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.nom}</option>
                ))}
              </select>
              {validationErrors.client_id && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.client_id}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="date_devis" className="block text-sm font-medium text-gray-300 mb-2">
                Quote Date *
              </label>
              <input
                type="date"
                id="date_devis"
                name="date_devis"
                value={formData.date_devis}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                  validationErrors.date_devis ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {validationErrors.date_devis && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.date_devis}</p>
              )}
            </div>

            <div>
              <label htmlFor="date_validite" className="block text-sm font-medium text-gray-300 mb-2">
                Valid Until *
              </label>
              <input
                type="date"
                id="date_validite"
                name="date_validite"
                value={formData.date_validite}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                  validationErrors.date_validite ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {validationErrors.date_validite && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.date_validite}</p>
              )}
            </div>

            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="refused">Refused</option>
              </select>
            </div>
          </div>

          {/* Quote Details */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Quote Items</h3>
              <button
                type="button"
                onClick={addDetail}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#D7FEFA' }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {details.map((detail, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product *
                      </label>
                      <select
                        value={detail.product_id}
                        onChange={(e) => handleDetailChange(index, 'product_id', e.target.value)}
                        className={`w-full px-3 py-2 bg-gray-600 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                          validationErrors[`detail_${index}_product`] ? 'border-red-500' : 'border-gray-500'
                        }`}
                      >
                        <option value="">Select a product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.nom} - €{Number(product.prix_unitaire).toFixed(2)}/{product.unite}
                          </option>
                        ))}
                      </select>
                      {validationErrors[`detail_${index}_product`] && (
                        <p className="mt-1 text-sm text-red-400">{validationErrors[`detail_${index}_product`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={detail.quantite}
                        onChange={(e) => handleDetailChange(index, 'quantite', e.target.value)}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 bg-gray-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                          validationErrors[`detail_${index}_quantite`] ? 'border-red-500' : 'border-gray-500'
                        }`}
                        placeholder="0"
                      />
                      {validationErrors[`detail_${index}_quantite`] && (
                        <p className="mt-1 text-sm text-red-400">{validationErrors[`detail_${index}_quantite`]}</p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Unit Price (€) *
                        </label>
                        <input
                          type="number"
                          value={detail.prix_unitaire}
                          onChange={(e) => handleDetailChange(index, 'prix_unitaire', e.target.value)}
                          min="0"
                          step="0.01"
                          className={`w-full px-3 py-2 bg-gray-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                            validationErrors[`detail_${index}_prix`] ? 'border-red-500' : 'border-gray-500'
                          }`}
                          placeholder="0.00"
                        />
                        {validationErrors[`detail_${index}_prix`] && (
                          <p className="mt-1 text-sm text-red-400">{validationErrors[`detail_${index}_prix`]}</p>
                        )}
                      </div>
                      {details.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDetail(index)}
                          className="ml-2 p-2 text-red-400 hover:text-red-300 transition-colors"
                          title="Remove item"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {detail.quantite && detail.prix_unitaire && (
                    <div className="mt-2 text-right">
                      <span className="text-sm text-gray-300">
                        Line Total: <span className="text-white font-medium">
                          €{(Number(detail.quantite) * Number(detail.prix_unitaire)).toFixed(2)}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* VAT and Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tva" className="block text-sm font-medium text-gray-300 mb-2">
                VAT Rate (%) *
              </label>
              <input
                type="number"
                id="tva"
                name="tva"
                value={formData.tva}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors ${
                  validationErrors.tva ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="20"
              />
              {validationErrors.tva && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.tva}</p>
              )}
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-medium text-white mb-3">Quote Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal (HT):</span>
                  <span>€{totalHT.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>VAT ({formData.tva}%):</span>
                  <span>€{tvaAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-medium text-lg border-t border-gray-600 pt-2">
                  <span>Total (TTC):</span>
                  <span>€{totalTTC.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
            <button
              type="button"
              onClick={() => navigate('/quotes')}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-primary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#D7FEFA' }}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Quote' : 'Create Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteForm;
