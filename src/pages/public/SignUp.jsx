/**
 * @fileoverview SignUp component.
 * Allows users to register via email/password or OAuth providers.
 * Syncs user data and role after successful authentication.
 *
 * @module pages/public/SignUp
 */

import React, { useState, useEffect } from 'react';
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

import FormCard from '../../components/FormCard.jsx';
import Input from '../../components/Input.jsx';
import AuthProviderButton from '../../components/AuthProviderButton.jsx';
import { auth } from '../../firebase/auth.js';
import { useUser } from '../../hooks/useUser.jsx';

import {
  signInWithRedirect,
  getRedirectResult,
} from '../../firebase/authUtils.js';
import { googleProvider, githubProvider } from '../../firebase/auth.js';

import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getRedirectForRole } from '../../utils/getRedirectForRole.js';
import { syncUserAndRedirect } from '../../utils/syncUserAndRedirect.js';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, loading: userLoading, setUser, setRole } = useUser();

  const fromPath = location.state?.from?.pathname;

  // 🔀 Redirect authenticated users away from auth pages
  useEffect(() => {
    const authPages = ['/sign-in', '/register'];
    const currentPath = location.pathname;

    if (!userLoading && isAuthenticated && authPages.includes(currentPath)) {
      const fallbackPath = getRedirectForRole(role);
      navigate(fromPath || fallbackPath);
    }
  }, [isAuthenticated, userLoading, role, navigate, fromPath, location.pathname]);

  // 🔀 Handle OAuth redirect results
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const storedPath = localStorage.getItem('redirectAfterLogin');
          localStorage.removeItem('redirectAfterLogin');
          const fallbackPath = getRedirectForRole('guest');
          await syncUserAndRedirect(result.user, navigate, setUser, setRole, fallbackPath, storedPath);
        }
      } catch (err) {
        setError(`Provider registration error: ${err.message}`);
      } finally {
        setLoading(false); 
      }
    };

    checkRedirectResult();
  }, [navigate, setUser, setRole]);

  // 🔀 Handle OAuth sign-up
  const handleSocialRedirect = async (providerName) => {
    setError('');
    setIsSubmitting(true);

    const provider = providerName === 'google' ? googleProvider : githubProvider;

    try {
      await setPersistence(auth, browserLocalPersistence);

      if (fromPath) {
        localStorage.setItem('redirectAfterLogin', fromPath);
      }

      await signInWithRedirect(auth, provider);
    } catch (err) {
      setError(`Failed to register with ${providerName}: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  // 🔀 Handle email/password registration
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    if (!email || !password || !confirm) {
      setError('All fields are required');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const fallbackPath = getRedirectForRole('guest');
      await syncUserAndRedirect(result.user, navigate, setUser, setRole, fallbackPath, fromPath);
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered');
          break;
        case 'auth/weak-password':
          setError('Password must be at least 6 characters');
          break;
        default:
          setError('Something went wrong, please try again');
      }
      setIsSubmitting(false);
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
          title="Create your account"
          subtitle="Access your workspace in seconds."
          loading={isSubmitting}
          footer={
            <Typography variant="body2" align="center">
              Already have an account?{' '}
              <Link to="/sign-in" style={{ color: '#90caf9', textDecoration: 'none' }}>
                Sign In
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

          <Divider sx={{ my: 2 }}>or create with email</Divider>

          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error && !email}
            helperText={!email && error ? 'Email is required' : ''}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error && !password}
            helperText={!password && error ? 'Password is required' : ''}
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={!!error && password !== confirm}
            helperText={password !== confirm ? 'Passwords do not match' : ''}
          />

          <Button
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </FormCard>
      </Container>
    </Box>
  );
};

export default SignUp;
