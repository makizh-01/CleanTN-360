import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { DISTRICTS } from '../../lib/constants';
import { X, Lock, Mail, User, Phone, MapPin, Building, ShieldCheck, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const navigate = useNavigate();
  const { login, registerCitizen, resetPassword, demoUsers, switchDemoRole } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Coimbatore');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Please enter both email and password.');
      }
      await login(email.trim(), password);
      if (onSuccess) onSuccess('Successfully logged in.');
      onClose();
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!fullName.trim()) throw new Error('Full Name is required.');
      if (!email.trim()) throw new Error('Email Address is required.');
      if (!phone.trim()) throw new Error('Mobile Phone Number is required.');
      if (password.length < 6) throw new Error('Password must be at least 6 characters long.');
      if (password !== confirmPassword) throw new Error('Passwords do not match.');
      if (!acceptTerms) throw new Error('You must accept the Terms and Conditions.');

      await registerCitizen({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        district,
        city: city.trim(),
        address: address.trim(),
      });

      if (onSuccess) onSuccess('Citizen account registered successfully!');
      onClose();
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!email.trim()) throw new Error('Please enter your registered email.');
      await resetPassword(email.trim());
      setSuccessMsg('Password reset instructions sent to your email.');
    } catch (err) {
      setError(err.message || 'Unable to send reset email.');
    } finally {
      setLoading(false);
    }
  }

  function handleQuickDemoLogin(demoUser) {
    switchDemoRole(demoUser.role);
    if (onSuccess) onSuccess(`Signed in as ${demoUser.full_name} (${demoUser.role})`);
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: mode === 'register' ? '540px' : '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/cleantn-logo.png"
              alt="CleanTN 360 Logo"
              className="clickable-logo"
              data-logo-view="true"
              title="Click to view CleanTN 360 Official Emblem"
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('cleantn:view-logo'));
              }}
              style={{
                width: '34px',
                height: '34px',
                objectFit: 'contain',
                borderRadius: '50%',
                background: '#ffffff',
                padding: '2px',
                boxShadow: '0 2px 8px rgba(8, 122, 60, 0.2)',
                flexShrink: 0
              }}
            />
            <b>
              {mode === 'login' && t('auth.loginTitle', 'CleanTN 360 · Account Login')}
              {mode === 'register' && t('auth.registerTitle', 'CleanTN 360 · Citizen Registration')}
              {mode === 'forgot' && t('auth.forgotTitle', 'Reset Your Password')}
            </b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LanguageToggle compact={true} />
            <button className="icon-btn" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {error && (
            <div className="note" style={{ color: '#b91c1c', borderColor: '#fca5a5', background: '#fef2f2', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="note" style={{ color: '#15803d', borderColor: '#86efac', background: '#f0fdf4', marginBottom: '12px' }}>
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <label>{t('auth.email', 'Email Address *')}</label>
              <input
                type="email"
                className="input"
                required
                placeholder="citizen@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <label>{t('auth.password', 'Password *')}</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? t('auth.hidePass', 'Hide password') : t('auth.showPass', 'Show password')}
                  title={showPassword ? t('auth.hidePass', 'Hide password') : t('auth.showPass', 'Show password')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#526d5b',
                    borderRadius: '6px',
                    zIndex: 2
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '4px 0 14px' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#168044', fontSize: '10px', fontWeight: 'bold' }}
                  onClick={() => setMode('forgot')}
                >
                  {t('auth.forgotPass', 'Forgot Password?')}
                </button>
              </div>

              <button type="submit" disabled={loading} className="primary full">
                {loading ? t('common.loading', 'Signing in...') : t('auth.btnSignIn', 'Sign In to Portal')} <ArrowRight size={14} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '11px', color: '#607367' }}>
                {t('auth.noAccount', "Don't have an account?")}{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{ background: 'none', border: 'none', color: '#087a3c', fontWeight: 800 }}
                >
                  {t('auth.register', 'Register as Citizen')}
                </button>
              </div>

              {/* Optional Demo Accounts */}
              <details style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid #e5eee7' }}>
                <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '10px', fontWeight: 700, userSelect: 'none' }}>
                  Developer / Demo Accounts (Optional)
                </summary>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '8px' }}>
                  {demoUsers.map(u => (
                    <button
                      key={u.role}
                      type="button"
                      className="outline"
                      style={{ padding: '6px 4px', fontSize: '9px', textAlign: 'center', textTransform: 'capitalize' }}
                      onClick={() => {
                        handleQuickDemoLogin(u);
                        navigate('/app');
                      }}
                    >
                      <b>{u.role}</b>
                      <small style={{ display: 'block', fontSize: '8px', color: '#6b7280' }}>{u.full_name.split(' ')[0]}</small>
                    </button>
                  ))}
                </div>
              </details>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label>{t('auth.fullName', 'Full Name *')}</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. Makizh N"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label>{t('auth.mobile', 'Mobile Number *')}</label>
                  <input
                    type="tel"
                    className="input"
                    required
                    placeholder="+91 98421 XXXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <label>{t('auth.email', 'Email Address *')}</label>
              <input
                type="email"
                className="input"
                required
                placeholder="citizen@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label>{t('auth.district', 'District *')}</label>
                  <select
                    className="input"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                  >
                    {DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>{t('auth.city', 'City / Area *')}</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. R.S. Puram"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  />
                </div>
              </div>

              <label>{t('auth.address', 'Residential Address')}</label>
              <input
                type="text"
                className="input"
                placeholder="Door No, Street Name, Landmark"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label>{t('auth.password', 'Password *')}</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input"
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{ width: '100%', paddingRight: '38px', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? t('auth.hidePass', 'Hide password') : t('auth.showPass', 'Show password')}
                      title={showPassword ? t('auth.hidePass', 'Hide password') : t('auth.showPass', 'Show password')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        padding: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#526d5b',
                        borderRadius: '6px',
                        zIndex: 2
                      }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label>{t('auth.confirmPassword', 'Confirm Password *')}</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input"
                      required
                      placeholder="Re-type password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      style={{ width: '100%', paddingRight: '38px', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      aria-label={showConfirmPassword ? t('auth.hidePass', 'Hide password') : t('auth.showPass', 'Show password')}
                      title={showConfirmPassword ? t('auth.hidePass', 'Hide password') : t('auth.showPass', 'Show password')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        padding: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#526d5b',
                        borderRadius: '6px',
                        zIndex: 2
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '12px 0 16px' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  style={{ marginTop: '2px' }}
                />
                <label htmlFor="terms" style={{ fontSize: '10px', color: '#4b5563', margin: 0, fontWeight: 500 }}>
                  {t('auth.terms', 'I agree to the CleanTN 360 Waste Segregation Terms, Privacy Policy, and Green Money Rules.')}
                </label>
              </div>

              <button type="submit" disabled={loading} className="primary full">
                {loading ? t('common.loading', 'Creating Account...') : t('auth.btnRegister', 'Complete Citizen Registration')} <ArrowRight size={14} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#607367' }}>
                {t('auth.haveAccount', 'Already registered?')}{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ background: 'none', border: 'none', color: '#087a3c', fontWeight: 800 }}
                >
                  {t('auth.signIn', 'Sign In')}
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot}>
              <p style={{ fontSize: '11px', color: '#526d5b', marginBottom: '14px' }}>
                Enter your registered email address and we will send you a password reset link.
              </p>

              <label>Email Address</label>
              <input
                type="email"
                className="input"
                required
                placeholder="your-email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <button type="submit" disabled={loading} className="primary full">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '11px' }}>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ background: 'none', border: 'none', color: '#087a3c', fontWeight: 800 }}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

