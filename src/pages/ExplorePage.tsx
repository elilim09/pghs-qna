import { ChangeEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BottomSearchBar from '../components/BottomSearchBar';
import knowledgeBase from '../data/knowledgeBase';
import { useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../components/Layout';

const iconMap: Record<string, ReactNode> = {
  'school-overview': <QuizRoundedIcon fontSize="inherit" />,
  'learning-roadmap': <SchoolRoundedIcon fontSize="inherit" />,
  'ace-experience': <AutoAwesomeRoundedIcon fontSize="inherit" />,
};

const ExplorePage = () => {
  const { setFloatingInput } = useOutletContext<LayoutOutletContext>();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string>('');

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const floatingInput = useMemo(
    () => (
      <BottomSearchBar
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="검색어를 입력하거나 태그를 눌러 정보를 찾아보세요"
      />
    ),
    [handleSearchChange, searchTerm]
  );

  useEffect(() => {
    setFloatingInput(floatingInput);
    return () => setFloatingInput(null);
  }, [floatingInput, setFloatingInput]);

  const filteredCategories = knowledgeBase
    .map((category) => {
      const matchesSearch = (text: string) =>
        text.toLowerCase().includes(searchTerm.trim().toLowerCase());

      const filteredItems = category.items.filter((item) => {
        const matchesTag = activeTag ? item.tags.includes(activeTag) : true;
        const matchesQuery = searchTerm
          ? matchesSearch(item.question) || matchesSearch(item.answer) || item.highlights?.some(matchesSearch) || matchesSearch(category.title)
          : true;
        return matchesTag && matchesQuery;
      });

      return { ...category, items: filteredItems };
    })
    .filter((category) => category.items.length > 0);

  const tagSet = useMemo(() => {
    const tags = new Set<string>();
    knowledgeBase.forEach((category) => category.items.forEach((item) => item.tags.forEach((tag) => tags.add(tag))));
    return Array.from(tags);
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
              카테고리별 핵심 정보
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              검색창과 태그를 활용하면 원하는 정보를 바로 확인할 수 있습니다. 아래 주제들은 학교 공식 문서를 정밀 분석해 정리했습니다.
            </Typography>
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={1.2}>
            <Chip
              label="전체"
              color={activeTag === '' ? 'primary' : 'default'}
              variant={activeTag === '' ? 'filled' : 'outlined'}
              onClick={() => setActiveTag('')}
              sx={{ borderRadius: 12, fontWeight: 600 }}
            />
            {tagSet.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                color={activeTag === tag ? 'primary' : 'default'}
                variant={activeTag === tag ? 'filled' : 'outlined'}
                onClick={() => setActiveTag((prev) => (prev === tag ? '' : tag))}
                sx={{ borderRadius: 12, fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {filteredCategories.length === 0 ? (
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
          {filteredCategories.map((category) => (
            <Paper
              key={category.id}
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
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
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
                    }}
                  >
                    {iconMap[category.id] ?? <QuizRoundedIcon fontSize="inherit" />}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5">{category.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {category.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${category.items.length}건`}
                    size="small"
                    sx={{ borderRadius: 12, fontWeight: 600, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
                  />
                </Stack>
                <Divider />
                <Stack spacing={2.5}>
                  {category.items.map((item) => (
                    <Box
                      key={item.question}
                      sx={{
                        borderRadius: 2,
                        border: '1px solid rgba(148, 163, 184, 0.35)',
                        backgroundColor: 'rgba(248, 250, 252, 0.85)',
                        p: { xs: 2, sm: 2.5 },
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {item.question}
                      </Typography>
                      {item.highlights && item.highlights.length > 0 && (
                        <Stack component="ul" spacing={0.75} sx={{ mt: 1.25, pl: 2.5, color: 'text.secondary' }}>
                          {item.highlights.map((highlight) => (
                            <Typography key={highlight} component="li" variant="body2" sx={{ lineHeight: 1.6 }}>
                              {highlight}
                            </Typography>
                          ))}
                        </Stack>
                      )}
                      <Typography variant="body2" sx={{ mt: 1.25, whiteSpace: 'pre-line' }}>
                        {item.answer}
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                        {item.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ borderRadius: 10 }} />
                        ))}
                        <Chip label={item.source} size="small" color="default" sx={{ borderRadius: 10 }} />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default ExplorePage;
