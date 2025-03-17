import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Store, User, Rating } from '../lib/types';
import { Users, Store as StoreIcon, Star } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    averageRating: 0,
  });
  const [recentRatings, setRecentRatings] = useState<(Rating & { user: User, store: Store })[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserData(data);

      if (data?.role === 'admin') {
        // Fetch admin stats
        const [usersCount, storesCount, ratingsCount] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact' }),
          supabase.from('stores').select('*', { count: 'exact' }),
          supabase.from('ratings').select('*', { count: 'exact' }),
        ]);

        setStats({
          totalUsers: usersCount.count || 0,
          totalStores: storesCount.count || 0,
          totalRatings: ratingsCount.count || 0,
          averageRating: 0,
        });
      } else if (data?.role === 'store_owner') {
        // Fetch store owner stats
        const { data: storeData } = await supabase
          .from('stores')
          .select('*, ratings(*, users(*))')
          .eq('owner_id', user.id)
          .single();

        if (storeData) {
          setStats({
            totalUsers: storeData.ratings?.length || 0,
            totalStores: 1,
            totalRatings: storeData.ratings?.length || 0,
            averageRating: storeData.average_rating || 0,
          });
        }
      }

      // Fetch recent ratings
      const { data: ratings } = await supabase
        .from('ratings')
        .select('*, user:users(*), store:stores(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (ratings) {
        setRecentRatings(ratings);
      }
    };

    fetchUserData();
  }, [user]);

  if (!userData) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome, {userData.name}
        </h2>
        <p className="text-gray-600">
          Role: {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <StoreIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Stores</h3>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalStores}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Ratings</h3>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalRatings}</p>
            </div>
          </div>
        </div>
      </div>

      {recentRatings.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Ratings</h3>
          <div className="space-y-4">
            {recentRatings.map((rating) => (
              <div key={rating.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {rating.user.name} rated {rating.store.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium text-gray-900">
                    {rating.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}