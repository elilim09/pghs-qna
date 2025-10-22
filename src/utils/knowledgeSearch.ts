import knowledgeEntries, { KnowledgeEntry } from '../data/knowledgeBase';

interface PreparedEntry {
  entry: KnowledgeEntry;
  normalizedQuestion: string;
  normalizedAnswer: string;
  questionTokens: Set<string>;
  answerTokens: Set<string>;
  tagTokens: Set<string>;
  allTokens: Set<string>;
}

interface RankedEntry {
  entry: KnowledgeEntry;
  score: number;
  matchedTokens: string[];
}

export interface KnowledgeAnswer {
  primary: RankedEntry;
  alternatives: RankedEntry[];
}

const STOP_WORDS = new Set([
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '에',
  '의',
  '으로',
  '로',
  '과',
  '와',
  '및',
  '도',
  '부터',
  '까지',
  '대한',
  '관련',
  '어떻게',
  '무엇',
  '무슨',
  '뭐',
  '어떤',
  '있나요',
  '인가요',
  '알고',
  '싶어요',
  '궁금',
  '하세요',
  '해주세요',
  'please',
  'tell',
  'about',
  'what',
  'how',
  'the',
  'a',
  'an',
  'is',
  'are',
  'do',
  'does',
  'can',
  'could',
  'would',
]);

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[\u3000\s]+/g, ' ')
    .trim();

const tokenize = (text: string) =>
  normalizeText(text)
    .split(/[^0-9a-zA-Z가-힣]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

const createTokenSet = (values: string[]) => {
  const tokens = values.flatMap((value) => tokenize(value));
  return new Set(tokens);
};

const preparedEntries: PreparedEntry[] = knowledgeEntries.map((entry) => {
  const normalizedQuestion = normalizeText(entry.question);
  const normalizedAnswer = normalizeText(entry.answer);
  const questionTokens = createTokenSet([entry.question]);
  const answerTokens = createTokenSet([entry.answer]);
  const tagTokens = createTokenSet(entry.tags);
  const categoryTokens = createTokenSet([entry.category]);
  const allTokens = new Set<string>([
    ...Array.from(questionTokens),
    ...Array.from(answerTokens),
    ...Array.from(tagTokens),
    ...Array.from(categoryTokens),
  ]);

  return {
    entry,
    normalizedQuestion,
    normalizedAnswer,
    questionTokens,
    answerTokens,
    tagTokens,
    allTokens,
  };
});

const MIN_CONFIDENCE_SCORE = 6;
const SCORE_GAP_FOR_ALTERNATIVE = 3;

const computeScore = (queryTokens: string[], normalizedQuery: string, prepared: PreparedEntry) => {
  let score = 0;
  const matchedTokens = new Set<string>();

  if (!normalizedQuery) {
    return { score, matchedTokens };
  }

  const { normalizedQuestion, normalizedAnswer, questionTokens, answerTokens, tagTokens, allTokens, entry } =
    prepared;

  const normalizedCategory = normalizeText(entry.category);

  if (normalizedQuestion === normalizedQuery) {
    score += 24;
  }

  if (normalizedQuestion.includes(normalizedQuery) && normalizedQuery.length >= 6) {
    score += 12;
  }

  if (normalizedCategory.includes(normalizedQuery)) {
    score += 4;
  }

  queryTokens.forEach((token) => {
    if (STOP_WORDS.has(token)) {
      return;
    }

    if (tagTokens.has(token)) {
      score += 8;
      matchedTokens.add(token);
    }

    if (questionTokens.has(token)) {
      score += 6;
      matchedTokens.add(token);
    } else if (normalizedQuestion.includes(token)) {
      score += 4;
      matchedTokens.add(token);
    }

    if (answerTokens.has(token)) {
      score += 3;
      matchedTokens.add(token);
    } else if (normalizedAnswer.includes(token)) {
      score += 1;
      matchedTokens.add(token);
    }

    if (normalizedCategory.includes(token)) {
      score += 2;
      matchedTokens.add(token);
    }

    if (allTokens.has(`${token}고`)) {
      // 간단한 어간 매칭 (예: "입학" vs "입학고" 같은 변형) 대비
      score += 1;
    }
  });

  if (matchedTokens.size >= 4) {
    score += 6;
  } else if (matchedTokens.size >= 3) {
    score += 4;
  } else if (matchedTokens.size >= 2) {
    score += 2;
  }

  return { score, matchedTokens };
};

export const findKnowledgeAnswer = (query: string): KnowledgeAnswer | null => {
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenize(query).filter((token) => !STOP_WORDS.has(token));

  if (queryTokens.length === 0 && normalizedQuery.length === 0) {
    return null;
  }

  const ranked = preparedEntries
    .map((prepared) => {
      const { score, matchedTokens } = computeScore(queryTokens, normalizedQuery, prepared);
      return {
        entry: prepared.entry,
        score,
        matchedTokens: Array.from(matchedTokens),
      } as RankedEntry;
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return null;
  }

  const [top, second] = ranked;

  if (!top || top.score < MIN_CONFIDENCE_SCORE) {
    return null;
  }

  if (second && top.score - second.score <= 1 && second.score < MIN_CONFIDENCE_SCORE) {
    return null;
  }

  const alternatives = ranked
    .slice(1)
    .filter((item) => item.score >= MIN_CONFIDENCE_SCORE - 1 && top.score - item.score <= SCORE_GAP_FOR_ALTERNATIVE)
    .slice(0, 2);

  return {
    primary: top,
    alternatives,
  };
};

export const buildKnowledgeBasedReply = (query: string) => {
  const answer = findKnowledgeAnswer(query);

  if (!answer) {
    return [
      '죄송합니다. 제공된 학교 공식 자료에서 해당 질문과 일치하는 정보를 찾지 못했습니다.',
      '질문을 조금 더 구체적으로 작성하거나 다른 주제를 문의해 주세요.',
    ].join('\n');
  }

  const { primary, alternatives } = answer;
  const lines: string[] = [];

  lines.push(`"${primary.entry.question}"에 대한 답변입니다.`);
  lines.push(primary.entry.answer.trim());
  lines.push('');
  lines.push(`출처: ${primary.entry.sources.join(', ')}`);

  if (alternatives.length > 0) {
    lines.push('');
    lines.push('다음 질문도 함께 참고해 보세요:');
    alternatives.forEach((item) => {
      lines.push(`• ${item.entry.question}`);
    });
  }

  return lines.join('\n');
};

