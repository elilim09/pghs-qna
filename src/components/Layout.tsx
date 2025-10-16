import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { label: '챗봇 상담', path: '/' },
  { label: '정보 탐색', path: '/explore' },
];

const Layout = () => {
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(circle at top left, rgba(255,255,255,0.65) 0%, rgba(246,242,255,0.9) 45%, rgba(223,213,255,0.8) 100%)',
      }}
    >
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #D0BCFF, #6750A4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1D1B20',
                fontWeight: 700,
              }}
            >
              PG
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase', letterSpacing: 2 }}>
                Pangyo High School
              </Typography>
              <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                입학 설명회 QnA 허브
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                variant={location.pathname === item.path ? 'contained' : 'text'}
                color={location.pathname === item.path ? 'primary' : 'inherit'}
                sx={{
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  color: location.pathname === item.path ? 'primary.contrastText' : 'rgba(255,255,255,0.72)',
                  borderRadius: 999,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ flex: 1, width: '100%', py: { xs: 4, md: 6 } }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ py: 4, textAlign: 'center', color: 'rgba(29,27,32,0.7)' }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} 판교고등학교 입학 설명회 Q&A 허브. 모든 정보는 학교가 제공한 문서를 기반으로 작성되었습니다.
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
