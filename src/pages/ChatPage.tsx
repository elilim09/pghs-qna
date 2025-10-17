import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import knowledgeBase from '../data/knowledgeBase';
import BottomChatInput from '../components/BottomChatInput';
import { useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';

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
  const { setFloatingInput } = useOutletContext<LayoutOutletContext>();
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

  const handleSend = useCallback(() => {
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
  }, [canSend, input]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(event.target.value);
  }, []);

  const floatingInputConfig = useMemo(
    () => ({
      component: BottomChatInput,
      props: {
        value: input,
        onChange: handleChange,
        onSend: handleSend,
        disabled: !canSend,
        placeholder: '질문을 입력해 주세요',
      },
    }),
    [canSend, handleChange, handleSend, input]
  );

  useEffect(() => {
    setFloatingInput(floatingInputConfig);
  }, [floatingInputConfig, setFloatingInput]);

  useEffect(() => {
    return () => {
      setFloatingInput(null);
    };
  }, []);

  return (
    <Stack spacing={2.5} sx={{ flex: 1, minHeight: 0, pb: 18 }}>
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          minHeight: 360,
          minWidth: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          px: { xs: 0.5, sm: 1 },
          py: 1,
          pb: 6,
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
    </Stack>
  );
};

export default ChatPage;
