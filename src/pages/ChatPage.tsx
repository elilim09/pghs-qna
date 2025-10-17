import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GlassCard from '../components/GlassCard';
import BottomChatInput from '../components/BottomChatInput';
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
    '판교고 공식 자료를 기반으로 관련 항목을 찾아 안내해 드립니다. 궁금한 내용을 구체적으로 남겨주시면 더 정확한 답변을 제공할 수 있어요.';
  return fallback;
};

const ChatPage = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: 'system',
      content: '판교고 입학 안내 챗봇입니다. 입학 전형, 교육과정, 학교 생활 전반에 대해 자유롭게 질문해 주세요.',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '안녕하세요! 판교고 공식 데이터를 바탕으로 필요한 정보를 찾아 드릴게요. 알고 싶은 내용을 편하게 말씀해 주세요.',
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
    <Stack spacing={3} sx={{ flex: 1, pb: 28 }}>
      <GlassCard>
        <Stack spacing={1.5}>
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2 }}>
            챗봇 안내
          </Typography>
          <Typography variant="h4">AI 상담 챗봇</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            판교고에서 공개한 최신 입학·학교 생활 정보를 기반으로 맞춤형 답변을 제공합니다. 궁금한 키워드를 입력하면 준비된 데이터를 바탕으로 안내해 드립니다.
          </Typography>
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 18,
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(37, 99, 235, 0.15)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              포함된 핵심 정보
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
          borderRadius: 24,
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
            실시간 상담 기록
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            질문이 등록되면 판교고 공식 데이터를 바탕으로 즉시 답변이 생성됩니다.
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
            pb: 6,
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
                      px: 2.5,
                      py: 1.25,
                      borderRadius: 18,
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      border: '1px dashed rgba(37, 99, 235, 0.3)',
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
                      px: 2.25,
                      py: 1.5,
                      borderRadius: 20,
                      backgroundColor: isUser ? 'primary.main' : '#FFFFFF',
                      border: isUser ? 'none' : '1px solid #CBD5F5',
                      color: isUser ? 'primary.contrastText' : 'text.primary',
                      boxShadow: isUser ? '0 12px 26px rgba(37, 99, 235, 0.32)' : '0 6px 18px rgba(148, 163, 184, 0.25)',
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
      </Box>
      <BottomChatInput
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onSubmit={handleSubmit}
        disabled={!canSend}
        placeholder="질문을 입력하면 가장 관련 있는 답변을 찾아 드립니다"
      />
      <Box sx={{ height: 120 }} />
    </Stack>
  );
};

export default ChatPage;
