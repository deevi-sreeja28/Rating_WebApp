import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Store, Rating } from '../lib/types';
import { Star, Search } from 'lucide-react';

export function StoreList() {
  const { user } = useAuth();
  const [stores, setStores] = useState<(Store & { userRating?: Rating | null })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, [user]);

  const fetchStores = async () => {
    try {
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*, ratings!inner(*)')
        .order('name');

      if (storesError) throw storesError;

      const { data: userRatings, error: ratingsError } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', user?.id);

      if (ratingsError) throw ratingsError;

      const storesWithRatings = storesData.map(store => ({
        ...store,
        userRating: userRatings?.find(rating => rating.store_id === store.id) || null,
      }));

      setStores(storesWithRatings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setLoading(false);
    }
  };

  const handleRating = async (storeId: string, rating: number) => {
    try {
      const store = stores.find(s => s.id === storeId);
      if (!store) return;

      if (store.userRating) {
        // Update existing rating
        const { error } = await supabase
          .from('ratings')
          .update({ rating })
          .eq('id', store.userRating.id);

        if (error) throw error;
      } else {
        // Create new rating
        const { error } = await supabase
          .from('ratings')
          .insert([
            {
              store_id: storeId,
              user_id: user?.id,
              rating,
            },
          ]);

        if (error) throw error;
      }

      await fetchStores();
    } catch (error) {
      console.error('Error rating store:', error);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading stores...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center bg-white shadow-sm rounded-lg p-4">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search stores by name or address..."
          className="ml-2 flex-1 border-none focus:ring-0 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStores.map((store) => (
          <div key={store.id} className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{store.address}</p>
            
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium text-gray-900">
                  {store.average_rating.toFixed(1)}
                </span>
              </div>
              
              <div className="ml-6">
                <label className="text-sm text-gray-700">Your Rating:</label>
                <select
                  value={store.userRating?.rating || ''}
                  onChange={(e) => handleRating(store.id, Number(e.target.value))}
                  className="ml-2 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No stores found matching your search.</p>
        </div>
      )}
    </div>
  );
}