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
  sources: string[];
}

interface IndexedEntry {
  entry: KnowledgeEntry;
  normalizedQuestion: string;
  normalizedAnswer: string;
  normalizedTags: string;
  normalizedCategory: string;
  normalizedAll: string;
}

const sanitizeBaseUrl = (value: string | undefined | null) => {
  if (!value) {
    return '';
  }

  return value.trim().replace(/\/$/, '');
};

const DEFAULT_API_BASE_URL = '';
const apiBaseUrl = sanitizeBaseUrl(process.env.REACT_APP_API_BASE_URL ?? DEFAULT_API_BASE_URL);
const API_ENDPOINT = apiBaseUrl ? `${apiBaseUrl}/api/chat` : null;
const SHOULD_USE_REMOTE_API = Boolean(API_ENDPOINT);

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
  const sources = normalize(entry.sources.join(' '));
  return {
    entry,
    normalizedQuestion: question,
    normalizedAnswer: answer,
    normalizedTags: tags,
    normalizedCategory: category,
    normalizedAll: normalize(`${entry.question} ${entry.answer} ${entry.category} ${entry.tags.join(' ')} ${entry.sources.join(' ')}`),
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
      const sources = entry.sources.length > 0 ? entry.sources.join(', ') : '출처 정보 없음';
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

const uniqueSources = (entries: KnowledgeEntry[]) => {
  const seen = new Set<string>();
  entries.forEach((entry) => {
    entry.sources.forEach((source) => {
      if (source) {
        seen.add(source);
      }
    });
  });
  return Array.from(seen);
};

const summarizeAnswer = (answer: string) => {
  const trimmed = answer.trim();
  if (!trimmed) {
    return '';
  }

  const [firstLine] = trimmed.split('\n');
  return firstLine.trim();
};

const stripReferenceFooter = (text: string) => {
  const normalized = text.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const referenceIndex = lines.findIndex((line) => line.trim().startsWith('참고 문서'));

  if (referenceIndex === -1) {
    return normalized.trim();
  }

  return lines
    .slice(0, referenceIndex)
    .join('\n')
    .trim();
};

const buildLocalReply = (question: string, entries: KnowledgeEntry[]): ChatResponsePayload => {
  if (entries.length === 0) {
    return {
      reply:
        '제공된 공식 문서에서 관련 정보를 찾지 못했습니다.\n학교 행정실이나 입학 담당 선생님께 직접 문의해 주세요.',
      sources: [],
    };
  }

  const [primary, ...others] = entries;
  const sections: string[] = [];

  sections.push(
    `질문 "${question}"과 가장 가까운 공식 답변입니다:\n${primary.answer.trim()}`,
  );

  if (others.length > 0) {
    const bullets = others.map((entry, index) => {
      const summary = summarizeAnswer(entry.answer);
      return `${index + 1}. ${entry.question}${summary ? ` — ${summary}` : ''}`;
    });

    sections.push(
      ['추가로 참고할 수 있는 관련 문항입니다:'].concat(bullets).join('\n'),
    );
  }

  sections.push('위 내용은 학교가 공개한 공식 Q&A 자료를 정리한 결과입니다.');

  return {
    reply: stripReferenceFooter(sections.join('\n\n')),
    sources: [],
  };
};

export const requestChatAnswer = async ({ question, history }: ChatRequestPayload): Promise<ChatResponsePayload> => {
  const relevantEntries = selectRelevantEntries(question);
  const knowledgeContext = buildKnowledgeContext(relevantEntries);
  const recentHistory = history.slice(-MAX_HISTORY_TURNS);
  const conversationSummary = buildConversationSummary(recentHistory);

  if (!SHOULD_USE_REMOTE_API || !API_ENDPOINT) {
    return buildLocalReply(question, relevantEntries);
  }

  const message = [
    `이전 대화 요약:\n${conversationSummary}`,
    `학교 공식 문서 발췌:\n${knowledgeContext}`,
    '답변 지침:\n- 반드시 위 문서 발췌를 근거로만 답변하세요.\n- 문서에 없는 내용은 "제공된 자료에서 관련 정보를 찾지 못했습니다."라고 답하세요.\n- 친절하고 이해하기 쉽게 한국어로 작성하세요.\n- 핵심 정보를 간결하게 정리하고, 필요하면 목록으로 제시하세요.',
    `사용자 질문:\n${question}`,
  ].join('\n\n');

  const endpoint = API_ENDPOINT!;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    const rawBody = await response.text();

    if (!contentType.includes('application/json')) {
      throw new Error(`API 응답이 JSON이 아닙니다: ${rawBody}`);
    }

    let data: { reply?: string };
    try {
      data = JSON.parse(rawBody) as { reply?: string };
    } catch (error) {
      throw new Error(`API 응답 JSON 파싱 실패: ${(error as Error).message} | 원본 응답: ${rawBody}`);
    }

    if (!data.reply) {
      throw new Error('API 응답에 reply 필드가 없습니다.');
    }

    return {
      reply: stripReferenceFooter(data.reply),
      sources: [],   // 아예 비워버리기
    };
  } catch (error) {
    console.warn('AI API 호출에 실패하여 로컬 지식 베이스로 응답을 생성합니다.', error);
    return buildLocalReply(question, relevantEntries);
  }
};

export default requestChatAnswer;
