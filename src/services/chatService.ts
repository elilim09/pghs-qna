import knowledgeEntries, { KnowledgeEntry } from '../data/knowledgeBase';

type ChatRole = 'user' | 'assistant';

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface ChatRequestPayload {
  question: string;
  history: ChatTurn[];
}

export interface ChatResponsePayload {
  reply: string;
}

interface IndexedEntry {
  entry: KnowledgeEntry;
  normalizedQuestion: string;
  normalizedAnswer: string;
  normalizedTags: string;
  normalizedCategory: string;
  normalizedAll: string;
}

const DEFAULT_API_BASE_URL = 'https://hwanghj09.p-e.kr';
const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '');
const API_ENDPOINT = `${apiBaseUrl}/api/chat`;

const SYSTEM_PROMPT = `너는 판교고등학교에 대해 매우 잘 아는 친절한 도우미이며, 학생 혹은 학부모들의 질문에 대한 Q&A를 담당하고 있어. 제공된 학교 공식 문서 발췌 내용만을 근거로 정확하고 도움이 되는 답변을 제공해. 문서에 정보가 없으면 사실대로 모른다고 말하고, 절대로 추측하거나 문서에 없는 내용을 만들어내지 마.`;

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const indexedEntries: IndexedEntry[] = knowledgeEntries.map((entry) => {
  const question = normalize(entry.question);
  const answer = normalize(entry.answer);
  const tags = normalize(entry.tags.join(' '));
  const category = normalize(entry.category);
  return {
    entry,
    normalizedQuestion: question,
    normalizedAnswer: answer,
    normalizedTags: tags,
    normalizedCategory: category,
    normalizedAll: normalize(`${entry.question} ${entry.answer} ${entry.category} ${entry.tags.join(' ')}}`),
  };
});

const scoreEntry = (tokens: string[], entry: IndexedEntry) => {
  if (tokens.length === 0) {
    return 0;
  }

  let score = 0;
  let matchedTokenCount = 0;

  const normalizedQuery = tokens.join(' ');
  if (normalizedQuery.length > 0 && entry.normalizedQuestion.includes(normalizedQuery)) {
    score += 12;
  }
  if (normalizedQuery.length > 0 && entry.normalizedAnswer.includes(normalizedQuery)) {
    score += 8;
  }

  tokens.forEach((token) => {
    if (!token) return;
    if (entry.normalizedQuestion.includes(token)) {
      score += 6;
      matchedTokenCount += 1;
    }
    if (entry.normalizedAnswer.includes(token)) {
      score += 4;
      matchedTokenCount += 1;
    }
    if (entry.normalizedTags.includes(token)) {
      score += 3;
    }
    if (entry.normalizedCategory.includes(token)) {
      score += 2;
    }
    if (entry.normalizedAll.includes(token)) {
      score += 1;
    }
  });

  score += matchedTokenCount;

  return score;
};

const selectRelevantEntries = (question: string, limit = 4): KnowledgeEntry[] => {
  const normalizedQuestion = normalize(question);
  if (!normalizedQuestion) {
    return knowledgeEntries.slice(0, limit);
  }

  const tokens = normalizedQuestion.split(' ').filter(Boolean);
  if (tokens.length === 0) {
    return knowledgeEntries.slice(0, limit);
  }

  const scored = indexedEntries.map((indexed) => ({
    entry: indexed.entry,
    score: scoreEntry(tokens, indexed),
  }));

  const nonZero = scored.filter((item) => item.score > 0);
  const sorted = (nonZero.length > 0 ? nonZero : scored).sort((a, b) => b.score - a.score);

  return sorted.slice(0, limit).map((item) => item.entry);
};

const buildKnowledgeContext = (entries: KnowledgeEntry[]) => {
  if (entries.length === 0) {
    return '관련 문서를 찾지 못했습니다. 제공된 문서 내 근거가 없다면 솔직하게 모른다고 답변하세요.';
  }

  return entries
    .map((entry, index) => {
      return `문서 ${index + 1}: [카테고리] ${entry.category}\n[질문] ${entry.question}\n[답변] ${entry.answer}`;
    })
    .join('\n\n');
};

const buildConversationSummary = (history: ChatTurn[]) => {
  if (history.length === 0) {
    return '이전 대화 없음.';
  }

  return history
    .map((turn) => `${turn.role === 'user' ? '사용자' : 'AI'}: ${turn.content}`)
    .join('\n');
};

const MAX_HISTORY_TURNS = 6;

export const requestChatAnswer = async ({ question, history }: ChatRequestPayload): Promise<ChatResponsePayload> => {
  const relevantEntries = selectRelevantEntries(question);
  const knowledgeContext = buildKnowledgeContext(relevantEntries);
  const recentHistory = history.slice(-MAX_HISTORY_TURNS);
  const conversationSummary = buildConversationSummary(recentHistory);

  const message = [
    `이전 대화 요약:\n${conversationSummary}`,
    `학교 공식 문서 발췌:\n${knowledgeContext}`,
    '답변 지침:\n- 반드시 위 문서 발췌를 근거로만 답변하세요.\n- 문서에 없는 내용은 "제공된 자료에서 관련 정보를 찾지 못했습니다."라고 답하세요.\n- 친절하고 이해하기 쉽게 한국어로 작성하세요.\n- 핵심 정보를 간결하게 정리하고, 필요하면 목록으로 제시하세요.',
    `사용자 질문:\n${question}`,
  ].join('\n\n');

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      system: SYSTEM_PROMPT,
      message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { reply?: string };

  if (!data.reply) {
    throw new Error('API 응답에 reply 필드가 없습니다.');
  }
  return {
    reply: data.reply.trim()
  };
};

export default requestChatAnswer;
