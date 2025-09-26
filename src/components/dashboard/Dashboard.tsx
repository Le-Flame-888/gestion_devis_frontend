import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsAPI, quotesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  CubeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalQuotes: number;
  approvedQuotes: number;
  pendingQuotes: number;
  rejectedQuotes: number;
  totalRevenue: number;
  totalClients: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    approvedQuotes: 0,
    pendingQuotes: 0,
    rejectedQuotes: 0,
    totalRevenue: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchStats = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setRefreshing(true);
        
        const [clientsRes, quotesRes] = await Promise.all([
          clientsAPI.getAll(),
          quotesAPI.getAll(),
        ]);

        const quotes = quotesRes.data.data;
        const approvedQuotes = quotes.filter((q: any) => q.statut === 'accepted').length;
        const pendingQuotes = quotes.filter((q: any) => q.statut === 'sent' || q.statut === 'draft').length;
        const rejectedQuotes = quotes.filter((q: any) => q.statut === 'refused').length;
        
        const totalRevenue = quotes
          .filter((q: any) => q.statut === 'accepted')
          .reduce((sum: number, quote: any) => sum + parseFloat(quote.total_ttc || 0), 0);

        setStats({
          totalQuotes: quotes.length,
          approvedQuotes,
          pendingQuotes,
          rejectedQuotes,
          totalRevenue,
          totalClients: clientsRes.data.total || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        if (showLoading) setLoading(false);
        setRefreshing(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Devis',
      value: stats.totalQuotes,
      icon: DocumentTextIcon,
      color: 'bg-blue-100 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: 'up',
      change: '12%',
    },
    {
      name: 'Approuvés',
      value: stats.approvedQuotes,
      icon: CheckCircleIcon,
      color: 'bg-green-100 dark:bg-green-500/20',
      iconColor: 'text-green-600 dark:text-green-400',
      trend: 'up',
      change: '5%',
    },
    {
      name: 'En Attente',
      value: stats.pendingQuotes,
      icon: ClockIcon,
      color: 'bg-yellow-100 dark:bg-yellow-500/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      trend: 'down',
      change: '3%',
    },
    {
      name: 'Rejetés',
      value: stats.rejectedQuotes,
      icon: XCircleIcon,
      color: 'bg-red-100 dark:bg-red-500/20',
      iconColor: 'text-red-600 dark:text-red-400',
      trend: 'down',
      change: '2%',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Tableau de bord</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Bon retour, {user?.name} ! Voici un aperçu de votre activité.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => fetchStats(false)}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 transition-colors"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{card.name}</p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-white">
                    {card.value.toLocaleString()}
                  </p>
                  {card.trend && (
                    <span className={`inline-flex items-center mt-1.5 text-xs font-medium ${
                      card.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {card.trend === 'up' ? (
                        <svg className="h-3.5 w-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-3.5 w-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                        </svg>
                      )}
                      {card.change} vs mois dernier
                    </span>
                  )}
                </div>
                <div className={`${card.color} p-2.5 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue and Clients Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-50/70 dark:from-blue-500/10 dark:to-blue-500/5 rounded-xl p-6 border border-blue-100 dark:border-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Chiffre d'affaires</p>
              <p className="mt-1 text-2xl font-semibold text-blue-900 dark:text-white">
                {stats.totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
              </p>
              <p className="mt-1.5 text-sm text-blue-600 dark:text-blue-400 flex items-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200 mr-2">
                  <svg className="h-3.5 w-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  +12.5%
                </span>
                <span>par rapport au mois dernier</span>
              </p>
            </div>
            <div className="bg-white/50 dark:bg-blue-500/20 p-2.5 rounded-lg">
              <CurrencyEuroIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-500/20">
            <button
              onClick={() => navigate('/quotes')}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Voir les devis <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-50/70 dark:from-purple-500/10 dark:to-purple-500/5 rounded-xl p-6 border border-purple-100 dark:border-purple-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Clients actifs</p>
              <p className="mt-1 text-2xl font-semibold text-purple-900 dark:text-white">
                {stats.totalClients.toLocaleString()}
              </p>
              <p className="mt-1.5 text-sm text-purple-600 dark:text-purple-400">
                {stats.totalClients > 0 ? `${Math.round((stats.approvedQuotes / stats.totalClients) * 10) / 10} devis par client en moyenne` : 'Aucun client pour le moment'}
              </p>
            </div>
            <div className="bg-white/50 dark:bg-purple-500/20 p-2.5 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-500/20">
            <button
              onClick={() => navigate('/clients')}
              className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
            >
              Gérer les clients <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700/50">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Actions rapides</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Accédez rapidement aux fonctionnalités principales</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y md:divide-y-0 border-t border-neutral-200 dark:border-neutral-700/50">
          <button
            onClick={() => navigate('/quotes/new')}
            className="group p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 dark:group-hover:bg-blue-500/30 group-hover:text-white dark:group-hover:text-blue-300 transition-colors">
                <PlusIcon className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Nouveau devis
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Créer un nouveau devis pour un client
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/clients')}
            className="group p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 dark:group-hover:bg-purple-500/30 group-hover:text-white dark:group-hover:text-purple-300 transition-colors">
                <UserGroupIcon className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Gérer les clients
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Afficher et gérer votre base clients
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/products')}
            className="group p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:bg-green-600 dark:group-hover:bg-green-500/30 group-hover:text-white dark:group-hover:text-green-300 transition-colors">
                <CubeIcon className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium text-neutral-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Catalogue produits
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Gérer votre catalogue de produits
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
