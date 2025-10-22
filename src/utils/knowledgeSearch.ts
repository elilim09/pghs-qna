import knowledgeEntries, { KnowledgeEntry } from '../data/knowledgeBase';

type PreparedEntry = KnowledgeEntry & {
  searchableText: string;
  searchableTokens: Set<string>;
};

const normalizeText = (text: string) =>
  text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (text: string) => {
  if (!text) return [] as string[];
  const normalized = normalizeText(text);
  if (!normalized) return [] as string[];
  return Array.from(
    new Set(
      normalized
        .split(' ')
        .map((token) => token.trim())
        .filter(Boolean),
    ),
  );
};

const preparedEntries: PreparedEntry[] = knowledgeEntries.map((entry) => {
  const searchableText = [
    entry.category,
    entry.question,
    entry.answer,
    entry.tags.join(' '),
    entry.sources.join(' '),
  ]
    .filter(Boolean)
    .join(' ');

  return {
    ...entry,
    searchableText,
    searchableTokens: new Set(tokenize(searchableText)),
  };
});

export interface KnowledgeSearchResult {
  entry: KnowledgeEntry;
  score: number;
  matchedTokens: string[];
}

const WEIGHTS = {
  exactQuestionMatch: 5,
  partialQuestionMatch: 3,
  tagMatch: 2,
  tokenMatch: 1,
};

const MIN_SCORE_THRESHOLD = 4;

export const searchKnowledgeBase = (query: string, limit = 3): KnowledgeSearchResult[] => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const queryTokens = tokenize(normalizedQuery);
  if (queryTokens.length === 0) {
    return [];
  }

  const results = preparedEntries
    .map((entry) => {
      let score = 0;
      const matchedTokens: string[] = [];

      if (normalizeText(entry.question) === normalizedQuery) {
        score += WEIGHTS.exactQuestionMatch;
      }

      if (
        score === 0 &&
        (normalizeText(entry.question).includes(normalizedQuery) ||
          normalizedQuery.includes(normalizeText(entry.question)))
      ) {
        score += WEIGHTS.partialQuestionMatch;
      }

      const searchableTags = [...entry.tags, entry.category].map((tag) => normalizeText(tag));
      searchableTags.forEach((tag) => {
        if (tag && (normalizedQuery.includes(tag) || tag.includes(normalizedQuery))) {
          score += WEIGHTS.tagMatch;
        }
      });

      queryTokens.forEach((token) => {
        if (entry.searchableTokens.has(token)) {
          matchedTokens.push(token);
          score += WEIGHTS.tokenMatch;
        }
      });

      return {
        entry,
        score,
        matchedTokens,
      };
    })
    .filter((result) => result.score >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
};

export const buildAnswerFromResult = (result: KnowledgeSearchResult): string => {
  const sourceLabel = result.entry.sources.join(', ');
  const citation = sourceLabel ? `\n\n출처: ${sourceLabel}` : '';
  return `${result.entry.answer}${citation}`;
};
