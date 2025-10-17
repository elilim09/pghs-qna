import { ChangeEvent } from 'react';
import { Box, Paper, TextField, TextFieldProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface BottomSearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  TextFieldProps?: TextFieldProps;
}

const BottomSearchBar = ({ value, placeholder, onChange, TextFieldProps: textFieldProps }: BottomSearchBarProps) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: { xs: 112, sm: 128 },
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        pointerEvents: 'none',
        px: 2,
        zIndex: (theme) => theme.zIndex.modal - 1,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          pointerEvents: 'auto',
          px: 2,
          py: 1.25,
          width: '100%',
          maxWidth: 440,
          borderRadius: 18,
          border: '1px solid #E2E8F0',
          boxShadow: '0 16px 32px rgba(15, 23, 42, 0.12)',
        }}
      >
        <TextField
          fullWidth
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? '어떤 정보가 궁금하신가요?'}
          variant="standard"
          InputProps={{
            startAdornment: <SearchIcon color="primary" sx={{ mr: 1 }} />,
            disableUnderline: true,
            sx: {
              fontSize: '1rem',
              fontWeight: 600,
            },
          }}
          {...textFieldProps}
        />
      </Paper>
    </Box>
  );
};

export default BottomSearchBar;
