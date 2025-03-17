// src/pages/StoreOwnerDashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Rating, User } from '../lib/types';

export function StoreOwnerDashboard() {
  const [ratings, setRatings] = useState<(Rating & { user: User })[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*, user:users(*)')
        .eq('store_id', 'YOUR_STORE_ID'); // Replace with the store owner's store ID

      if (error) throw error;
      setRatings(data || []);

      // Calculate average rating
      const total = data?.reduce((sum, rating) => sum + rating.rating, 0) || 0;
      setAverageRating(total / (data?.length || 1));
      setLoading(false);
    };

    fetchRatings();
  }, []);

  if (loading) {
    return <div>Loading ratings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Store Ratings</h2>
      <p className="text-lg text-gray-700">Average Rating: {averageRating.toFixed(1)}</p>
      <div className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="bg-white shadow-sm rounded-lg p-6">
            <p className="text-sm text-gray-500">User: {rating.user.name}</p>
            <p className="text-sm text-gray-600">Rating: {rating.rating}</p>
          </div>
        ))}
      </div>
    </div>
  );
}