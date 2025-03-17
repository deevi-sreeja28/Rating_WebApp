export type User = {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'admin' | 'user' | 'store_owner';
  created_at: string;
};

export type Store = {
  id: string;
  name: string;
  email: string;
  address: string;
  owner_id: string;
  average_rating: number;
  created_at: string;
};

export type Rating = {
  id: string;
  user_id: string;
  store_id: string;
  rating: number;
  created_at: string;
};