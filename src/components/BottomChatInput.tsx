import { ChangeEvent, FormEvent } from 'react';
import { Box, IconButton, Paper, TextField } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

interface BottomChatInputProps {
  value: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  disabled?: boolean;
}

const BottomChatInput = ({ value, placeholder, onChange, onSend, disabled }: BottomChatInputProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!disabled) {
      onSend();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Paper
        elevation={10}
        sx={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.4,
          borderRadius: 999,
          border: '1px solid #CBD5F5',
          boxShadow: '0 24px 44px rgba(15, 23, 42, 0.22)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <TextField
          fullWidth
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? '질문을 입력하세요'}
          variant="standard"
          multiline
          minRows={1}
          maxRows={4}
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: '1rem' },
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={disabled}
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.32)',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(148, 163, 184, 0.35)',
              color: 'rgba(255, 255, 255, 0.85)',
              boxShadow: 'none',
            },
            width: 44,
            height: 44,
          }}
        >
          <SendRoundedIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default BottomChatInput;
