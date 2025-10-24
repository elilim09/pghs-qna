// src/pages/ChatPage.tsx
import { useCallback, useEffect, useRef, useState, ChangeEvent } from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BottomChatInput from '../components/BottomChatInput';
import { useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';
import { requestChatAnswer } from '../services/chatService';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

/**
 * 플로팅 입력에 실제로 렌더링될 “안전한” 래퍼 컴포넌트.
 * - value/disabled를 내부 state로 관리 → 부모 re-render와 분리
 * - 합성(한글) 중에는 전송을 비활성화
 */
function FloatingChatInput({
  onSendToPage,
  placeholder,
}: {
  onSendToPage: (text: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // 합성 중간값도 그대로 반영만 (후처리는 전송 시점에)
    setValue(e.target.value);
  }, []);

  const canSend = value.trim().length > 0 && !isComposing;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    const text = value.trim();
    setValue('');
    onSendToPage(text);
  }, [canSend, onSendToPage, value]);

  // 합성 이벤트는 래퍼에서 관리하고, disabled로 전송 차단
  const compositionProps = {
    onCompositionStart: () => setIsComposing(true),
    onCompositionEnd: () => setIsComposing(false),
  };

  return (
    <BottomChatInput
      // 디자인/컴포넌트는 코드1 그대로 사용
      value={value}
      onChange={handleChange}
      onSend={handleSend}
      disabled={!canSend}
      placeholder={placeholder ?? '질문을 입력해 주세요'}
      // 아래 props는 BottomChatInput 내부 TextField로 전파될 수 있음
      // (BottomChatInput 구현에 따라 무시될 수도 있지만 문제 없음)
      {...compositionProps}
    />
  );
}

const sanitizeAssistantReply = (content: string) =>
  content.replace(/\n*참고 문서:[\s\S]*$/u, '').trimEnd();

const ChatPage = () => {
  const { setFloatingInput } = useOutletContext<LayoutOutletContext>();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '안녕하세요. 판교고 입학 안내 챗봇입니다. 궁금한 내용을 질문해 주세요.',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [isAwaitingReply, setIsAwaitingReply] = useState(false);
  const isAwaitingReplyRef = useRef(isAwaitingReply);
  useEffect(() => {
    isAwaitingReplyRef.current = isAwaitingReply;
  }, [isAwaitingReply]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, []);

  const scheduleScrollToBottom = useCallback(() => {
    if (typeof window === 'undefined') {
      scrollToBottom();
      return;
    }
    window.requestAnimationFrame(scrollToBottom);
  }, [scrollToBottom]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      scrollToBottom();
      return;
    }
    const frame = window.requestAnimationFrame(scrollToBottom);
    return () => window.cancelAnimationFrame(frame);
  }, [messages, scrollToBottom]);

  const sendQuestionToAssistant = useCallback(
    async (history: Message[], question: string, placeholderId: string) => {
      setIsAwaitingReply(true);
      try {
        const filteredHistory = history.filter(
          (message): message is Message & { role: 'user' | 'assistant' } => message.role !== 'system',
        );

        const { reply } = await requestChatAnswer({
          question,
          history: filteredHistory.map((message) => ({ role: message.role, content: message.content })),
        });

        const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

        const sanitizedReply = sanitizeAssistantReply(reply);
        setMessages((prev) =>
          prev.map((message) =>
            message.id === placeholderId
              ? { ...message, content: sanitizedReply, timestamp: now }
              : message,
          ),
        );
        scheduleScrollToBottom();
      } catch (error) {
        const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        const errorMessage =
          error instanceof Error
            ? `답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.\n사유: ${error.message}`
            : '답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';

        setMessages((prev) =>
          prev.map((message) =>
            message.id === placeholderId ? { ...message, content: errorMessage, timestamp: now } : message,
          ),
        );
        scheduleScrollToBottom();
      } finally {
        setIsAwaitingReply(false);
      }
    },
    [scheduleScrollToBottom],
  );

  // 플로팅 입력에서 올라오는 "확정 텍스트"만 처리 (타이핑은 플로팅 컴포넌트 내부 상태로만)
  const handleSubmitFromFloating = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

      if (isAwaitingReplyRef.current) {
        const waitMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '이전 질문에 대한 답변을 준비 중입니다. 잠시 후 다시 시도해 주세요.',
          timestamp: now,
        };
        setMessages((prev) => [...prev, waitMessage]);
        return;
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: now,
      };

      const placeholderId = crypto.randomUUID();
      const assistantPlaceholder: Message = {
        id: placeholderId,
        role: 'assistant',
        content: '답변을 생성하고 있어요... 잠시만 기다려 주세요.',
        timestamp: now,
      };

      const historyBeforeSend = messagesRef.current;

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      scheduleScrollToBottom();

      void sendQuestionToAssistant([...historyBeforeSend, userMessage], trimmed, placeholderId);
    },
    [scheduleScrollToBottom, sendQuestionToAssistant],
  );

  // ⛳️ 핵심: setFloatingInput는 마운트 시 "단 1회"만 호출하고, 변동 없는 props만 넘긴다.
  useEffect(() => {
    setFloatingInput({
      component: FloatingChatInput,
      props: {
        onSendToPage: handleSubmitFromFloating,
        placeholder: '질문을 입력해 주세요',
      },
    });
    return () => {
      setFloatingInput(null);
    };
    // 의도적으로 의존성에 handleSubmitFromFloating을 넣지 않음(안전한 1회 설정).
    // handleSubmitFromFloating은 setState 클로저로 안전하게 동작.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFloatingInput]);

  // ====== 아래는 코드1의 “디자인” 그대로 유지 ======
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
        <Box ref={scrollAnchorRef} sx={{ height: 1 }} />
      </Box>
    </Stack>
  );
};

export default ChatPage;
