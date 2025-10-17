import { ChangeEvent, KeyboardEvent as ReactKeyboardEvent, useCallback } from 'react';
import { IconButton, InputAdornment, Paper, TextField } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import useKeyComposing from '../hooks/useKeyComposing';

interface BottomChatInputProps {
  value: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSend: () => void;
  disabled?: boolean;
}

/**
 * 한글 IME(조합 입력) 환경에서 중복/삭제/커서튐을 막기 위한
 * 3중 가드 적용( isComposing | nativeEvent.isComposing | 'Process'/229 )
 * - Shift+Enter: 줄바꿈
 * - Enter: 전송(조합 중에는 무시)
 */
const BottomChatInput = ({ value, placeholder, onChange, onSend, disabled }: BottomChatInputProps) => {
  const { isComposing, handleCompositionStart, handleCompositionEnd } = useKeyComposing();

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const native: any = event.nativeEvent;

      // 브라우저/플랫폼별 조합 입력 탐지
      const composingGuard =
        isComposing ||
        native?.isComposing === true ||
        event.key === 'Process' ||      // 일부 IME
        native?.keyCode === 229;        // 안드로이드/일부 환경

      if (composingGuard) {
        // 후보 확정용 Enter 등: 앱 단축키/전송 로직을 막기 위해 그대로 리턴
        return;
      }

      // Enter 전송 (Shift+Enter는 줄바꿈)
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (!disabled) onSend();
      }
    },
    [disabled, isComposing, onSend]
  );

  const handleClickSend = useCallback(() => {
    // 조합 중에는 클릭 전송도 막기
    if (!disabled && !isComposing) onSend();
  }, [disabled, isComposing, onSend]);

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
        onChange={onChange} // ⚠️ 조합 중에는 가공 금지(그대로 setValue만)!
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? '질문을 입력하세요'}
        variant="standard"
        multiline
        minRows={1}
        maxRows={4}
        // IME 친화 속성은 TextField의 root prop인 inputProps로 전달하는 편이 안전
        inputProps={{
          inputMode: 'text',
          autoCorrect: 'off',
          autoCapitalize: 'none',
          spellCheck: 'false',
        }}
        InputProps={{
          disableUnderline: true,
          sx: { fontSize: '1rem' },
          endAdornment: (
            <InputAdornment position="end" sx={{ ml: 1 }}>
              <IconButton
                color="primary"
                disabled={disabled}
                edge="end"
                onClick={handleClickSend}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow: '0 10px 20px rgba(37, 99, 235, 0.32)',
                  '&:hover': { backgroundColor: 'primary.dark' },
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
      />
    </Paper>
  );
};

export default BottomChatInput;