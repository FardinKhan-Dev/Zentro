import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from './authApi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (!token) setMessage('Missing token');
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return setMessage('Missing token');
    try {
      const res = await resetPassword({ token, password }).unwrap();
      setMessage(res?.message || 'Password reset');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setMessage(err?.data?.message || 'Reset failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Reset Password</h2>
      {message && <div>{message}</div>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <input placeholder="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={isLoading}>Set New Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
