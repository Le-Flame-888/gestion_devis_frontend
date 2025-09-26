import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quotesAPI, clientsAPI } from '../services/api';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  PencilIcon,
  PlusIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';

// Déclaration du type JSX pour TypeScript
declare global {
  namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
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

  // Badge statut amélioré
  const getStatusBadge = (status: string): JSX.Element => {
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      'brouillon': {
        bg: 'bg-neutral-100 dark:bg-neutral-700/50',
        text: 'text-neutral-800 dark:text-neutral-200',
        icon: <DocumentTextIcon className="h-3.5 w-3.5 mr-1" />
      },
      'envoyé': {
        bg: 'bg-blue-100 dark:bg-blue-500/20',
        text: 'text-blue-800 dark:text-blue-300',
        icon: <ArrowDownTrayIcon className="h-3.5 w-3.5 mr-1" />
      },
      'accepté': {
        bg: 'bg-green-100 dark:bg-green-500/20',
        text: 'text-green-800 dark:text-green-300',
        icon: <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
      },
      'refusé': {
        bg: 'bg-red-100 dark:bg-red-500/20',
        text: 'text-red-800 dark:text-red-300',
        icon: <XCircleIcon className="h-3.5 w-3.5 mr-1" />
      },
      'en_attente': {
        bg: 'bg-yellow-100 dark:bg-yellow-500/20',
        text: 'text-yellow-800 dark:text-yellow-300',
        icon: <ClockIcon className="h-3.5 w-3.5 mr-1" />
      },
    };

    const defaultConfig = {
      bg: 'bg-neutral-100 dark:bg-neutral-700/50',
      text: 'text-neutral-800 dark:text-neutral-200',
      icon: <DocumentTextIcon className="h-3.5 w-3.5 mr-1" />
    };

    const { bg, text, icon } = statusConfig[status.toLowerCase()] || defaultConfig;
    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {icon}
        {displayStatus}
      </div>
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
          .map((quote: Quote, index: number) => processQuote(quote, index))
          .filter((quote: Quote | null): quote is Quote => quote !== null);

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
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-status-error/10 border border-status-error/30 rounded-lg p-4">
          <div className="flex">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-status-error dark:text-status-error-light">Erreur</h3>
              <div className="mt-1 text-sm text-status-error/90 dark:text-status-error-light/90">
                {error}
              </div>
              <div className="mt-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-status-error hover:bg-status-error/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-status-error/30 focus:ring-offset-1 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 p-8 text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">Aucun devis</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Aucun devis n'a été trouvé pour ce client.
          </p>
          <div className="mt-6">
            <Link
              to={`/quotes/new?clientId=${clientId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nouveau devis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
              Devis pour {clientName}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Liste des devis pour ce client
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to={`/quotes/new?clientId=${clientId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Nouveau devis
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                {quotes.length}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Acceptés</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {quotes.filter(q => q.statut.toLowerCase() === 'accepté').length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">En attente</p>
              <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                {quotes.filter(q => q.statut.toLowerCase() === 'en_attente' || q.statut.toLowerCase() === 'envoyé').length}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-500/20 p-2 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">CA Total</p>
              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' })
                  .format(quotes.reduce((sum, q) => sum + (q.total_ttc || 0), 0))}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-lg">
              <CurrencyEuroIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700/30">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Référence
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Montant
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="relative px-6 py-3.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700/50">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">
                      {quote.reference}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {quote.items?.length || 0} articles
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 dark:text-white">
                      {formatDate(quote.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900 dark:text-white text-right">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' })
                        .format(quote.total_ttc || 0)}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 text-right">
                      HT: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' })
                        .format(quote.total_ht)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(quote.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/quotes/edit/${quote.id}`)}
                        className="text-neutral-400 hover:text-blue-500 transition-colors p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        title="Imprimer"
                      >
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {}}
                        className="text-neutral-400 hover:text-green-500 transition-colors p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        title="Télécharger"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
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
