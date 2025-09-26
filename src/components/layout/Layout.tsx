import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  CubeIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
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
    { name: 'Devis par client', href: '/client-quotes', icon: UserGroupIcon },
    { name: 'Clients', href: '/clients', icon: UserGroupIcon },
    { name: 'Produits', href: '/products', icon: CubeIcon },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-neutral-800">
            <h1 className="text-xl font-bold text-primary dark:text-primary-light">Gestion des Devis</h1>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-4 py-6">
            <ul className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary/10 text-primary dark:text-primary-light font-semibold'
                          : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-primary dark:text-primary-light' : 'text-neutral-400 group-hover:text-white'}`} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* User Profile */}
            <div className="mt-auto pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-x-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-medium text-primary dark:text-primary-light">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-neutral-400 hover:text-white transition-colors p-1 -mr-1"
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
      <div className="pl-64 transition-all duration-300">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 overflow-hidden">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
