import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotesAPI } from '../../services/api';
import type { Quote } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ArrowDownTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
// Import jsPDF with autoTable plugin
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const QuoteList: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQuotes();
  }, [currentPage]);

  const fetchQuotes = async () => {
    try {
      const response = await quotesAPI.getAll(currentPage);
      setQuotes(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async (quote: Quote) => {
    console.log('Exporting quote to PDF:', quote); // Debug log
    
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `Devis ${quote.numero_devis}`,
      subject: `Devis pour ${quote.client?.nom || 'Client'}`,
      author: 'Votre Société',
      creator: 'Gestion Devis App'
    });

    // Add logo or header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('DEVIS', 105, 20, { align: 'center' });
    
    // Add company info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Votre Société', 14, 30);
    doc.text('123 Rue de l\'Exemple', 14, 35);
    doc.text('75000 Paris, France', 14, 40);
    doc.text('Tél: 01 23 45 67 89', 14, 45);
    doc.text('contact@votresociete.com', 14, 50);
    
    // Add quote info
    doc.text(`N°: ${quote.numero_devis || ''}`, 150, 30);
    doc.text(`Date: ${quote.date_devis ? new Date(quote.date_devis).toLocaleDateString('fr-FR') : ''}`, 150, 35);
    doc.text(`Client: ${quote.client?.nom || ''}`, 150, 40);
    
    // Add items table
    const items = [
      ['Description', 'Quantité', 'Prix unitaire HT', 'Total HT']
    ];
    
    // Debug: Log the structure of the quote object
    console.log('Quote object structure:', JSON.stringify(quote, null, 2));
    
    // Use the 'details' array for quote items
    const quoteItems = quote.details || [];
    console.log('Quote items:', quoteItems);
    
    if (quoteItems && quoteItems.length > 0) {
      quoteItems.forEach((item: any) => {
        const description = item.product?.nom || 'Sans description';
        const quantite = parseFloat(item.quantite) || 0;
        const prixUnitaire = parseFloat(item.prix_unitaire) || 0;
        const totalHT = parseFloat(item.total_ligne) || (quantite * prixUnitaire);
        
        items.push([
          description,
          quantite.toString(),
          `${parseFloat(prixUnitaire).toFixed(2).replace('.', ',')} MAD`,
          `${parseFloat(totalHT.toString()).toFixed(2).replace('.', ',')} MAD`
        ]);
      });
    } else {
      console.log('No items found in the quote');
      items.push(['Aucun article trouvé', '', '', '']);
    }
    
    // Calculate totals
    const tvaRate = Number(quote.tva) || 20;
    const htValue = Number(quote.total_ht) || 0;
    const { tva, ttc } = calculateTotals(htValue, tvaRate);
    
    // Add totals
    autoTable(doc, {
      startY: 70,
      head: [items[0]],
      body: items.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      didDrawPage: function (data) {
        // Add totals
        const finalY = data.cursor?.y || 70 + items.length * 10 + 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Total HT
        doc.text('Total HT:', 140, finalY + 10);
        doc.text(`${htValue.toFixed(2).replace('.', ',')} MAD`, 170, finalY + 10);
        
        // TVA
        doc.text(`TVA (${tvaRate}%):`, 140, finalY + 20);
        doc.text(`${tva.toFixed(2).replace('.', ',')} MAD`, 170, finalY + 20);
        
        // Total TTC
        doc.setFont('helvetica', 'bold');
        doc.text('Total TTC:', 140, finalY + 35);
        doc.text(`${ttc.toFixed(2).replace('.', ',')} MAD`, 170, finalY + 35);
        doc.setFont('helvetica', 'normal');
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text('Merci pour votre confiance !', 105, 280, { align: 'center' });
        doc.text('Société - SIRET: 123 456 789 00012 - TVA Intracom: FR32123456789', 105, 285, { align: 'center' });
      }
    });
    
    // Save the PDF
    doc.save(`devis-${quote.numero_devis || 'sans-numero'}.pdf`);
  };

  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      'N° Devis',
      'Client',
      'Date',
      'Statut',
      'TVA (%)',
      'Total HT (MAD)',
      'Total TTC (MAD)'
    ];

    // Map quotes to CSV rows
    const csvRows = quotes.map(quote => {
      // Ensure numeric values are properly converted
      const tvaRate = Number(quote.tva) || 20;
      const htValue = Number(quote.total_ht) || 0;
      const { ttc } = calculateTotals(htValue, tvaRate);
      
      // Format numbers with 2 decimal places and French decimal separator
      const formatNumber = (num: number) => {
        return num.toFixed(2).replace('.', ',');
      };
      
      return [
        `"${quote.numero_devis || ''}"`,
        `"${quote.client?.nom || 'N/A'}"`,
        `"${quote.date_devis ? new Date(quote.date_devis).toLocaleDateString() : ''}"`,
        `"${quote.statut || ''}"`,
        tvaRate,
        formatNumber(htValue),
        formatNumber(ttc)
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `devis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      try {
        await quotesAPI.delete(id);
        fetchQuotes();
      } catch (error) {
        console.error('Error deleting quote:', error);
      }
    }
  };

  // Function to calculate TVA and TTC with precise decimal handling
  const calculateTotals = (ht: number | string, tvaRate: number | string = 20) => {
    // Convert inputs to numbers, default to 0 for HT and 20% for TVA rate
    const htValue = typeof ht === 'string' ? parseFloat(ht) || 0 : Number(ht) || 0;
    const tvaPercent = typeof tvaRate === 'string' ? parseFloat(tvaRate) : Number(tvaRate) || 20;
    
    // Calculate TVA amount with precise decimal arithmetic
    const tva = Math.round((htValue * tvaPercent) * 100) / 10000;
    // Calculate TTC by adding HT and TVA
    const ttc = Math.round((htValue + tva) * 100) / 100;
    
    console.log('Calculating totals:', { 
      ht: htValue, 
      tvaRate: tvaPercent, 
      tva, 
      ttc 
    });
    
    return { 
      tva: parseFloat(tva.toFixed(2)),
      ttc: parseFloat(ttc.toFixed(2))
    };
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      brouillon: 'bg-gray-600 text-gray-200',
      envoye: 'bg-blue-600 text-blue-100',
      accepte: 'bg-green-600 text-green-100',
      refuse: 'bg-red-600 text-red-100',
      en_attente: 'bg-yellow-600 text-yellow-100',
    };
    
    const statusLabels = {
      brouillon: 'Brouillon',
      envoye: 'Envoyé',
      accepte: 'Accepté',
      refuse: 'Refusé',
      en_attente: 'En attente',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
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
          <h1 className="text-2xl font-bold text-white">Devis</h1>
          <p className="mt-2 text-sm text-gray-300">
            Liste de tous les devis avec leur statut, client et montant total.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/quotes/new')}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-primary shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary transition-colors"
            style={{ backgroundColor: '#D7FEFA' }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Créer un devis
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            className="ml-3 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Exporter CSV
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  N° de devis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  TVA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total HT
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-secondary divide-y divide-gray-600">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {quote.numero_devis}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {quote.client?.nom || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {new Date(quote.date_devis).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(quote.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    {quote.tva ? `${quote.tva}%` : '20%'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    {(() => {
                      try {
                        // Get values with fallbacks
                        const tvaRate = quote.tva || 20;
                        const htValue = quote.total_ht || 0;
                        
                        // Log the values we're working with
                        console.log('Quote values:', {
                          id: quote.id,
                          ht: htValue,
                          tvaRate: tvaRate,
                          storedTTC: quote.total_ttc
                        });
                        
                        // Always calculate fresh to ensure accuracy
                        const { ttc } = calculateTotals(htValue, tvaRate);
                        const ttcValue = quote.total_ttc || ttc;
                      
                        // Format the result
                        const formattedValue = new Intl.NumberFormat('fr-FR', { 
                          style: 'currency', 
                          currency: 'MAD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(ttcValue || 0);
                        
                        console.log('Formatted TTC:', formattedValue);
                        return formattedValue;
                      } catch (error) {
                        console.error('Error calculating TTC:', error);
                        return '0,00 MAD'; // Fallback value in case of error
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => exportToPDF(quote)}
                      className="text-blue-400 hover:text-blue-300 mr-4 transition-colors"
                      title="Télécharger PDF"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/quotes/edit/${quote.id}`)}
                      className="text-accent hover:text-accent/80 mr-4 transition-colors"
                      title="Éditer"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
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
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-300">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default QuoteList;
