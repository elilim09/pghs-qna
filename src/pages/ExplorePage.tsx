import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Box, ButtonBase, Chip, Fade, Stack, Typography } from '@mui/material';
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('admissions');
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

  const activeCategory = filteredCategories.find((category) => category.id === selectedCategoryId);

  useEffect(() => {
    if (!filteredCategories.some((category) => category.id === selectedCategoryId)) {
      const fallbackCategory = filteredCategories.find((category) => category.items.length > 0) ?? filteredCategories[0];
      if (fallbackCategory) {
        setSelectedCategoryId(fallbackCategory.id);
        return;
      }
    }

    const activeCategoryHasResults = activeCategory && activeCategory.items.length > 0;
    if (!activeCategoryHasResults) {
      const fallbackCategory = filteredCategories.find((category) => category.items.length > 0 && category.id !== selectedCategoryId);
      if (fallbackCategory) {
        setSelectedCategoryId(fallbackCategory.id);
      }
    }
  }, [filteredCategories, selectedCategoryId, activeCategory]);

  return (
    <Stack spacing={3} sx={{ flex: 1, pb: 28 }}>
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
              sx={{ borderRadius: 999, fontWeight: 600 }}
            />
            {tagSet.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                color={activeTag === tag ? 'primary' : 'default'}
                variant={activeTag === tag ? 'filled' : 'outlined'}
                onClick={() => setActiveTag((prev) => (prev === tag ? '' : tag))}
                sx={{ borderRadius: 999, fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Stack>
      </GlassCard>

      <Box sx={{ mx: -2 }}>
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            px: 2,
            pb: 1,
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {filteredCategories.map((category) => {
            const isActive = category.id === selectedCategoryId;
            return (
              <ButtonBase
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                sx={{
                  textAlign: 'left',
                  borderRadius: 24,
                  minWidth: 220,
                  px: 2,
                  py: 2,
                  backgroundColor: isActive ? 'primary.main' : '#FFFFFF',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  boxShadow: isActive ? '0 18px 36px rgba(37, 99, 235, 0.35)' : '0 8px 18px rgba(15, 23, 42, 0.08)',
                  border: '1px solid',
                  borderColor: isActive ? 'primary.main' : '#E2E8F0',
                  alignItems: 'stretch',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  ':hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Stack spacing={1.5} alignItems="flex-start" sx={{ width: '100%' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 18,
                      backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'rgba(37, 99, 235, 0.08)',
                      border: '1px solid',
                      borderColor: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(37, 99, 235, 0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? 'primary.contrastText' : 'primary.main',
                      fontSize: 24,
                    }}
                  >
                    {iconMap[category.id] ?? <QuizRoundedIcon fontSize="inherit" />}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {category.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.8,
                        fontWeight: 500,
                      }}
                    >
                      {category.items.length}개의 답변
                    </Typography>
                  </Box>
                </Stack>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      {activeCategory && (
        <Fade in>
          <GlassCard>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2 }}>
                  {activeCategory.title}
                </Typography>
                <Typography variant="h5">{activeCategory.description}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  태그와 검색어를 조합하여 원하는 정보를 빠르게 찾아보세요.
                </Typography>
              </Stack>
              <Stack spacing={2}>
                {activeCategory.items.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    선택한 태그나 검색어에 해당하는 내용이 없습니다. 다른 키워드를 시도해 보세요.
                  </Typography>
                )}
                {activeCategory.items.map((item) => (
                  <Box
                    key={item.question}
                    sx={{
                      p: 2,
                      borderRadius: 18,
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
            </Stack>
          </GlassCard>
        </Fade>
      )}

      <BottomSearchBar
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="검색어를 입력하거나 태그를 눌러 정보를 찾아보세요"
      />
      <Box sx={{ height: 120 }} />
    </Stack>
  );
};

export default ExplorePage;
