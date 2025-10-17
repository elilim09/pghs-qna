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
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 100,
        width: '100%',
        maxWidth: 480,
        px: 2,
        pointerEvents: 'none',
        zIndex: (theme) => theme.zIndex.snackbar,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          py: 1.25,
          borderRadius: 14,
          border: '1px solid #CBD5F5',
          boxShadow: '0 16px 32px rgba(15, 23, 42, 0.12)',
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
        <IconButton type="submit" color="primary" disabled={disabled}>
          <SendRoundedIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default BottomChatInput;
