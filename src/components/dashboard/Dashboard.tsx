import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
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
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Devis',
      value: stats.totalQuotes,
      icon: DocumentTextIcon,
      color: 'bg-accent-cyan/20',
      iconColor: 'text-accent-cyan',
    },
    {
      name: 'Devis Approuvés',
      value: stats.approvedQuotes,
      icon: CheckCircleIcon,
      color: 'bg-green-500/20',
      iconColor: 'text-green-400',
    },
    {
      name: 'Devis en Attente',
      value: stats.pendingQuotes,
      icon: ClockIcon,
      color: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
    },
    {
      name: 'Devis Rejetés',
      value: stats.rejectedQuotes,
      icon: XCircleIcon,
      color: 'bg-red-500/20',
      iconColor: 'text-red-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-cyan"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Tableau de bord</h1>
        <p className="text-text-secondary">Bon retour, {user?.name} !</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="bg-dark-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">{card.name}</p>
                  <p className="text-text-primary text-3xl font-bold mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue and Clients Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-card rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Total Revenue</p>
              <p className="text-text-primary text-3xl font-bold mt-2">{stats.totalRevenue.toFixed(2)} MAD</p>
              <p className="text-green-400 text-sm mt-1">From approved quotes</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <CurrencyEuroIcon className="h-6 w-6 text-green-400 transform rotate-45" title="MAD" />
            </div>
          </div>
        </div>

        <div className="bg-dark-card rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Total Clients</p>
              <p className="text-text-primary text-3xl font-bold mt-2">{stats.totalClients}</p>
              <p className="text-accent-cyan text-sm mt-1">Active client base</p>
            </div>
            <div className="bg-accent-cyan/20 p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-accent-cyan" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-card rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-semibold text-text-primary mb-6">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group bg-gradient-to-r from-accent-cyan/10 to-accent-cyan/5 border border-accent-cyan/20 rounded-lg p-6 hover:border-accent-cyan/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-lg p-4 transition-colors cursor-pointer">
                <div className="rounded-full bg-accent-cyan/20 p-2">
                  <PlusIcon className="h-5 w-5 text-accent-cyan" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Nouveau devis</h3>
                  <p className="text-sm text-text-secondary">Créer un nouveau devis</p>
                </div>
              </div>
            </div>
          </div>

          <a
            href="/clients"
            className="group bg-dark-bg/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <UserGroupIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-text-primary">Gérer les clients</h2>
              <p className="text-sm text-text-secondary">Afficher et modifier les informations client</p>
              </div>
            </div>
          </a>

          <div className="group bg-dark-bg/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-lg p-4 transition-colors cursor-pointer">
                <div className="rounded-full bg-blue-500/20 p-2">
                  <CubeIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Ajouter un produit</h3>
                  <p className="text-sm text-text-secondary">Ajouter un nouveau produit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
