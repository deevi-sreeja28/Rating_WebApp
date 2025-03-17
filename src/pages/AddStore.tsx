// src/pages/AddStore.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const storeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().max(400, 'Address must not exceed 400 characters'),
});

type StoreForm = z.infer<typeof storeSchema>;

export function AddStore() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
  });

  const onSubmit = async (data: StoreForm) => {
    try {
      const { error } = await supabase
        .from('stores')
        .insert([data]);

      if (error) throw error;

      alert('Store added successfully');
      navigate('/stores');
    } catch (error) {
      console.error('Error adding store:', error);
      alert('Error adding store');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Store</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Store Name
            </label>
            <input
              {...register('name')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Store Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Store Address
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
            {errors.address && (
              <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}