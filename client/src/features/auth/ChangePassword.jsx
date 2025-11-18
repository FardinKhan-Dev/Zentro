import React, { useState } from 'react';
import { useChangePasswordMutation } from './authApi';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await changePassword({ currentPassword, newPassword }).unwrap();
      setMessage(res?.message || 'Password changed');
    } catch (err) {
      setMessage(err?.data?.message || 'Change failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Change Password</h2>
      {message && <div>{message}</div>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <input placeholder="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <input placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button type="submit" disabled={isLoading}>Change Password</button>
      </form>
    </div>
  );
};

export default ChangePassword;
