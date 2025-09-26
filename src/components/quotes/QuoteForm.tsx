import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quotesAPI, clientsAPI, productsAPI } from '../../services/api';
import type { Client, Product } from '../../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

// Define the API base URL
const API_BASE_URL = 'http://localhost:8000/api';

interface QuoteFormData {
  numero_devis: string;
  client_id: string;
  date_devis: string;
  date_validite: string;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse';
  tva: number;
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
    statut: 'brouillon',
    tva: 20, // TVA par défaut à 20%
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
      console.log('Fetching clients...');
      const response = await clientsAPI.getAll(1);
      console.log('Clients response:', response.data);
      setClients(response.data.data);
      console.log('Available clients:', response.data.data);
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
        tva: quote.tva || 20, // Set TVA from quote or default to 20%
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
      errors.numero_devis = 'Le numéro de devis est requis';
    }
    if (!formData.client_id) {
      errors.client_id = 'Le client est requis';
    }
    if (!formData.date_devis) {
      errors.date_devis = 'La date du devis est requise';
    }
    if (!formData.date_validite) {
      errors.date_validite = 'La date de validité est requise';
    }
    // Validate details
    details.forEach((detail, index) => {
      if (!detail.product_id) {
        errors[`detail_${index}_product`] = 'Le produit est requis';
      }
      if (!detail.quantite || Number(detail.quantite) <= 0) {
        errors[`detail_${index}_quantite`] = 'Une quantité valide est requise';
      }
      if (!detail.prix_unitaire || Number(detail.prix_unitaire) <= 0) {
        errors[`detail_${index}_prix`] = 'Un prix unitaire valide est requis';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Create the final quote data object with only the fields we want to send
      const quoteData = {
        numero_devis: formData.numero_devis,
        client_id: Number(formData.client_id),
        date_devis: formData.date_devis,
        date_validite: formData.date_validite,
        statut: formData.statut,
        tva: Number(formData.tva), // Include TVA in the data sent to the server
        
        products: details.map(detail => ({
          product_id: Number(detail.product_id),
          quantite: Number(detail.quantite),
          prix_unitaire: Number(detail.prix_unitaire)
        }))
      } as const; // Use const assertion to ensure type safety

      // Log the data being sent to the API
      console.log('=== QUOTE DATA TO BE SENT ===');
      console.log('Form data:', formData);
      console.log('Form data keys:', Object.keys(formData));
      console.log('Quote data to send:', quoteData);
      console.log('Quote data keys:', Object.keys(quoteData));
      console.log('Quote data includes tva?', 'tva' in quoteData);
      console.log('Quote data stringified:', JSON.stringify(quoteData, null, 2));
      console.log('============================');

      console.log('Sending request to:', isEdit && id ? 
        `${API_BASE_URL}/quotes/${id}` : 
        `${API_BASE_URL}/quotes`
      );

      // Use fetch directly for better debugging
      try {
        const url = isEdit && id 
          ? `${API_BASE_URL}/quotes/${id}`
          : `${API_BASE_URL}/quotes`;
          
        const method = isEdit ? 'PUT' : 'POST';
        
        console.log(`Sending ${method} request to:`, url);
        console.log('Request body:', JSON.stringify(quoteData, null, 2));
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(quoteData)
        });

        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);
        
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        let responseData;
        try {
          responseData = responseText ? JSON.parse(responseText) : {};
          console.log('Parsed response data:', responseData);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          throw new Error('Received invalid JSON response from server');
        }
        
        if (response.ok) {
          // Only navigate if the request was successful
          navigate('/quotes');
          return responseData;
        }
        
        if (!response.ok) {
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            data: responseData
          });
          
          const errorMessage = responseData.message || 
            `Error ${response.status}: ${response.statusText || 'Unknown error'}`;
          
          // Handle specific error cases
          if (response.status === 500 && responseData.message?.includes('Unknown column')) {
            throw new Error(`Database error: ${responseData.message}. Please contact support.`);
          }
          
          throw new Error(errorMessage);
        }
        
        return responseData;
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Error creating quote:', error);
      
      // Log full error object for debugging
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Handle fetch error response
      if (error.response) {
        const response = error.response;
        console.error('Error response status:', response.status);
        console.error('Error response data:', response.data);
        
        // Try to get more details from the response
        if (response.data) {
          console.error('Response data type:', typeof response.data);
          console.error('Response data keys:', Object.keys(response.data));
          
          // If we have a products array in the error, log its contents
          if (response.data.products) {
            console.error('Products in error:', response.data.products);
          }
          
          // If we have validation errors, display them
          if (response.data.errors) {
            const formattedErrors: Record<string, string> = {};
            Object.entries(response.data.errors).forEach(([field, messages]) => {
              formattedErrors[field] = Array.isArray(messages) ? messages.join(', ') : String(messages);
            });
            setValidationErrors(formattedErrors);
            setError('Please correct the validation errors below.');
            return;
          }
        }
      }
      
      // Set a generic error message if not already set
      setError(error.message || 'An error occurred while saving the quote.');
      
      // Only navigate away if this is not a validation error
      if (!error.response?.data?.errors) {
        // Small delay to ensure error state is updated before navigation
        setTimeout(() => {
          navigate('/quotes');
        }, 100);
      }
      
      // Fallback error message
      setError('An error occurred while saving the quote. Please check the console for details.');
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
          i === index ? { ...detail, prix_unitaire: (product?.prix_vente || 0).toString() } : detail
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
    // Calculate total HT by summing up all line items
    const totalHT = details.reduce((sum, detail) => {
      const quantity = parseFloat(detail.quantite) || 0;
      const price = parseFloat(detail.prix_unitaire) || 0;
      return sum + (quantity * price);
    }, 0);

    // Calculate TVA (20% of total HT)
    const tvaRate = formData.tva / 100;
    const tvaAmount = totalHT * tvaRate;
    const totalTTC = totalHT + tvaAmount;

    return { 
      totalHT,
      tvaAmount,
      totalTTC
    };
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
          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux devis
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 overflow-hidden p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {isEdit ? 'Modifier le devis' : 'Nouveau devis'}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            {isEdit ? 'Mettre à jour les informations du devis' : 'Créer un nouveau devis pour votre client'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-status-error/10 border border-status-error/30 rounded-lg p-4">
            <div className="text-sm text-status-error dark:text-status-error-light">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quote Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="numero_devis" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Numéro de devis *
              </label>
              <input
                type="text"
                id="numero_devis"
                name="numero_devis"
                value={formData.numero_devis}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white dark:bg-neutral-700 border rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  validationErrors.numero_devis ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="DEV-20240101-001"
              />
              {validationErrors.numero_devis && (
                <p className="mt-1 text-sm text-status-error dark:text-status-error-light">{validationErrors.numero_devis}</p>
              )}
            </div>

            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Client *
              </label>
              <select
                id="client_id"
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white dark:bg-neutral-700 border rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  validationErrors.client_id ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                }`}
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id} className="text-neutral-900 dark:text-white">
                    {client.nom}
                  </option>
                ))}
              </select>
              {validationErrors.client_id && (
                <p className="mt-1 text-sm text-status-error dark:text-status-error-light">
                  {validationErrors.client_id}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="tva" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                TVA (%)
              </label>
              <input
                type="number"
                id="tva"
                name="tva"
                value={formData.tva}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label htmlFor="date_devis" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Date du devis *
              </label>
              <input
                type="date"
                id="date_devis"
                name="date_devis"
                value={formData.date_devis}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white dark:bg-neutral-700 border rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  validationErrors.date_devis ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                }`}
              />
              {validationErrors.date_devis && (
                <p className="mt-1 text-sm text-status-error dark:text-status-error-light">
                  {validationErrors.date_devis}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="date_validite" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Valable jusqu'au *
              </label>
              <input
                type="date"
                id="date_validite"
                name="date_validite"
                value={formData.date_validite}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white dark:bg-neutral-700 border rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  validationErrors.date_validite ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                }`}
              />
              {validationErrors.date_validite && (
                <p className="mt-1 text-sm text-status-error dark:text-status-error-light">
                  {validationErrors.date_validite}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Statut
              </label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              >
                <option value="brouillon" className="text-neutral-900 dark:text-white">Brouillon</option>
                <option value="envoye" className="text-neutral-900 dark:text-white">Envoyé</option>
                <option value="accepte" className="text-neutral-900 dark:text-white">Accepté</option>
                <option value="refuse" className="text-neutral-900 dark:text-white">Refusé</option>
              </select>
            </div>
          </div>

          {/* Quote Details */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Articles du devis</h3>
              <button
                type="button"
                onClick={addDetail}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter un article
              </button>
            </div>

            <div className="space-y-4">
              {details.map((detail, index) => (
                <div key={index} className="bg-neutral-50 dark:bg-neutral-700/30 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700/50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Produit *
                      </label>
                      <select
                        value={detail.product_id}
                        onChange={(e) => handleDetailChange(index, 'product_id', e.target.value)}
                        className={`w-full px-3 py-2 bg-white dark:bg-neutral-700 border rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                          validationErrors[`detail_${index}_product`] ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                        }`}
                      >
                        <option value="" className="text-neutral-400 dark:text-neutral-500">Sélectionner un produit</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id} className="text-neutral-900 dark:text-white">
                            {product?.nom} - {product?.categorie} ({product?.unite || ''})
                          </option>
                        ))}
                      </select>
                      {validationErrors[`detail_${index}_product`] && (
                        <p className="mt-1 text-sm text-status-error dark:text-status-error-light">
                          {validationErrors[`detail_${index}_product`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Quantité *
                      </label>
                      <input
                        type="number"
                        value={detail.quantite}
                        onChange={(e) => handleDetailChange(index, 'quantite', e.target.value)}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 bg-white dark:bg-neutral-700 border rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                          validationErrors[`detail_${index}_quantite`] ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                        }`}
                        placeholder="0"
                      />
                      {validationErrors[`detail_${index}_quantite`] && (
                        <p className="mt-1 text-sm text-status-error dark:text-status-error-light">
                          {validationErrors[`detail_${index}_quantite`]}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Prix unitaire (MAD) *
                        </label>
                        <input
                          type="number"
                          value={detail.prix_unitaire}
                          onChange={(e) => handleDetailChange(index, 'prix_unitaire', e.target.value)}
                          min="0"
                          step="0.01"
                          className={`w-full px-3 py-2 bg-white dark:bg-neutral-700 border rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                            validationErrors[`detail_${index}_prix`] ? 'border-status-error' : 'border-neutral-300 dark:border-neutral-600'
                          }`}
                          placeholder="0.00"
                        />
                        {validationErrors[`detail_${index}_prix`] && (
                          <p className="mt-1 text-sm text-status-error dark:text-status-error-light">
                            {validationErrors[`detail_${index}_prix`]}
                          </p>
                        )}
                      </div>
                      {details.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDetail(index)}
                          className="ml-2 p-2 text-status-error hover:bg-status-error/10 rounded-full transition-colors"
                          title="Supprimer l'article"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {detail.quantite && detail.prix_unitaire && (
                    <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-700/50 space-y-1">
                      <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-300">
                        <span>Total HT :</span>
                        <span className="text-neutral-900 dark:text-white font-medium">
                          {(Number(detail.quantite) * Number(detail.prix_unitaire)).toFixed(2)} MAD
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-5 border border-neutral-200 dark:border-neutral-700/50">
            <h4 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Récapitulatif du devis</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                <span>Total HT :</span>
                <span className="font-medium">{totalHT.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                <span>TVA ({formData.tva}%) :</span>
                <span className="font-medium">{tvaAmount.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-neutral-900 dark:text-white font-semibold text-lg border-t border-neutral-200 dark:border-neutral-700/50 pt-3 mt-2">
                <span>Total TTC :</span>
                <span className="text-primary dark:text-primary-light">{totalTTC.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200 dark:border-neutral-700/50">
            <button
              type="button"
              onClick={() => navigate('/quotes')}
              className="px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : isEdit ? 'Mettre à jour le devis' : 'Créer le devis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteForm;
