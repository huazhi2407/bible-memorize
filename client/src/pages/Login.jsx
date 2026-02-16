import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [nameOrNumber, setNameOrNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const isNumber = /^\d+$/.test(nameOrNumber.trim());
    const body = isNumber
      ? { number: nameOrNumber.trim(), password }
      : { name: nameOrNumber.trim(), password };
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '登入失敗');
      login(data.user, data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h1>經文背誦 · 登入</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 320, marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>名字或編號</label>
        <input
          type="text"
          value={nameOrNumber}
          onChange={(e) => setNameOrNumber(e.target.value)}
          placeholder="名字 或 編號"
          required
          style={inputStyle}
        />
        <label style={{ display: 'block', marginBottom: '0.5rem', marginTop: '1rem', fontWeight: 500 }}>密碼</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {error && <p style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>}
        <button type="submit" style={{ ...btnStyle, marginTop: '1rem', width: '100%' }}>登入</button>
      </form>
      <p style={{ color: '#8b949e' }}>還沒有帳號？ <Link to="/register" style={{ color: '#58a6ff' }}>註冊</Link></p>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: 8,
  border: '1px solid #30363d',
  background: '#161b22',
  color: '#e6edf3',
};
const btnStyle = { padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#238636', color: '#fff', fontWeight: 500, cursor: 'pointer' };
