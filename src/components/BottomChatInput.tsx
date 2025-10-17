import { ChangeEvent, KeyboardEvent } from 'react';
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
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (event.nativeEvent.isComposing || event.keyCode === 229) {
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
        placeholder={placeholder ?? '질문을 입력해 주세요'}
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
            alignItems: 'center',
            '& .MuiInputBase-inputMultiline': {
              py: 0.5,
            },
          },
          endAdornment: (
            <InputAdornment position="end" sx={{ ml: 1 }}>
              <IconButton
                color="primary"
                disabled={disabled}
                edge="end"
                size="small"
                onClick={() => {
                  if (!disabled) {
                    onSend();
                  }
                }}
                sx={{
                  width: 36,
                  height: 36,
                }}
              >
                <SendRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Paper>
  );
};

export default BottomChatInput;
