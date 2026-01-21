import React, { useRef, useState } from 'react';
import { Github, Linkedin, Twitter, Mail, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '../components/layout';
import { Button, Card, Input, Avatar } from '../components/ui';
import api from '../utils/api';

/**
 * Profile Page
 */
const Profile = () => {
  const schema = z.object({
    name: z.string().min(1).optional(),
    avatarUrl: z.string().url().optional(),
  });

  const { register, handleSubmit, reset, formState } = useForm({ resolver: zodResolver(schema) });
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.auth.me();
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.users.updateProfile(payload);
      return res;
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['me'], res.data);
    }
  });

  React.useEffect(() => {
    if (data) reset({ name: data.name, avatarUrl: data.avatarUrl });
  }, [data, reset]);

  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef();

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await fetch(`${api.baseURL}/users/profile/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      queryClient.setQueryData(['me'], (old) => ({ ...old, avatarUrl: data.data.avatarUrl }));
      reset((prev) => ({ ...prev, avatarUrl: data.data.avatarUrl }));
    } catch (err) {
      alert('Avatar upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  const socialIcons = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
  };

  return (
    <DashboardShell>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-2 mb-2">Profile Settings</h1>
            <p className="text-body-small">Manage your account information and preferences</p>
          </div>
          {!isEditing && (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Avatar and Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card variant="glass" padding="lg" className="text-center">
            <div className="mb-4 flex justify-center">
              <Avatar src={data?.avatarUrl} initials={data?.name?.[0] || '?'} size="xl" />
            </div>
            <h2 className="text-lg font-bold mb-1">{data?.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{data?.role}</p>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
              disabled={avatarUploading}
            />
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={avatarUploading}
            >
              {avatarUploading ? 'Uploading...' : 'Upload Avatar'}
            </Button>
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Joined
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Calendar size={16} />
                  {data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Basic Information */}
          <Card variant="glass" padding="lg">
            <h3 className="text-lg font-bold mb-6">Basic Information</h3>
            <div className="space-y-4">
              <Input label="Full Name" type="text" {...register('name')} icon={Mail} error={formState.errors.name?.message} />
              <Input label="Avatar URL" type="url" {...register('avatarUrl')} error={formState.errors.avatarUrl?.message} />
            </div>
          </Card>

          {/* Bio Section */}
          <Card variant="glass" padding="lg">
            <h3 className="text-lg font-bold mb-6">About You</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  defaultValue={data?.bio || ''}
                  onChange={(e) => { }}
                  disabled={!isEditing}
                  rows="4"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus-ring transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>
          </Card>

          {/* Social Links */}
          <Card variant="glass" padding="lg">
            <h3 className="text-lg font-bold mb-6">Social Links</h3>
            <div className="space-y-3">
              {(data?.socialLinks || []).map((link) => {
                const Icon = socialIcons[link.platform];
                return (
                  <div key={link.platform} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Icon size={20} className="text-slate-600 dark:text-slate-400" />
                    <input
                      id={`social-${link.platform}`}
                      type="url"
                      value={link.url}
                      disabled={!isEditing}
                      autoComplete="url"
                      className="flex-1 bg-transparent text-slate-900 dark:text-slate-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                      placeholder={`https://${link.platform}.com/username`}
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleSubmit(onSubmit)} className="flex-1" isLoading={mutation.isLoading}>
              Save Changes
            </Button>
            <Button variant="secondary" onClick={() => reset()} className="flex-1">
              Reset
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
};

export default Profile;
