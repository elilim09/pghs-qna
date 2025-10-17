import { ComponentType, Dispatch, SetStateAction, useMemo, useState } from 'react';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

type FloatingInputConfig = {
  component: ComponentType<any>;
  props?: Record<string, unknown>;
};

const navItems = [
  { label: '챗봇', path: '/', icon: <AutoAwesomeRoundedIcon /> },
  { label: '탐색', path: '/explore', icon: <TravelExploreRoundedIcon /> },
];

export type LayoutOutletContext = {
  setFloatingInput: Dispatch<SetStateAction<FloatingInputConfig | null>>;
};

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [floatingInputConfig, setFloatingInput] = useState<FloatingInputConfig | null>(null);

  const floatingInput = useMemo(() => {
    if (!floatingInputConfig) return null;
    const Component = floatingInputConfig.component;
    return <Component {...(floatingInputConfig.props ?? {})} />;
  }, [floatingInputConfig]);

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
          pb: 6,
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
          <Stack spacing={1.5}>
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
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, pb: 10 }}>
          <Outlet context={{ setFloatingInput }} />
        </Box>
        <Box component="footer" sx={{ py: 4, textAlign: 'center', color: 'text.secondary', pb: 10 }}>
          <Typography variant="caption" component="p">
            © {new Date().getFullYear()} 판교고등학교 입학설명회. 제공 정보는 학교 공식 자료를 기반으로 작성되었습니다.
          </Typography>
        </Box>
        <Box
          component="nav"
          sx={{
            position: 'fixed',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 480,
            px: 2,
            zIndex: (theme) => theme.zIndex.modal,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-end">
            <Paper
              elevation={8}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1,
                py: 0.75,
                borderRadius: 999,
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(148, 163, 184, 0.35)',
                boxShadow: '0 20px 36px rgba(15, 23, 42, 0.18)',
                pointerEvents: 'auto',
              }}
            >
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <IconButton
                    key={item.path}
                    aria-label={item.label}
                    onClick={() => navigate(item.path)}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'primary.main' : 'rgba(37, 99, 235, 0.06)',
                      color: isActive ? 'primary.contrastText' : 'primary.main',
                      boxShadow: isActive ? '0 12px 24px rgba(37, 99, 235, 0.35)' : 'none',
                      border: isActive ? 'none' : '1px solid rgba(37, 99, 235, 0.18)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: isActive ? 'primary.main' : 'rgba(37, 99, 235, 0.16)',
                      },
                    }}
                  >
                    {item.icon}
                  </IconButton>
                );
              })}
            </Paper>
            {floatingInput && (
              <Box sx={{ flex: 1 }}>
                {floatingInput}
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
