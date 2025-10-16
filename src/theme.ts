import { createTheme } from '@mui/material/styles';

const expressiveGradient = 'linear-gradient(135deg, rgba(103,80,164,0.18) 0%, rgba(72,52,124,0.25) 35%, rgba(30,30,60,0.35) 100%)';

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7D5260',
    },
    background: {
      default: '#f6f2ff',
      paper: 'rgba(255, 255, 255, 0.72)',
    },
    text: {
      primary: '#1D1B20',
      secondary: '#4A4458',
    },
  },
  typography: {
    fontFamily: "'Pretendard Variable', 'Noto Sans KR', 'Roboto', sans-serif",
    h1: { fontWeight: 600, letterSpacing: '-0.5px' },
    h2: { fontWeight: 600, letterSpacing: '-0.25px' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: { borderRadius: 999 },
  },
  shape: {
    borderRadius: 28,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: expressiveGradient,
          backgroundAttachment: 'fixed',
        },
        '::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(103,80,164,0.4)',
          borderRadius: 999,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backdropFilter: 'blur(24px)',
          backgroundImage: expressiveGradient,
          border: '1px solid rgba(255,255,255,0.32)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 999,
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.28)',
          backgroundColor: 'rgba(255,255,255,0.65)',
          backgroundImage: expressiveGradient,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(18, 18, 24, 0.45)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
        },
      },
    },
  },
});

export default theme;
