import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GlassCard from '../components/GlassCard';
import knowledgeBase from '../data/knowledgeBase';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

const demoAssistantReply = (prompt: string) => {
  const flatItems = knowledgeBase.flatMap((category) => category.items);
  const matched = flatItems.find((item) => item.tags.some((tag) => prompt.includes(tag)));
  if (matched) {
    return `"${matched.question}"에 대한 안내입니다. ${matched.answer} (출처: ${matched.source})`;
  }
  const fallback =
    '현재는 예시 챗봇 환경입니다. 학교에서 제공한 정보를 기반으로 다양한 질문에 답변할 수 있도록 개발되고 있습니다.';
  return fallback;
};

const ChatPage = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: 'system',
      content: '판교고 입학 설명회 챗봇입니다. 궁금한 점을 자연스럽게 물어보세요.',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        '안녕하세요! 현재는 데모 버전으로 동작 중이에요. 입학, 교육과정, 학교 생활과 관련된 질문을 남겨주시면 준비된 답변 예시를 보여드릴게요.',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const canSend = input.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: demoAssistantReply(input.trim()),
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
  };

  const heroHighlight = useMemo(
    () =>
      knowledgeBase.map((category) => `${category.title} (${category.items.length})`).join(' · '),
    [],
  );

  return (
    <Stack spacing={4} sx={{ pb: 12 }}>
      <GlassCard>
        <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Box flex={1}>
            <Typography variant="overline" sx={{ color: 'primary.light', letterSpacing: 3 }}>
              Q&A Companion
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              판교고 입학 설명회 챗봇 데모
            </Typography>
            <Typography variant="body1" sx={{ mt: 1.5, color: 'text.secondary' }}>
              학교가 제공한 공식 문서를 토대로 학부모님의 질문에 답변할 AI 상담사를 준비하고 있습니다. 현재 페이지에서는 사용자 경험을 먼저 살펴볼 수 있도록 인터페이스만 제공됩니다.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              준비된 정보 하이라이트: {heroHighlight}
            </Typography>
          </Box>
          <Box
            sx={{
              background: 'radial-gradient(circle at top, rgba(255,255,255,0.8), rgba(103,80,164,0.4))',
              borderRadius: '28px',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              AI 답변 미리보기
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              예시 답변은 실제 서비스에서 제공될 내용을 미리 보여주기 위한 것입니다. 곧 실시간 상담이 지원될 예정입니다.
            </Typography>
          </Box>
        </Stack>
      </GlassCard>

      <GlassCard>
        <Stack spacing={3}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            대화 기록
          </Typography>
          <Divider flexItem light />
          <Stack spacing={2} sx={{ maxHeight: { xs: 420, md: 540 }, overflowY: 'auto', pr: 1 }}>
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const isSystem = message.role === 'system';
              return (
                <Stack key={message.id} direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    sx={{
                      bgcolor: isUser ? 'secondary.main' : isSystem ? 'rgba(255,255,255,0.45)' : 'primary.main',
                      color: isSystem ? 'text.primary' : '#fff',
                      boxShadow: '0 10px 20px rgba(103,80,164,0.2)',
                    }}
                  >
                    {isUser ? <PersonRoundedIcon /> : <AutoAwesomeRoundedIcon />}
                  </Avatar>
                  <Box
                    sx={{
                      flex: 1,
                      backgroundColor: isSystem
                        ? 'rgba(255,255,255,0.65)'
                        : isUser
                        ? 'rgba(125,82,96,0.1)'
                        : 'rgba(103,80,164,0.12)',
                      borderRadius: 4,
                      px: 2,
                      py: 1.5,
                      border: '1px solid rgba(255,255,255,0.35)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {message.timestamp}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {message.content}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
          <TextField
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="궁금한 질문을 입력해 주세요."
            multiline
            minRows={2}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="메시지 보내기"
                    color="primary"
                    disabled={!canSend}
                    onClick={handleSend}
                  >
                    <SendRoundedIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            onClick={handleSend}
            variant="contained"
            size="large"
            disabled={!canSend}
            endIcon={<SendRoundedIcon />}
            sx={{ alignSelf: { xs: 'stretch', md: 'flex-end' }, minWidth: 180 }}
          >
            메시지 보내기
          </Button>
        </Stack>
      </GlassCard>
    </Stack>
  );
};

export default ChatPage;
