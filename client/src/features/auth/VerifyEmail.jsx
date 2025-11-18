import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVerifyEmailMutation } from './authApi';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('Verifying...');
  const navigate = useNavigate();
  const [verify, { isLoading }] = useVerifyEmailMutation();

  useEffect(() => {
    if (!token) {
      setMessage('Missing token');
      return;
    }
    (async () => {
      try {
        const res = await verify({ token }).unwrap();
        setMessage(res?.message || 'Email verified');
        setTimeout(() => navigate('/login'), 1200);
      } catch (err) {
        setMessage(err?.data?.message || 'Verification failed');
      }
    })();
  }, [token]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Verify Email</h2>
      <div>{isLoading ? 'Working...' : message}</div>
    </div>
  );
};

export default VerifyEmail;
