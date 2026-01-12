import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordFormSchema } from '../../validations/authValidation';
import { useChangePasswordMutation } from '../../features/auth/authApi';

const ChangePassword = ({ isEmbedded = false }) => {
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset // helpful to reset form after success
  } = useForm({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      // Data matches backend expectations directly now
      const res = await changePassword(data).unwrap();

      setMessage(res?.message || 'Password changed successfully!');
      reset();
      if (!isEmbedded) {
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      setMessage(err?.data?.message || 'Failed to change password');
    }
  };

  const content = (
    <div className={isEmbedded ? "w-full" : "max-w-md w-full space-y-8"}>
      <div>
        {!isEmbedded && (
          <>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Change your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Update your password to keep your account secure.
            </p>
          </>
        )}
        {isEmbedded && (
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Security</h3>
        )}
      </div>

      {message && (
        <div className={`rounded-md p-4 ${message.includes('success') ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      <form className={`space-y-6 ${isEmbedded ? '' : 'mt-8'}`} onSubmit={handleSubmit(onSubmit)}>
        <div className={`rounded-md shadow-sm ${isEmbedded ? 'space-y-4' : '-space-y-px'}`}>
          <div>
            <label htmlFor="currentPassword" className={isEmbedded ? "block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider mb-2" : "sr-only"}>
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...register('currentPassword')}
              className={isEmbedded ?
                `w-full px-4 py-3 bg-white dark:bg-zinc-900 border rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium placeholder-gray-400 dark:text-white ${errors.currentPassword ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'}`
                : `appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={isEmbedded ? "" : "Current password"}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="newPassword" className={isEmbedded ? "block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider mb-2" : "sr-only"}>
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...register('newPassword')}
              className={isEmbedded ?
                `w-full px-4 py-3 bg-white dark:bg-zinc-900 border rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium placeholder-gray-400 dark:text-white ${errors.newPassword ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'}`
                : `appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={isEmbedded ? "" : "New password"}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className={isEmbedded ? "block text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider mb-2" : "sr-only"}>
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={isEmbedded ?
                `w-full px-4 py-3 bg-white dark:bg-zinc-900 border rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium placeholder-gray-400 dark:text-white ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'}`
                : `appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={isEmbedded ? "" : "Confirm new password"}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={isEmbedded ?
              "bg-black dark:bg-white dark:text-black text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-900 dark:hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 w-full sm:w-auto"
              : "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"}
          >
            {isLoading ? 'Changing...' : 'Change password'}
          </button>
        </div>
      </form>
    </div>
  );

  if (isEmbedded) return content;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      {content}
    </div>
  );
};

export default ChangePassword;
