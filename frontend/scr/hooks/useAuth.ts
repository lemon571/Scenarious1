import { useEffect, useState } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie;
      const hasToken = cookies.split('; ').some(cookie => cookie.trim().startsWith('token='));
      console.log('hasToken:', hasToken);
      console.log('All cookies:', document.cookie);
      setIsAuthenticated(hasToken);
      setIsLoading(false);
    };

    checkAuth();

    // window.addEventListener('storage', checkAuth);
    // return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return { isAuthenticated, isLoading };
}
