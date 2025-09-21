export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  nom: string;
  categorie: 'Marbre' | 'Carrelage' | 'Autre';
  unite: 'm2' | 'm3';
  prix_vente: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  code_postal: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteDetail {
  id: number;
  quote_id: number;
  product_id: number;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
  product?: Product;
}

export interface Quote {
  id: number;
  numero_devis: string;
  client_id: number;
  user_id: number;
  date_devis: string;
  date_validite: string;
  statut: 'draft' | 'sent' | 'accepted' | 'refused';
  total_ht: number;
  tva: number;
  total_ttc: number;
  client?: Client;
  user?: User;
  details?: QuoteDetail[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
