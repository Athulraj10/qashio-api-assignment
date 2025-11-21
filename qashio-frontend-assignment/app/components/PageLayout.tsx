'use client';

import { Container, Box, Paper } from '@mui/material';
import NavBar from './NavBar';
import ProtectedRoute from './ProtectedRoute';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', background: isDashboard ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' : 'background.default' }}>
        <NavBar />
        <Container
          component="main"
          maxWidth={isDashboard ? 'xl' : 'lg'}
          sx={{
            mt: isDashboard ? 3 : 4,
            mb: 4,
            flexGrow: 1,
            px: isDashboard ? 3 : 2,
          }}
        >
          {isDashboard ? (
            <Box>{children}</Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              {children}
            </Paper>
          )}
        </Container>
        <Box
          component="footer"
          sx={{
            py: 3,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            mt: 'auto',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              © {new Date().getFullYear()} Qashio - Financial Management Made Simple
            </Box>
          </Container>
        </Box>
      </Box>
    </ProtectedRoute>
  );
} 