import { ReactNode, useMemo, useState } from 'react';
import { Box, Chip, Collapse, Divider, Fade, Stack, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FolderSpecialRoundedIcon from '@mui/icons-material/FolderSpecialRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import GlassCard from '../components/GlassCard';
import BottomSearchBar from '../components/BottomSearchBar';
import knowledgeBase from '../data/knowledgeBase';

const iconMap: Record<string, ReactNode> = {
  admissions: <QuizRoundedIcon fontSize="inherit" />,
  academics: <SchoolRoundedIcon fontSize="inherit" />,
  'student-life': <FolderSpecialRoundedIcon fontSize="inherit" />,
  'ace-program': <AutoAwesomeRoundedIcon fontSize="inherit" />,
};

const ExplorePage = () => {
  const [expandedCategory, setExpandedCategory] = useState<string>('admissions');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string>('');

  const filteredCategories = knowledgeBase.map((category) => {
    const matchesSearch = (text: string) =>
      text.toLowerCase().includes(searchTerm.trim().toLowerCase());

    const filteredItems = category.items.filter((item) => {
      const matchesTag = activeTag ? item.tags.includes(activeTag) : true;
      const matchesQuery = searchTerm
        ? matchesSearch(item.question) || matchesSearch(item.answer) || matchesSearch(category.title)
        : true;
      return matchesTag && matchesQuery;
    });

    return { ...category, items: filteredItems };
  });

  const tagSet = useMemo(() => {
    const tags = new Set<string>();
    knowledgeBase.forEach((category) => category.items.forEach((item) => item.tags.forEach((tag) => tags.add(tag))));
    return Array.from(tags);
  }, []);

  return (
    <Stack spacing={4} sx={{ pb: 16 }}>
      <GlassCard>
        <Stack spacing={2}>
          <Typography variant="overline" sx={{ color: 'primary.light', letterSpacing: 3 }}>
            Explore
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            카테고리별 정보 탐색
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            판교고등학교가 제공한 공식 문서를 바탕으로 입학, 교육과정, 학생 생활, ACE 프로그램까지 한눈에 탐색할 수 있도록 구성했습니다. 필요한 정보를 빠르게 찾기 위해 아래의 태그 또는 검색창을 활용해보세요.
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
            <Chip
              label="전체"
              color={activeTag === '' ? 'primary' : 'default'}
              variant={activeTag === '' ? 'filled' : 'outlined'}
              onClick={() => setActiveTag('')}
            />
            {tagSet.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                color={activeTag === tag ? 'primary' : 'default'}
                variant={activeTag === tag ? 'filled' : 'outlined'}
                onClick={() => setActiveTag((prev) => (prev === tag ? '' : tag))}
              />
            ))}
          </Stack>
        </Stack>
      </GlassCard>

      {filteredCategories.map((category) => (
        <Fade in key={category.id}>
          <Box>
            <GlassCard>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setExpandedCategory((prev) => (prev === category.id ? '' : category.id))}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(103,80,164,0.25), rgba(72,52,124,0.4))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                      fontSize: 24,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                    }}
                  >
                    {iconMap[category.id] ?? <QuizRoundedIcon fontSize="inherit" />}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {category.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${category.items.length}건`}
                    variant="outlined"
                    sx={{ borderRadius: 999 }}
                  />
                  <ExpandMoreRoundedIcon
                    sx={{
                      transition: 'transform 0.3s ease',
                      transform: expandedCategory === category.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: 'primary.main',
                    }}
                  />
                </Stack>
                <Collapse in={expandedCategory === category.id} timeout="auto" unmountOnExit>
                  <Divider light sx={{ my: 1 }} />
                  <Stack spacing={2}>
                    {category.items.length === 0 && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        선택한 태그나 검색어에 해당하는 내용이 없습니다. 다른 키워드를 시도해 보세요.
                      </Typography>
                    )}
                    {category.items.map((item) => (
                      <Box
                        key={item.question}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.65)',
                          border: '1px solid rgba(255,255,255,0.35)',
                          boxShadow: '0 12px 24px rgba(103,80,164,0.12)',
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.question}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.6 }}>
                          {item.answer}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled' }}>
                          출처: {item.source} · 태그: {item.tags.join(', ')}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Collapse>
              </Stack>
            </GlassCard>
          </Box>
        </Fade>
      ))}

      <BottomSearchBar
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="검색어를 입력하거나 태그를 눌러 정보를 찾아보세요"
      />
    </Stack>
  );
};

export default ExplorePage;
