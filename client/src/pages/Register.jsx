import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    if (!role) {
      setError('請選擇角色');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '註冊失敗');
      setSuccess({ number: data.user.number, name: data.user.name });
      login(data.user, data.token);
      setTimeout(() => navigate('/', { replace: true }), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h1>經文背誦 · 註冊</h1>
      <p style={{ color: '#8b949e', marginBottom: '1rem' }}>註冊後會得到一組編號，之後可用「名字」或「編號」登入。</p>
      <form onSubmit={handleSubmit} style={{ maxWidth: 320, marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>名字</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="您的名字"
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
        <label style={{ display: 'block', marginBottom: '0.5rem', marginTop: '1rem', fontWeight: 500 }}>角色</label>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={(e) => setRole(e.target.value)} />
            <span>老師/家長</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <input type="radio" name="role" value="student" checked={role === 'student'} onChange={(e) => setRole(e.target.value)} />
            <span>學生</span>
          </label>
        </div>
        <p style={{ color: '#8b949e', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
          {role === 'student' ? '學生需被老師或家長確認合格後才能簽到。' : '老師/家長可直接簽到，無需被確認。'}
        </p>
        {error && <p style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>}
        {success && (
          <p style={{ color: '#3fb950', marginTop: '0.5rem' }}>
            註冊成功！您的編號：<strong>{success.number}</strong>（請記下來）
          </p>
        )}
        <button type="submit" style={{ ...btnStyle, marginTop: '1rem', width: '100%' }}>註冊</button>
      </form>
      <p style={{ color: '#8b949e' }}>已有帳號？ <Link to="/login" style={{ color: '#58a6ff' }}>登入</Link></p>
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
