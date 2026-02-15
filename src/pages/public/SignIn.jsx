/**
 * @fileoverview SignIn component.
 * Handles user authentication via email/password or OAuth providers.
 * Supports both login and registration flows.
 *
 * @module pages/public/SignIn
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Divider,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { syncUserAndRedirect } from '../../utils/syncUserAndRedirect.js';
import { auth } from '../../firebase/auth.js';
import {
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
} from '../../firebase/authUtils.js';
import { googleProvider, githubProvider } from '../../firebase/auth.js';
import { sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { useUser } from '../../hooks/useUser.jsx';
import FormCard from '../../components/FormCard.jsx';
import Input from '../../components/Input.jsx';
import AuthProviderButton from '../../components/AuthProviderButton.jsx';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getRedirectForRole } from '../../utils/getRedirectForRole.js';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname;
  const isRegister = location.pathname.includes('register');

  const { isAuthenticated, role, loading: userLoading, setUser, setRole } = useUser();
  const hasHandledRedirect = useRef(false);

  // 🔀 Redirect authenticated users away from auth pages
  useEffect(() => {
    const authPages = ['/sign-in', '/register'];
    const currentPath = location.pathname;

    if (isAuthenticated && !userLoading && authPages.includes(currentPath)) {
      const fallbackPath = getRedirectForRole(role);
      navigate(fromPath || fallbackPath);
    }
  }, [isAuthenticated, userLoading, role, navigate, fromPath, location.pathname]);

  // 🔀 Handle OAuth redirect results
  useEffect(() => {
    const checkRedirectResult = async () => {
      if (hasHandledRedirect.current) return;
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          hasHandledRedirect.current = true;
          const storedPath = localStorage.getItem('redirectAfterLogin');
          localStorage.removeItem('redirectAfterLogin');
          const fallbackPath = getRedirectForRole('guest');
          await syncUserAndRedirect(result.user, navigate, setUser, setRole, fallbackPath, storedPath);
        }
      } catch (err) {
        setError(`Sign-in error: ${err.message}`);
      }
    };

    checkRedirectResult();
  }, [navigate, setUser, setRole]);

  // 🔀 Handle OAuth sign-in
  const handleSocialRedirect = async (providerName) => {
    setError('');
    setIsSubmitting(true);

    localStorage.removeItem('token');
    localStorage.removeItem('role');

    const provider = providerName === 'google' ? googleProvider : githubProvider;

    try {
      await setPersistence(auth, browserLocalPersistence);
      if (fromPath) {
        localStorage.setItem('redirectAfterLogin', fromPath);
      }
      await signInWithRedirect(auth, provider);
    } catch (err) {
      setError(`Failed to sign in with ${providerName}: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  // 🔀 Handle email/password sign-in or registration
  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('role');

    setError('');
    setIsSubmitting(true);

    try {
      let user;
      if (isRegister) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      }

      const fallbackPath = getRedirectForRole('guest');
      await syncUserAndRedirect(user, navigate, setUser, setRole, fallbackPath, fromPath);
    } catch (err) {
      const errorMap = {
        'auth/user-not-found': 'User not found',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already registered',
        'auth/invalid-email': 'Invalid email format',
        'auth/weak-password': 'Password should be at least 6 characters',
      };
      setError(errorMap[err.code] || 'Something went wrong, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔀 Handle password reset
  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email to reset password');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError('We sent you a recovery email 📩');
    } catch (err) {
      setError(
        err.code === 'auth/user-not-found'
          ? 'No user found with that email'
          : 'Something went wrong. Try again'
      );
    }
  };

  if (loading || userLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading authentication...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <FormCard
          title={isRegister ? 'Create your account' : 'Welcome back'}
          subtitle={isRegister ? 'Sign up to get started.' : 'Sign in to your workspace.'}
          loading={isSubmitting}
          footer={
            <Typography variant="body2" align="center">
              {isRegister ? 'Already have an account?' : 'Don’t have an account?'}{' '}
              <Link
                to={isRegister ? '/sign-in' : '/register'}
                style={{ color: '#90caf9', textDecoration: 'none' }}
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </Link>
            </Typography>
          }
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <AuthProviderButton provider="google" onClick={() => handleSocialRedirect('google')} />
          <AuthProviderButton provider="github" onClick={() => handleSocialRedirect('github')} />

          <Divider sx={{ my: 2 }}>
            {isRegister ? 'or sign up with email' : 'or sign in with email'}
          </Divider>

          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error && !email}
            helperText={!email && error ? 'Email is required' : ''}
            aria-label="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error && !password}
            helperText={!password && error ? 'Password is required' : ''}
            aria-label="password"
          />

          <Button
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
            onClick={handleSubmit}
          >
            {isSubmitting
              ? isRegister
                ? 'Creating account…'
                : 'Signing in…'
              : isRegister
              ? 'Sign Up'
              : 'Sign In'}
          </Button>

          {!isRegister && (
            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 2, cursor: 'pointer', color: '#90caf9' }}
              onClick={handlePasswordReset}
              aria-label="forgot-password"
            >
              Forgot your password?
            </Typography>
          )}
        </FormCard>
      </Container>
    </Box>
  );
};

export default SignIn;
