import { ChangeEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BottomSearchBar from '../components/BottomSearchBar';
import KakaoAd from '../components/KakaoAd';
import knowledgeEntries from '../data/knowledgeBase';
import { useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';

/** ===== 카테고리별 아이콘 매핑 ===== */
const categoryIconMap: Record<string, ReactNode> = {
  '학교 현황 · 배정': <QuizRoundedIcon fontSize="inherit" />,
  '교과 · 비교과 운영': <SchoolRoundedIcon fontSize="inherit" />,
  '입시 · 진학 전략': <AutoAwesomeRoundedIcon fontSize="inherit" />,
  'ACE 프로그램': <AutoAwesomeRoundedIcon fontSize="inherit" />,
};

const TAG_ORDER = [
  '입학·배정',
  '학생경험·문화',
  '학사운영',
  '학업·평가',
  '비교과·프로그램',
  '진학·상담',
  '생활지원',
  'ACE특화',
];

const filterDocumentTags = (tags: string[]) => tags.filter((tag) => !tag.toLowerCase().includes('.pdf'));

/**
 * 플로팅 영역에 실제로 렌더링될 안전한 검색 입력 래퍼
 * - 내부 state로 value 관리 (부모에서 value를 내려주지 않음)
 * - 합성(IME) 이벤트 처리
 * - 변경 시 부모로 콜백만 올려줌 → 플로팅 재주입 없음
 */
function FloatingSearchInput({
  placeholder,
  onSearchChange,
}: {
  placeholder?: string;
  onSearchChange: (term: string) => void;
}) {
  const [value, setValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // 합성 중에는 값만 반영 (후처리 금지), 부모 콜백도 함께 올림
      const v = e.target.value;
      setValue(v);
      onSearchChange(v);
    },
    [onSearchChange],
  );

  // IME 합성 이벤트를 확실히 관리
  const compositionProps = {
    onCompositionStart: () => setIsComposing(true),
    onCompositionEnd: () => setIsComposing(false),
  };

  return (
    <BottomSearchBar
      value={value}
      onChange={handleChange}
      placeholder={placeholder ?? '검색어를 입력하거나 태그를 눌러 정보를 찾아보세요'}
      {...compositionProps}
    />
  );
}

const ExplorePage = () => {
  const { setFloatingInput } = useOutletContext<LayoutOutletContext>();

  // 부모는 검색어를 필터링에만 사용. (입력창 표시/관리 X)
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string>('');

  /** 플로팅 입력에서 올라오는 검색어 변경 콜백 */
  const handleSearchTermFromFloating = useCallback((term: string) => {
    // 합성 중간값도 그대로 반영 — 트림/후처리는 필터링 단계에서 안전하게 처리
    setSearchTerm(term);
  }, []);

  /** ⛳️ 핵심: 플로팅 입력을 마운트 시 1회만 주입 (props는 변하지 않는 것만) */
  useEffect(() => {
    setFloatingInput({
      component: FloatingSearchInput,
      props: {
        onSearchChange: handleSearchTermFromFloating,
        placeholder: '검색어를 입력하거나 태그를 눌러 정보를 찾아보세요',
      },
    });
    return () => {
      setFloatingInput(null);
    };
    // setFloatingInput만 의존. 콜백은 클로저로 안전하게 동작.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFloatingInput]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredEntries = useMemo(() => {
    return knowledgeEntries.filter((entry) => {
      const matchesTag = activeTag ? entry.tags.includes(activeTag) : true;
      if (!matchesTag) return false;
      if (!normalizedSearch) return true;

      const searchableText = [
        entry.question,
        entry.answer,
        entry.category,
        entry.sources.join(' '),
        entry.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return normalizedSearch
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => searchableText.includes(token));
    });
  }, [activeTag, normalizedSearch]);

  const tagOptions = useMemo(() => {
    const tagSet = new Set<string>();
    knowledgeEntries.forEach((entry) => entry.tags.forEach((tag) => tagSet.add(tag)));
    return TAG_ORDER.filter((tag) => tagSet.has(tag));
  }, []);

  return (
    <Stack spacing={3.5} sx={{ flex: 1, pb: 18 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(15, 23, 42, 0.04))',
          p: { xs: 3, sm: 4 },
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2, fontWeight: 700 }}>
              탐색
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>
              공식 문서 기반 통합 피드
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              검색과 태그를 조합해 학교 문서 전체를 빠르게 살펴보세요. 모든 답변은 공개 문서를 정밀 분석해 카테고리로 정리한 내용입니다.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridAutoFlow: 'column',
              gridTemplateRows: 'repeat(2, auto)',
              gap: 1.2,
              overflowX: 'auto',
              pr: 0.5,
              pb: 1,
              '&::-webkit-scrollbar': {
                height: 6,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(37, 99, 235, 0.35)',
                borderRadius: 999,
              },
            }}
          >
            <Chip
              label="전체"
              color={activeTag === '' ? 'primary' : 'default'}
              variant={activeTag === '' ? 'filled' : 'outlined'}
              onClick={() => setActiveTag('')}
              sx={{ borderRadius: 12, fontWeight: 600 }}
            />
            {tagOptions.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                color={activeTag === tag ? 'primary' : 'default'}
                variant={activeTag === tag ? 'filled' : 'outlined'}
                onClick={() => setActiveTag((prev) => (prev === tag ? '' : tag))}
                sx={{ borderRadius: 12, fontWeight: 600, whiteSpace: 'nowrap' }}
              />
            ))}
          </Box>
        </Stack>
      </Paper>
      <KakaoAd />
      {filteredEntries.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
            backgroundColor: 'rgba(148, 163, 184, 0.1)',
            p: { xs: 3, sm: 4 },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            검색 조건에 맞는 자료가 없습니다.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            다른 태그를 선택하거나 검색어를 줄여 다시 시도해 보세요. 모든 정보는 학교 공식 답변을 바탕으로 구성되어 있습니다.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {filteredEntries.map((entry) => {
            const visibleTags = filterDocumentTags(entry.tags);
            return (
              <Paper
                key={entry.id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: '#FFFFFF',
                  p: { xs: 3, sm: 4 },
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                }}
              >
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                        border: '1px solid rgba(37, 99, 235, 0.28)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        fontSize: 26,
                        flexShrink: 0,
                      }}
                    >
                    {categoryIconMap[entry.category] ?? <QuizRoundedIcon fontSize="inherit" />}
                  </Box>
                  <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1.5 }}>
                      {entry.category}
                    </Typography>
                    <Typography variant="h5" sx={{ wordBreak: 'keep-all' }}>
                      {entry.question}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                    {entry.answer}
                  </Typography>
                  {displayTags.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {displayTags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ borderRadius: 10 }} />
                      ))}
                    </Stack>
                  )}
                </Stack>
                <Divider />
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                  {entry.answer}
                </Typography>
                {visibleTags.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {visibleTags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ borderRadius: 10 }} />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          );
        })}
        </Stack>
      )}
    </Stack>
  );
};

export default ExplorePage;
