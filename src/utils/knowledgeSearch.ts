import knowledgeEntries, { KnowledgeEntry } from '../data/knowledgeBase';

export interface SearchResult {
  entry: KnowledgeEntry;
  score: number;
  matchedTokens: string[];
}

const normalizeForSearch = (text: string): string =>
  text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u2022•▪◦]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (text: string): string[] => {
  const matches = text.match(/[\p{L}\p{N}]+/gu);
  return matches ? matches.map((token) => token) : [];
};

interface NormalizedEntry {
  entry: KnowledgeEntry;
  questionText: string;
  answerText: string;
  combinedText: string;
  questionTokens: Set<string>;
  answerTokens: Set<string>;
  tagTokens: Set<string>;
  categoryTokens: Set<string>;
}

const normalizedEntries: NormalizedEntry[] = knowledgeEntries.map((entry) => {
  const questionText = normalizeForSearch(entry.question);
  const answerText = normalizeForSearch(entry.answer);
  const tagsText = normalizeForSearch(entry.tags.join(' '));
  const categoryText = normalizeForSearch(entry.category);
  const combinedText = normalizeForSearch(
    `${entry.question}\n${entry.answer}\n${entry.category}\n${entry.tags.join(' ')}`,
  );

  return {
    entry,
    questionText,
    answerText,
    combinedText,
    questionTokens: new Set(tokenize(questionText)),
    answerTokens: new Set(tokenize(answerText)),
    tagTokens: new Set(tokenize(tagsText)),
    categoryTokens: new Set(tokenize(categoryText)),
  };
});

const isUsefulToken = (token: string) => token.length > 1 || /[0-9]/.test(token);

export const searchKnowledgeBase = (query: string, limit = 3): SearchResult[] => {
  const normalizedQuery = normalizeForSearch(query);
  const rawTokens = tokenize(normalizedQuery);
  const queryTokens = rawTokens.filter(isUsefulToken);

  if (!normalizedQuery || queryTokens.length === 0) {
    return [];
  }

  const results: SearchResult[] = [];

  normalizedEntries.forEach((entry) => {
    let score = 0;
    const matchedTokens: string[] = [];
    const seenTokens = new Set<string>();

    queryTokens.forEach((token) => {
      let matchedThisToken = false;

      if (entry.questionTokens.has(token)) {
        score += 7;
        matchedThisToken = true;
      }

      if (entry.answerTokens.has(token)) {
        score += 4;
        matchedThisToken = true;
      }

      if (entry.tagTokens.has(token) || entry.categoryTokens.has(token)) {
        score += 3;
        matchedThisToken = true;
      }

      if (!matchedThisToken && token.length > 1 && entry.combinedText.includes(token)) {
        score += 1;
        matchedThisToken = true;
      }

      if (matchedThisToken && !seenTokens.has(token)) {
        matchedTokens.push(token);
        seenTokens.add(token);
      }
    });

    if (normalizedQuery.length >= 10) {
      if (entry.combinedText.includes(normalizedQuery)) {
        score += 5;
      }

      if (entry.questionText.includes(normalizedQuery)) {
        score += 6;
      }
    }

    if (score > 0) {
      results.push({
        entry: entry.entry,
        score,
        matchedTokens,
      });
    }
  });

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.entry.question.length !== b.entry.question.length) {
      return a.entry.question.length - b.entry.question.length;
    }
    return a.entry.id.localeCompare(b.entry.id);
  });

  if (results.length === 0) {
    return [];
  }

  const topScore = results[0].score;
  const dynamicThreshold =
    topScore >= 18
      ? Math.floor(topScore * 0.55)
      : topScore >= 12
        ? Math.floor(topScore * 0.6)
        : topScore >= 8
          ? Math.floor(topScore * 0.65)
          : Math.max(4, topScore - 1);

  const filtered = results.filter((result, index) => index === 0 || result.score >= dynamicThreshold);

  return filtered.slice(0, limit);
};

export const getKnowledgeEntryCount = () => knowledgeEntries.length;
