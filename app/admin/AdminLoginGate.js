'use client';
import { useEffect, useState } from 'react';

// GitHub Pages is static hosting. This password gate is a convenience barrier,
// not server-side authentication: the configured password is included in the
// public JavaScript bundle. Do not use it to protect sensitive data.
const SESSION_KEY = 'portfolio_admin_editor_open';
const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

export default function AdminLoginGate({ children }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try { setAuthenticated(!!expectedPassword && sessionStorage.getItem(SESSION_KEY) === 'yes'); }
    catch (_) { setAuthenticated(false); }
    setReady(true);
  }, []);

  function signIn(event) {
    event.preventDefault();
    setError('');
    if (!expectedPassword) {
      setError('Admin password is not configured. Add the ADMIN_PASSWORD repository secret and redeploy.');
      return;
    }
    if (password !== expectedPassword) {
      setError('Incorrect password. Please try again.');
      setPassword('');
      return;
    }
    try { sessionStorage.setItem(SESSION_KEY, 'yes'); } catch (_) {}
    setAuthenticated(true);
    setPassword('');
  }

  function signOut() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
    setAuthenticated(false);
    setPassword('');
  }

  if (!ready) return <main className="w" style={{ paddingTop: 80 }} aria-live="polite">Checking admin access…</main>;
  if (!authenticated) return <main className="w" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}><section className="card" style={{ width: '100%', maxWidth: 460 }}><p className="mu" style={{ marginBottom: 8 }}>ADMIN WORKSPACE · PASSWORD REQUIRED</p><h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Admin sign in</h1><p className="mu">Enter the admin password configured in your GitHub repository secrets.</p><form onSubmit={signIn}><label htmlFor="admin-password">Admin password</label><div style={{ display: 'flex', gap: 8, marginBottom: 14 }}><input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} /><button className="btn o" type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div><button className="btn" type="submit" style={{ width: '100%' }}>Unlock admin workspace</button></form>{error && <p role="alert" style={{ marginTop: 12 }}>{error}</p>}<a className="btn o" href="../" style={{ display: 'inline-block', marginTop: 12 }}>Back to portfolio</a><p className="mu" style={{ marginTop: 16, fontSize: '.85rem' }}>Use a long, unique password. GitHub Pages cannot keep a frontend password secret; this gate is not suitable for sensitive data.</p></section></main>;
  return <><div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 50, display: 'flex', gap: 8, alignItems: 'center' }}><span className="mu" style={{ background: 'var(--card, #111827)', padding: '8px 10px', borderRadius: 999, fontSize: 12 }}>Admin unlocked</span><button type="button" className="btn o" onClick={signOut}>Lock / sign out</button></div>{children}</>;
}
