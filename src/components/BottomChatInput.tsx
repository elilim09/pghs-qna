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
  // isComposing state를 제거합니다.
  // const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Enter 키를 눌렀고, Shift 키는 누르지 않았을 때
    if (event.key === 'Enter' && !event.shiftKey) {
      // 이벤트 객체의 nativeEvent.isComposing 프로퍼티를 직접 확인하여 IME 조합 중인지 판단합니다.
      // keyCode 229 체크는 일부 환경을 위한 호환성 코드입니다.
      if (event.nativeEvent.isComposing || event.keyCode === 229) {
        // 조합 중이라면 아무것도 하지 않고 함수를 종료합니다.
        return;
      }
      
      // 조합 중이 아닐 때만 기본 동작(줄바꿈)을 막고 메시지를 전송합니다.
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
          placeholder={placeholder ?? 'ㅁ나러마ㅣ너리ㅏㄴㅁ라ㅣㅇㄴㅁ'}
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
      {/* <TextField
        fullWidth
        value={value}
        onChange={onChange}
        //onKeyDown={handleKeyDown}
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
        // isComposing state를 사용하지 않으므로 inputProps도 제거합니다.
        // inputProps={{
        //   onCompositionStart: () => setIsComposing(true),
        //   onCompositionEnd: () => setIsComposing(false),
        // }}
      /> */}
    </Paper>
  );
};

export default BottomChatInput;