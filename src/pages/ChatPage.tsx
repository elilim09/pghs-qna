import { useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import knowledgeBase from '../data/knowledgeBase';
import BottomChatInput from '../components/BottomChatInput';

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
      role: 'assistant',
      content: '안녕하세요. 판교고 입학 안내 챗봇입니다. 궁금한 내용을 질문해 주세요.',
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

  return (
    <Stack spacing={3} sx={{ flex: 1, pb: 20 }}>
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          minHeight: 360,
          borderRadius: 2,
          border: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          px: 2,
          py: 2.5,
        }}
      >
        {messages.map((message) => {
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
              <Stack direction={isUser ? 'row-reverse' : 'row'} spacing={1} alignItems="flex-end" sx={{ maxWidth: '92%' }}>
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
                    px: 1.75,
                    py: 1.25,
                    borderRadius: 2,
                    backgroundColor: isUser ? 'primary.main' : '#FFFFFF',
                    border: isUser ? 'none' : '1px solid #CBD5F5',
                    color: isUser ? 'primary.contrastText' : 'text.primary',
                    boxShadow: isUser ? '0 6px 14px rgba(37, 99, 235, 0.25)' : '0 4px 12px rgba(148, 163, 184, 0.18)',
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
      <BottomChatInput
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onSend={handleSend}
        disabled={!canSend}
        placeholder="질문을 입력해 주세요"
      />
      <Box sx={{ height: 160 }} />
    </Stack>
  );
};

export default ChatPage;
