import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { IconButton, InputAdornment, Paper, TextField } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

interface BottomChatInputProps {
  value: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSend: () => void;
  disabled?: boolean;
}

const BottomChatInput = ({ value, placeholder, onChange, onSend, disabled }: BottomChatInputProps) => {
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      const nativeEvent = event.nativeEvent as {
        isComposing?: boolean;
        keyCode?: number;
      };
      if (nativeEvent?.isComposing || nativeEvent?.keyCode === 229 || isComposing) {
        return;
      }
      event.preventDefault();
      if (!disabled) {
        onSend();
      }
    }
  };

  return (
    <Paper
      elevation={10}
      sx={{
        pointerEvents: 'auto',
        width: '100%',
        px: 2.5,
        py: 1.35,
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
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? '질문을 입력하세요'}
        variant="standard"
        multiline
        minRows={1}
        maxRows={4}
        InputProps={{
          disableUnderline: true,
          sx: { fontSize: '1rem' },
          endAdornment: (
            <InputAdornment position="end" sx={{ ml: 1 }}>
              <IconButton
                color="primary"
                disabled={disabled}
                edge="end"
                onClick={() => {
                  if (!disabled) {
                    onSend();
                  }
                }}
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
                  width: 40,
                  height: 40,
                }}
              >
                <SendRoundedIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        inputProps={{
          onCompositionStart: () => setIsComposing(true),
          onCompositionEnd: () => setIsComposing(false),
        }}
      />
    </Paper>
  );
};

export default BottomChatInput;
