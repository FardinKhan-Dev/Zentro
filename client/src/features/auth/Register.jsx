import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from './authApi';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await register({ name, email, password }).unwrap();
      setMessage(res?.message || 'Registered — check your email to verify');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>
      {message && <div>{message}</div>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={isLoading}>Register</button>
      </form>
    </div>
  );
};

export default Register;
