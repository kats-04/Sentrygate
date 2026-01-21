import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Card } from './ui';
import { SkeletonList } from './ui/Skeleton';

export default function UserList() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery(
    ['users', { q: '', limit: 20, skip: 0 }],
    async ({ queryKey }) => {
      const [_key, { q = '', limit = 20, skip = 0 }] = queryKey;
      const params = new URLSearchParams({ q, limit, skip });
      const res = await api.get(`/users/search?${params.toString()}`);
      return res.data; // api.get now returns data directly
    }
  );

  const deleteUser = async (id) => {
    await api.delete(`/users/${id}`);
  };

  const mutation = useMutation(deleteUser, {
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData(['users', { q: '', limit: 20, skip: 0 }]);
      queryClient.setQueryData(['users', { q: '', limit: 20, skip: 0 }], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((u) => u._id !== id),
          count: old.count - 1,
        };
      });
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['users', { q: '', limit: 20, skip: 0 }], context.previous);
      }
      console.error('Delete failed', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  if (isLoading) return <SkeletonList count={5} />;
  if (isError) return <div className="p-4 text-red-600">Error loading users</div>;

  return (
    <div className="grid gap-4">
      {data?.data?.map((user) => (
        <Card key={user._id} variant="glass" padding="md" hoverable>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => mutation.mutate(user._id)}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
