import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
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

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSend();
  };

  return (
    <Stack spacing={3} sx={{ flex: 1, pb: 6 }}>
      <GlassCard>
        <Stack spacing={1.5}>
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2 }}>
            챗봇 상담 안내
          </Typography>
          <Typography variant="h4">AI 상담 미리 체험하기</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            2026 판교고 입학 설명회를 위해 준비 중인 AI 상담 인터페이스입니다. 실제 답변은 곧 적용될 예정이며, 지금은 제공되는 예시를 통해 사용 흐름을 체험할 수 있습니다.
          </Typography>
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(37, 99, 235, 0.15)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              준비된 정보 요약
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {heroHighlight}
            </Typography>
          </Box>
        </Stack>
      </GlassCard>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: 'rgba(148, 163, 184, 0.15)',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            챗봇과의 대화
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            현재는 예시 응답만 제공됩니다. 곧 실시간 상담이 지원됩니다.
          </Typography>
        </Box>
        <Box
          ref={scrollContainerRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2,
            py: 2,
            backgroundColor: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {messages.map((message) => {
            if (message.role === 'system') {
              return (
                <Box
                  key={message.id}
                  sx={{
                    alignSelf: 'center',
                    textAlign: 'center',
                    maxWidth: '90%',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {message.timestamp}
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.5,
                      px: 2,
                      py: 1,
                      borderRadius: 999,
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      border: '1px dashed rgba(37, 99, 235, 0.4)',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {message.content}
                    </Typography>
                  </Box>
                </Box>
              );
            }

            const isUser = message.role === 'user';
            return (
              <Stack
                key={message.id}
                spacing={0.75}
                alignItems={isUser ? 'flex-end' : 'flex-start'}
                sx={{ width: '100%' }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {message.timestamp}
                </Typography>
                <Stack
                  direction={isUser ? 'row-reverse' : 'row'}
                  spacing={1}
                  alignItems="flex-end"
                  sx={{ maxWidth: '92%' }}
                >
                  <Avatar
                    sx={{
                      bgcolor: isUser ? 'primary.main' : 'rgba(37, 99, 235, 0.15)',
                      color: isUser ? 'primary.contrastText' : 'primary.main',
                      width: 36,
                      height: 36,
                    }}
                  >
                    {isUser ? <PersonRoundedIcon fontSize="small" /> : <AutoAwesomeRoundedIcon fontSize="small" />}
                  </Avatar>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderRadius: 3,
                      backgroundColor: isUser ? 'primary.main' : '#FFFFFF',
                      border: isUser ? 'none' : '1px solid #CBD5F5',
                      color: isUser ? 'primary.contrastText' : 'text.primary',
                      boxShadow: isUser ? '0 8px 16px rgba(37, 99, 235, 0.3)' : '0 4px 12px rgba(148, 163, 184, 0.25)',
                      maxWidth: '100%',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                  </Box>
                </Stack>
              </Stack>
            );
          })}
        </Box>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            px: 2,
            py: 1.5,
          }}
        >
          <TextField
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="궁금한 내용을 입력해 주세요"
            multiline
            minRows={2}
            maxRows={4}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="메시지 보내기"
                    color="primary"
                    type="submit"
                    disabled={!canSend}
                  >
                    <SendRoundedIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
    </Stack>
  );
};

export default ChatPage;
