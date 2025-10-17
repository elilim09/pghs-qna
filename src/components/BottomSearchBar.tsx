import { ChangeEvent } from 'react';
import { Paper, TextField, TextFieldProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface BottomSearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  TextFieldProps?: TextFieldProps;
}

const BottomSearchBar = ({ value, placeholder, onChange, TextFieldProps: textFieldProps }: BottomSearchBarProps) => {
  return (
    <Paper
      elevation={10}
      sx={{
        pointerEvents: 'auto',
        px: 2.5,
        py: 1.35,
        width: '100%',
        borderRadius: 999,
        border: '1px solid #CBD5F5',
        boxShadow: '0 24px 44px rgba(15, 23, 42, 0.2)',
        backgroundColor: '#FFFFFF',
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
  );
};

export default BottomSearchBar;
