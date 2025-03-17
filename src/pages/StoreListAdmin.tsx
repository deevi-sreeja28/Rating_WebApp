// src/pages/StoreListAdmin.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Store } from '../lib/types';

export function StoreListAdmin() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (error) throw error;
      setStores(data || []);
      setLoading(false);
    };

    fetchStores();
  }, []);

  if (loading) {
    return <div>Loading stores...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Stores</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <div key={store.id} className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{store.address}</p>
            <p className="mt-2 text-sm text-gray-600">Email: {store.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}