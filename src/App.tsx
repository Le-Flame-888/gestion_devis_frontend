import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import ProductList from './components/products/ProductList';
import ProductForm from './components/products/ProductForm';
import ClientList from './components/clients/ClientList';
import ClientForm from './components/clients/ClientForm';
import QuoteList from './components/quotes/QuoteList';
import QuoteForm from './components/quotes/QuoteForm';
import ClientQuotesPage from './pages/ClientQuotesPage';
import ClientQuotesListPage from './pages/ClientQuotesListPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="clients/new" element={<ClientForm />} />
            <Route path="clients/edit/:id" element={<ClientForm />} />
            <Route path="clients/:clientId/quotes" element={<ClientQuotesPage />} />
            <Route path="quotes" element={<QuoteList />} />
            <Route path="quotes/new" element={<QuoteForm />} />
            <Route path="quotes/edit/:id" element={<QuoteForm />} />
            <Route path="client-quotes" element={<ClientQuotesListPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
