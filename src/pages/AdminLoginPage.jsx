import { useEffect, useState } from 'react';
import {
  getCurrentSession,
  isCurrentUserAdmin,
  signInAdmin,
  signOutAdmin,
} from '../lib/adminAuth';
import { hasSupabaseConfig } from '../lib/supabaseClient';
import AdminDashboardPage from './AdminDashboardPage';
import defaultLogoUrl from '../../logo/logo2.png';

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionEmail, setSessionEmail] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data } = await getCurrentSession();
      const sessionEmail = data.session?.user?.email ?? '';

      if (!isMounted) {
        return;
      }

      if (!sessionEmail) {
        return;
      }

      const { isAdmin } = await isCurrentUserAdmin();

      if (!isMounted) {
        return;
      }

      if (isAdmin) {
        setSessionEmail(sessionEmail);
      } else {
        await signOutAdmin();
        setStatusMessage('This account is not approved for admin access.');
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatusMessage('');
    setIsSubmitting(true);

    const { data, error } = await signInAdmin(email.trim(), password);

    if (error) {
      setStatusMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    const { isAdmin, error: adminError } = await isCurrentUserAdmin();

    if (adminError || !isAdmin) {
      await signOutAdmin();
      setStatusMessage('This account is not approved for admin access.');
      setIsSubmitting(false);
      return;
    }

    setSessionEmail(data.user?.email ?? email.trim());
    setStatusMessage('');
    setIsSubmitting(false);
  }

  if (sessionEmail) {
    return (
      <AdminDashboardPage
        adminEmail={sessionEmail}
        onSignOut={() => {
          setEmail('');
          setPassword('');
          setSessionEmail('');
          setStatusMessage('Logged out successfully.');
        }}
      />
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-panel" aria-labelledby="admin-login-title">
        <div className="admin-brand">
          <div className="logo-mark" aria-hidden="true">
            <img src={defaultLogoUrl} alt="" />
          </div>
          <div>
            <p className="brand-kicker">Private Control</p>
            <h1 id="admin-login-title">Goa Super Admin</h1>
          </div>
        </div>

        {!hasSupabaseConfig ? (
          <p className="admin-alert">
            Supabase is not configured yet. Add `VITE_SUPABASE_URL` and
            `VITE_SUPABASE_ANON_KEY` before using admin login.
          </p>
        ) : null}

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              autoComplete="email"
              disabled={!hasSupabaseConfig || isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete="current-password"
              disabled={!hasSupabaseConfig || isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <button disabled={!hasSupabaseConfig || isSubmitting} type="submit">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {statusMessage ? <p className="admin-status">{statusMessage}</p> : null}
      </section>
    </main>
  );
}

export default AdminLoginPage;
