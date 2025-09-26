import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotesAPI, clientsAPI } from '../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Déclaration du type JSX pour TypeScript
declare global {
  namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Interface pour la réponse de l'API
interface ApiResponse<T = any> {
  data: T;
  included?: any[];
  meta?: {
    current_page?: number;
    from?: number;
    last_page?: number;
    path?: string;
    per_page?: number;
    to?: number;
    total?: number;
  };
}

// Interface pour un article de devis
interface QuoteItem {
  id: number | string;
  produit_nom: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  produit_id?: number;
  reference?: string;
  designation?: string;
  prix_vente_ht?: number;
  tva?: number;
  remise?: number;
  montant_ht?: number;
  montant_ttc?: number;
}

// Interface pour un devis
interface Quote {
  id: number;
  reference: string;
  date: string;
  date_devis?: string;
  total_ht: number;
  tva_amount?: number;
  total_ttc: number;
  statut: string;
  client_id?: number;
  client_nom?: string;
  remise?: number;
  tva?: number;
  created_at?: string;
  updated_at?: string;
  items?: QuoteItem[];
  produits?: QuoteItem[];
  details?: QuoteItem[];
  quote_items?: QuoteItem[];
  articles?: QuoteItem[];
  devis_items?: QuoteItem[];
  numero_devis?: string;
}

// Type pour le statut du devis
type QuoteStatus = 'brouillon' | 'envoyé' | 'accepté' | 'refusé' | 'en_attente' | string;

const ClientQuotesPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clientName, setClientName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Fonction pour calculer TVA et TTC
  const calculateTotals = (ht: number, tvaRate: number = 20) => {
    // Ensure we're working with numbers and handle potential null/undefined
    const htValue = Number(ht) || 0;
    const tvaPercent = Number(tvaRate) || 20;
    
    // Calculate TVA and TTC with proper rounding
    const tva = Math.round((htValue * tvaPercent) * 100) / 10000; // Round to 2 decimal places
    const ttc = Math.round((htValue + tva) * 100) / 100; // Round to 2 decimal places
    
    return { 
      tva: parseFloat(tva.toFixed(2)), 
      ttc: parseFloat(ttc.toFixed(2)) 
    };
  };

  // Badge statut
  const getStatusBadge = (status: string): JSX.Element => {
    const statusClasses: Record<string, string> = {
      'brouillon': 'bg-gray-100 text-gray-800',
      'envoyé': 'bg-blue-100 text-blue-800',
      'accepté': 'bg-green-100 text-green-800',
      'refusé': 'bg-red-100 text-red-800',
      'en_attente': 'bg-yellow-100 text-yellow-800',
    };

    const defaultClass = 'bg-gray-100 text-gray-800';
    const statusClass = statusClasses[status.toLowerCase()] || defaultClass;
    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
        {displayStatus}
      </span>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) {
        setError('Aucun identifiant client fourni');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);

        const clientResponse = await clientsAPI.getById(Number(clientId));
        if (!clientResponse || !clientResponse.data) {
          throw new Error('Réponse client invalide');
        }
        setClientName(clientResponse.data.nom || 'Client inconnu');

        const quotesResponse = await quotesAPI.getByClient(Number(clientId));
        if (!quotesResponse || !quotesResponse.data) {
          throw new Error('Réponse des devis invalide');
        }

        const quotesData = Array.isArray(quotesResponse.data) 
          ? quotesResponse.data 
          : (quotesResponse.data.data || []);

        const processQuote = (quote: any, index: number): Quote | null => {
          if (!quote) return null;

          const items = quote.articles || quote.devis_items || quote.items || [];

          const tvaRate = quote.tva || 20;
          const totalHT = parseFloat(quote.total_ht) || 0;
          const { tva: tvaAmount, ttc: totalTTC } = calculateTotals(totalHT, tvaRate);
          
          // Log values for debugging
          console.log('Processing quote:', {
            id: quote.id,
            totalHT,
            tvaRate,
            calculatedTVA: tvaAmount,
            calculatedTTC: totalTTC,
            originalTVA: quote.tva_amount,
            originalTTC: quote.total_ttc
          });

          const processedQuote: Quote = {
            ...quote,
            id: quote.id || index,
            reference: quote.numero_devis || quote.reference || `DEV-${quote.id || index}`,
            date: quote.date_devis || quote.date || new Date().toISOString().split('T')[0],
            total_ht: totalHT,
            tva: tvaRate,
            tva_amount: tvaAmount,
            total_ttc: totalHT + tvaAmount, // ✅ recalcul forcé
            statut: quote.statut || 'brouillon',
            items: (items || []).map((item: any) => {
              const productName = item.produit_nom || item.designation || 'Produit sans nom';
              const quantity = parseFloat(item.quantite || 1);
              const unitPrice = parseFloat(item.prix_unitaire || 0);
              const itemHT = quantity * unitPrice;
              const itemTVA = (itemHT * tvaRate) / 100;
              const itemTTC = itemHT + itemTVA;

              return {
                id: item.id || Math.random().toString(36).substr(2, 9),
                produit_nom: productName,
                quantite: quantity,
                prix_unitaire: unitPrice,
                total: itemHT,
                tva: tvaRate,
                montant_ht: itemHT,
                montant_ttc: itemTTC
              };
            })
          };

          return processedQuote;
        };

        const processedQuotes = quotesData
          .map((quote: any, index: number) => processQuote(quote, index))
          .filter((quote): quote is Quote => quote !== null);

        setQuotes(processedQuotes);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
        setError(`Erreur lors du chargement des données: ${errorMessage}`);
        setQuotes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [clientId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }
  if (error) {
    return <div>Erreur : {error}</div>;
  }
  if (quotes.length === 0) {
    return <div>Aucun devis trouvé.</div>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="flex items-center text-gray-300 hover:text-white mr-4">
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Retour
        </button>
        <h1 className="text-2xl font-bold">Devis pour {clientName}</h1>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Produits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total HT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total TTC (TVA incluse)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm font-medium">{quote.reference}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(quote.date)}</td>
                  <td className="px-6 py-4 text-sm">
                    {quote.items?.map((item, idx) => (
                      <div key={`${quote.id}-item-${idx}`}>
                        {item.produit_nom} ({item.quantite} × {item.prix_unitaire} MAD)
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(quote.total_ht)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-gray-400">
                        HT: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(quote.total_ht)}
                      </div>
                      <div className="text-xs text-gray-400">
                        + TVA ({quote.tva}%): {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(quote.tva_amount)}
                      </div>
                      <div className="text-sm font-medium text-white border-t border-gray-600 pt-1 mt-1">
                        = {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(quote.total_ttc || 0)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(quote.statut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientQuotesPage;
