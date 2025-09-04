import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  CubeIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
    { name: 'Tous les devis', href: '/quotes', icon: DocumentTextIcon },
    { name: 'Nouveau devis', href: '/quotes/new', icon: PlusIcon },
    { name: 'Clients', href: '/clients', icon: UserGroupIcon },
    { name: 'Produits', href: '/products', icon: CubeIcon },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-dark">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-700">
            <h1 className="text-xl font-bold text-accent-cyan">Gestion des Devis</h1>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-6 py-6">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-accent-cyan/10 text-accent-cyan'
                          : 'text-text-secondary hover:text-text-primary hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* User Profile */}
            <div className="mt-auto">
              <div className="flex items-center gap-x-3 p-3 rounded-lg bg-dark-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan/20">
                  <span className="text-sm font-medium text-accent-cyan">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-secondary">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                  title="Déconnexion"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
