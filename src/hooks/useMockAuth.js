import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Mock 인증 훅
const useMockAuth = (requireAuth = false) => {
  const navigate = useNavigate();
  const { isLoggedIn, user, login, signup, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (requireAuth && !isLoggedIn) {
      const hasUser = checkAuth();
      if (!hasUser) {
        navigate('/login');
      }
    }
  }, [requireAuth, isLoggedIn, navigate]);

  return { isLoggedIn, user, login, signup, logout };
};

export default useMockAuth;
