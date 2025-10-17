import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0F172A',
    },
    background: {
      default: '#F4F6FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: "'Pretendard Variable', 'Noto Sans KR', 'Roboto', sans-serif",
    h1: { fontWeight: 700, letterSpacing: '-0.5px' },
    h2: { fontWeight: 700, letterSpacing: '-0.25px' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.6 },
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
        body: {
          margin: 0,
          minHeight: '100dvh',
          backgroundColor: '#F4F6FA',
          color: '#0F172A',
          fontFamily: "'Pretendard Variable', 'Noto Sans KR', 'Roboto', sans-serif",
          WebkitFontSmoothing: 'antialiased',
        },
        '#root': {
          minHeight: '100dvh',
        },
        '::-webkit-scrollbar': {
          width: 6,
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(148, 163, 184, 0.6)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          boxShadow: 'none',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '1.25rem',
          paddingRight: '1.25rem',
        },
      },
    },
  },
});

export default theme;
