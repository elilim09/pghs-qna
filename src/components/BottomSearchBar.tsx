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
        position: 'sticky',
        bottom: 16,
        display: 'flex',
        justifyContent: 'center',
        zIndex: (theme) => theme.zIndex.appBar - 1,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          px: 2,
          py: 1,
          width: { xs: '92%', sm: 520 },
          borderRadius: 999,
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(246, 242, 255, 0.85)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 12px 30px rgba(103, 80, 164, 0.2)',
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
              fontSize: '1.05rem',
              fontWeight: 500,
            },
          }}
          {...textFieldProps}
        />
      </Paper>
    </Box>
  );
};

export default BottomSearchBar;
