// src/pages/UserList.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../lib/types';

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Users</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{user.email}</p>
            <p className="mt-2 text-sm text-gray-600">Role: {user.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}