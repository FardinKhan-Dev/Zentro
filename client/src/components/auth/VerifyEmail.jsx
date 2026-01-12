import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useVerifyEmailQuery } from '../../features/auth/authApi';

const VerifyEmail = () => {
  const { token } = useParams();
  const { data, isLoading, isError } = useVerifyEmailQuery(token);
  const isSuccess = data?.success;

  const { isAuthenticated, isVerified } = useAuth();
    
    if (isAuthenticated && isVerified) {
        return <Navigate to="/" />;
    }

    let title, content, icon;

    if (isLoading) {
        title = 'Verifying your email...';
        content = 'Please wait while we verify your email address.';
        icon = 'spinner';
    } else if (isSuccess) {
        title = 'Email verified successfully!';
        content = 'Your email address has been verified successfully.';
        icon = 'check-circle';
    } else if (isError) {
        title = 'Verification failed!';
        content = 'We were unable to verify your email address. Please try again.';
        icon = 'exclamation-circle';
    } else {
        title = 'Verification failed!';
        content = 'We were unable to verify your email address. Please try again.';
        icon = 'exclamation-circle';
    }

 

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {isLoading && (
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {isSuccess && (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {(isError || (!isLoading && !isSuccess)) && (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}

          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>

          <div className={`mt-4 rounded-md p-4 ${isSuccess ? 'bg-green-50' : isError ? 'bg-red-50' : 'bg-blue-50'}`}>
            <p className={`text-sm font-medium ${isSuccess ? 'text-green-800' : isError ? 'text-red-800' : 'text-blue-800'}`}>
              {content}
            </p>
          </div>

          {isSuccess && (
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Home
              </Link>
            </div>
          )}

          {(isError || (!isLoading && !isSuccess)) && (
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
