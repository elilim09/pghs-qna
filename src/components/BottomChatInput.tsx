import { ChangeEvent, FormEvent } from 'react';
import { Box, IconButton, Paper, TextField } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

interface BottomChatInputProps {
  value: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
}

const BottomChatInput = ({ value, placeholder, onChange, onSubmit, disabled }: BottomChatInputProps) => (
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
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{ width: '100%', maxWidth: 440, pointerEvents: 'auto' }}
    >
      <Paper
        elevation={6}
        sx={{
          px: 2,
          py: 1.25,
          width: '100%',
          borderRadius: 22,
          border: '1px solid #E2E8F0',
          boxShadow: '0 16px 32px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? '궁금한 내용을 입력해 주세요'}
          variant="standard"
          multiline
          minRows={1}
          maxRows={4}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '1rem',
              fontWeight: 600,
              pr: 1,
            },
          }}
        />
        <IconButton type="submit" color="primary" disabled={disabled} sx={{ ml: 1.5 }}>
          <SendRoundedIcon />
        </IconButton>
      </Paper>
    </Box>
  </Box>
);

export default BottomChatInput;
