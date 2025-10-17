import { ReactNode, useMemo, useState } from 'react';
import { Box, Chip, Collapse, Fade, Stack, Typography } from '@mui/material';
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
    <Stack spacing={3} sx={{ flex: 1, pb: 20 }}>
      <GlassCard>
        <Stack spacing={1.5}>
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2 }}>
            탐색
          </Typography>
          <Typography variant="h4">카테고리별 핵심 정보</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            관심 있는 항목을 펼치고, 태그 또는 검색 기능을 활용하여 필요한 내용을 빠르게 찾아보세요.
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 1 }}>
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
                      borderRadius: 16,
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      border: '1px solid rgba(37, 99, 235, 0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                      fontSize: 24,
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
                    sx={{ borderRadius: 12, fontWeight: 600, backgroundColor: 'rgba(37, 99, 235, 0.08)' }}
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
                  <Stack spacing={2} sx={{ pt: 1 }}>
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
                          borderRadius: 2,
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 6px 16px rgba(15, 23, 42, 0.05)',
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.question}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {item.answer}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
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
      <Box sx={{ height: 160 }} />
    </Stack>
  );
};

export default ExplorePage;
