import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: '챗봇', path: '/' },
  { label: '탐색', path: '/explore' },
];

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        backgroundColor: 'background.default',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          px: 2,
          pb: 18,
        }}
      >
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            backgroundColor: 'background.default',
            pt: 3,
            pb: 2,
            mb: 1,
          }}
        >
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2 }}>
                2026 판교고 입학설명회
              </Typography>
              <Typography variant="h5">입학 안내 Q&A 허브</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                학부모와 학생을 위한 안내를 한 곳에서 확인해 보세요.
              </Typography>
            </Stack>
          </Stack>
        </Box>
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Outlet />
        </Box>
        <Box component="footer" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="caption" component="p">
            © {new Date().getFullYear()} 판교고등학교 입학설명회. 제공 정보는 학교 공식 자료를 기반으로 작성되었습니다.
          </Typography>
        </Box>
      </Box>
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          left: '50%',
          bottom: 16,
          transform: 'translateX(-50%)',
          width: '100%',
          px: 2,
          pointerEvents: 'none',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid #E2E8F0',
            boxShadow: '0 18px 36px rgba(15, 23, 42, 0.12)',
            display: 'flex',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ButtonBase
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  flex: 1,
                  py: 1.75,
                  borderRadius: 0,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.secondary',
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                }}
              >
                {item.label}
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
