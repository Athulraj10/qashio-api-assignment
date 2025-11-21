'use client';

import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useLogout } from '@/app/hooks/useAuth';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { logout } = useLogout();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const showAuthenticated = mounted && isAuthenticated;

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Button
            color="inherit"
            onClick={() => handleNavigation('/')}
            sx={{
              fontWeight: 'bold',
              fontSize: '1.25rem',
              textTransform: 'none',
            }}
          >
            Qashio
          </Button>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {showAuthenticated ? (
            <>
              <Button
                color="inherit"
                onClick={() => handleNavigation('/dashboard')}
                sx={{
                  fontWeight: pathname === '/' ? 'bold' : 'normal',
                  bgcolor: pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                onClick={() => handleNavigation('/transactions')}
                sx={{
                  fontWeight: pathname === '/transactions' ? 'bold' : 'normal',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                }}
              >
                Transactions
              </Button>
              <Button
                color="inherit"
                onClick={() => handleNavigation('/transactions/new')}
                sx={{
                  fontWeight: pathname === '/transactions/new' ? 'bold' : 'normal',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                }}
              >
                New Transaction
              </Button>
              <Button
                color="inherit"
                onClick={() => handleNavigation('/budgets')}
                sx={{
                  fontWeight: pathname === '/budgets' ? 'bold' : 'normal',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                }}
              >
                Budgets
              </Button>
              <Button
                color="inherit"
                onClick={() => handleNavigation('/categories')}
                sx={{
                  fontWeight: pathname === '/categories' ? 'bold' : 'normal',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                }}
              >
                Categories
              </Button>
              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {user?.name}
                </Typography>
                <Button
                  color="inherit"
                  onClick={logout}
                  startIcon={<Logout />}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                    },
                  }}
                >
                  Logout
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => handleNavigation('/login')}
                variant={pathname === '/login' ? 'outlined' : 'text'}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderColor: 'rgba(255,255,255,0.8)',
                  },
                }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                onClick={() => handleNavigation('/register')}
                variant={pathname === '/register' ? 'outlined' : 'text'}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderColor: 'rgba(255,255,255,0.8)',
                  },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
} 