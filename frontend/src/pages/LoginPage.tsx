import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { forgotPassword, resetPassword } from '../lib/api';
import type { Role } from '../types';

const demoCredentials: Record<Role, { email: string; password: string }> = {
  admin: { email: 'admin@foodieshotel.com', password: 'admin123' },
  customer: { email: 'customer@foodieshotel.com', password: 'customer123' }
};

export function LoginPage() {
  const navigate = useNavigate();
  const params = useParams();
  const role = (params.role === 'admin' ? 'admin' : 'customer') as Role;
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(demoCredentials[role].email);
  const [password, setPassword] = useState(demoCredentials[role].password);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotTokenPreview, setForgotTokenPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const heading = useMemo(() => (role === 'admin' ? 'Admin Portal' : 'Customer Login'), [role]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        await login(role, email, password);
        navigate(role === 'admin' ? '/admin' : '/customer');
      }

      if (mode === 'register') {
        if (role === 'admin') {
          throw new Error('Admin registration is disabled. Use seeded admin account.');
        }

        await register({ name, email, password, phone });
        navigate('/customer');
      }

      if (mode === 'forgot') {
        const response = await forgotPassword(email);
        setSuccess(response.message);
        setForgotTokenPreview(response.resetToken ?? 'Check server log/email provider for the token.');
        setMode('reset');
      }

      if (mode === 'reset') {
        await resetPassword(resetToken, newPassword);
        setSuccess('Password has been reset. You can log in now.');
        setMode('login');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to log in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <span className="eyebrow">{heading}</span>
        <h1>{role === 'admin' ? 'Manage every part of the restaurant' : 'Order from your favourite meals'}</h1>
        <p>Use production-ready authentication with registration, refresh tokens, and password reset.</p>

        <div className="mode-switch">
          <button type="button" className={mode === 'login' ? 'primary-button' : 'secondary-button'} onClick={() => setMode('login')}>Login</button>
          {role === 'customer' ? <button type="button" className={mode === 'register' ? 'primary-button' : 'secondary-button'} onClick={() => setMode('register')}>Register</button> : null}
          <button type="button" className={mode === 'forgot' || mode === 'reset' ? 'primary-button' : 'secondary-button'} onClick={() => setMode('forgot')}>Forgot password</button>
        </div>

        {mode === 'register' ? (
          <>
            <label>
              Full name
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label>
              Phone
              <input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
          </>
        ) : null}

        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>

        {mode === 'login' || mode === 'register' ? (
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </label>
        ) : null}

        {mode === 'reset' ? (
          <>
            <label>
              Reset token
              <input value={resetToken} onChange={(event) => setResetToken(event.target.value)} required />
            </label>
            <label>
              New password
              <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" required />
            </label>
          </>
        ) : null}

        {error ? <div className="error-banner">{error}</div> : null}
        {success ? <div className="success-banner">{success}</div> : null}

        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Processing...' : mode === 'login' ? `Continue as ${role}` : mode === 'register' ? 'Create account' : mode === 'forgot' ? 'Send reset token' : 'Reset password'}
        </button>

        {mode === 'login' ? (
          <div className="credential-hint">
            <strong>Demo login</strong>
            <span>{demoCredentials[role].email}</span>
            <span>{demoCredentials[role].password}</span>
          </div>
        ) : null}

        {forgotTokenPreview ? (
          <div className="credential-hint">
            <strong>Dev reset token</strong>
            <span>{forgotTokenPreview}</span>
          </div>
        ) : null}

        <Link to={role === 'admin' ? '/login/customer' : '/login/admin'} className="switch-link">
          Switch to {role === 'admin' ? 'customer' : 'admin'} login
        </Link>
      </form>
    </div>
  );
}
