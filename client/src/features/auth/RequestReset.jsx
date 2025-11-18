import React, { useState } from 'react';
import { useRequestResetMutation } from './authApi';

const RequestReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [requestReset, { isLoading }] = useRequestResetMutation();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await requestReset({ email }).unwrap();
      setMessage(res?.message || 'Check your email for reset link');
    } catch (err) {
      setMessage(err?.data?.message || 'Request failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Request Password Reset</h2>
      {message && <div>{message}</div>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" disabled={isLoading}>Send Reset Email</button>
      </form>
    </div>
  );
};

export default RequestReset;
