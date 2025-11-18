import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from './authApi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();
      setMessage('Logged in');
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      setMessage(err?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      {message && <div>{message}</div>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={isLoading}>Login</button>
      </form>
      <p>
        <a href="/request-reset">Forgot password?</a>
      </p>
    </div>
  );
};

export default Login;
