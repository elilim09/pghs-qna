#!/usr/bin/env python3
"""Extract structured Q&A data from the public documents."""
from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
DOCUMENTS_DIR = ROOT / 'public' / 'documents'

GENERAL_DOCS = [
    ('판교고등학교_QNA_HTML형식/Converted.html', '판교고등학교_QNA.pdf', '학교 현황 · 배정'),
    ('2026 맹모가 묻고 학교가 답하다(판교고등학교)_HTML형식/Converted.html', '2026 맹모가 묻고 학교가 답하다.pdf', '학교 현황 · 배정'),
]
ACE_DOC = ('판교고등학교_ACE프로그램_QNA_HTML형식/Converted.html', '판교고등학교_ACE프로그램_QNA.pdf', 'ACE 프로그램')

SECTION_LABELS = {
    '학교 현황 및 배정 관련': '학교 현황 · 배정',
    '학교의 교과 / 비교과 프로그램과 운영 및 관리': '교과 · 비교과 운영',
    '입시 관련': '입시 · 진학 전략',
}

TAG_LIST = [
    '입학·배정',
    '학생경험·문화',
    '학사운영',
    '학업·평가',
    '비교과·프로그램',
    '진학·상담',
    '생활지원',
    'ACE특화',
]

@dataclass
class Entry:
    category: str
    question: str
    answer: str
    sources: List[str]
    tags: List[str]
    raw_key: str
    order: int


def load_html(path: Path) -> List[str]:
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    return [line.strip() for line in soup.get_text().splitlines() if line.strip()]


def normalize_question(text: str) -> str:
    text = text.replace('\xa0', ' ')
    text = text.replace('궁 금', '궁금')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def normalize_answer(text: str) -> str:
    lines: List[str] = []
    current = ''
    for raw in text.split('\n'):
        line = raw.replace('\xa0', ' ').strip()
        if not line:
            continue
        line = line.replace('궁 금', '궁금')
        line = re.sub(r'\s+', ' ', line)
        bullet = False
        if re.match(r'^[◉•ü]', line):
            bullet = True
            line = line.lstrip('◉•ü').strip()
        elif re.match(r'^[lI]\s', line):
            bullet = True
            line = line[1:].strip()
        elif re.match(r'^-[\s\[]', line):
            bullet = True
            line = line[1:].strip()
        elif line.startswith('[') and current:
            # treat bracketed emphasis as new paragraph
            lines.append(current)
            current = ''
        if bullet:
            if current:
                lines.append(current)
            current = f"• {line}" if line else '•'
            continue
        if not current:
            current = line
        else:
            current = f"{current} {line}".strip()
    if current:
        lines.append(current)
    joined = '\n'.join(lines)
    return fix_spacing(joined)


def fix_spacing(text: str) -> str:
    particles = [
        '으로써',
        '으로서',
        '로써',
        '로서',
        '으로',
        '로',
        '를',
        '을',
        '이',
        '가',
        '은',
        '는',
        '와',
        '과',
        '도',
        '에',
        '에서',
        '에게',
        '께',
        '까지',
        '부터',
        '마다',
        '만',
        '처럼',
        '하며',
        '하고',
        '라도',
        '이라도',
        '밖에',
        '뿐',
        '조차',
        '마저',
    ]
    for particle in particles:
        text = re.sub(rf'([가-힣0-9])\s+(?={particle}(?=[^가-힣]|$))', r'\1', text)
    # 숫자와 단위 사이 공백 제거
    text = re.sub(r'([0-9])\s+(?=명|개|건|명\b|학기|학년|반|회|시|분|단위|%)', r'\1', text)
    # 줄바꿈 앞뒤 공백 정리
    text = re.sub(r'\s*\n\s*', '\n', text)
    return text


def parse_general(path: Path) -> Iterable[Dict[str, str]]:
    lines = load_html(path)
    entries: List[Dict[str, str]] = []
    section = '학교 현황 · 배정'
    question_parts: List[str] = []
    answer_parts: List[str] = []
    in_question = False
    for line in lines:
        if line.startswith('<') and line.endswith('>'):
            label = line.strip('<> ').strip()
            if label.startswith('분당맹모'):
                continue
            if question_parts:
                entries.append(
                    {
                        'section': SECTION_LABELS.get(section, section),
                        'question': ' '.join(question_parts).strip(),
                        'answer': '\n'.join(answer_parts).strip(),
                    }
                )
                question_parts, answer_parts = [], []
            section = label
            in_question = False
            continue
        m = re.match(r'^(\d+)\)\s*(.*)', line)
        if m:
            if question_parts:
                entries.append(
                    {
                        'section': SECTION_LABELS.get(section, section),
                        'question': ' '.join(question_parts).strip(),
                        'answer': '\n'.join(answer_parts).strip(),
                    }
                )
            question_parts = [m.group(2).strip()]
            answer_parts = []
            in_question = True
            continue
        if not question_parts:
            continue
        if in_question and not line.startswith('◉'):
            question_parts.append(line)
        else:
            in_question = False
            answer_parts.append(line)
    if question_parts:
        entries.append(
            {
                'section': SECTION_LABELS.get(section, section),
                'question': ' '.join(question_parts).strip(),
                'answer': '\n'.join(answer_parts).strip(),
            }
        )
    return entries


def parse_ace(path: Path) -> Iterable[Dict[str, str]]:
    lines = load_html(path)
    entries: List[Dict[str, str]] = []
    question_parts: List[str] = []
    answer_parts: List[str] = []
    in_question = False
    for line in lines:
        m = re.match(r'^([가-힣])\.\s*(.*)', line)
        if m:
            if question_parts:
                entries.append(
                    {
                        'section': 'ACE 프로그램',
                        'question': ' '.join(question_parts).strip(),
                        'answer': '\n'.join(answer_parts).strip(),
                    }
                )
            question_parts = [m.group(2).strip()]
            answer_parts = []
            in_question = True
            continue
        if not question_parts:
            continue
        if in_question and not (line.startswith('ü') or line.startswith('◉')):
            question_parts.append(line)
            continue
        in_question = False
        answer_parts.append(line)
    if question_parts:
        entries.append(
            {
                'section': 'ACE 프로그램',
                'question': ' '.join(question_parts).strip(),
                'answer': '\n'.join(answer_parts).strip(),
            }
        )
    return entries


def classify_tags(category: str, question: str, answer: str) -> List[str]:
    text = f"{question} {answer}".lower()
    tags = set()
    if category == '학교 현황 · 배정':
        tags.add('입학·배정')
    if '배정' in question or '모집' in question or '내신' in text or '출신중학교' in text:
        tags.add('입학·배정')
    if any(keyword in text for keyword in ['사제', '상담', '문화', '관계', '자치', '학생 주도']):
        tags.add('학생경험·문화')
    if any(keyword in text for keyword in ['시간표', '일과', '자습', '운영', '선택과목', '교육과정', '학점제', '관리', '교과']):
        tags.add('학사운영')
    if any(keyword in text for keyword in ['평가', '수능', '모의고사', '시험', '성취', '내신', '학습', '수행평가', '지필']):
        tags.add('학업·평가')
    if any(keyword in text for keyword in ['프로그램', '동아리', '탐구', '멘토링', '런포런', '아카데미', '캠프']):
        tags.add('비교과·프로그램')
    if any(keyword in text for keyword in ['진학', '입시', '수시', '정시', '면접', '논술', '합격', '전형']):
        tags.add('진학·상담')
    if any(keyword in text for keyword in ['급식', '석식', '시설', '휴대폰', '교복', '생활', '환경', '자습공간', '식사']):
        tags.add('생활지원')
    if category == 'ACE 프로그램' or 'ace' in text or 'pathfinder' in text:
        tags.add('ACE특화')
    if category == '교과 · 비교과 운영':
        tags.add('학사운영')
        tags.add('비교과·프로그램')
    if category == '입시 · 진학 전략':
        tags.add('진학·상담')
        tags.add('학업·평가')
    if not tags:
        tags.add('학사운영')
    return [tag for tag in TAG_LIST if tag in tags]


def build_entries() -> List[Entry]:
    combined: Dict[str, Entry] = {}
    order_counter = 0

    def add_entry(raw_entry: Dict[str, str], source: str):
        nonlocal order_counter
        question = normalize_question(raw_entry['question'])
        answer = normalize_answer(raw_entry['answer'])
        category = SECTION_LABELS.get(raw_entry['section'], raw_entry['section'])
        key = re.sub(r'[^0-9a-z가-힣]+', '', question.lower())
        if key in combined:
            entry = combined[key]
            entry.sources = sorted({*entry.sources, source})
            if len(answer) > len(entry.answer):
                entry.answer = answer
            entry.tags = classify_tags(entry.category, entry.question, entry.answer)
        else:
            tags = classify_tags(category, question, answer)
            combined[key] = Entry(
                category=category,
                question=question,
                answer=answer,
                sources=[source],
                tags=tags,
                raw_key=key,
                order=order_counter,
            )
            order_counter += 1

    for html_path, source_name, _ in GENERAL_DOCS:
        for entry in parse_general(DOCUMENTS_DIR / html_path):
            add_entry(entry, source_name)
    for entry in parse_ace(DOCUMENTS_DIR / ACE_DOC[0]):
        add_entry(entry, ACE_DOC[1])

    # Sort entries by category order then by insertion order.
    category_order = {
        '학교 현황 · 배정': 0,
        '교과 · 비교과 운영': 1,
        '입시 · 진학 전략': 2,
        'ACE 프로그램': 3,
    }
    entries = sorted(
        combined.values(),
        key=lambda e: (category_order.get(e.category, 99), e.order),
    )
    # Assign stable ids.
    seen_ids = set()
    result: List[Entry] = []
    for entry in entries:
        base = re.sub(r'[^0-9a-z가-힣]+', '-', entry.question.lower()).strip('-')
        if not base:
            base = hashlib.sha1(entry.question.encode('utf-8')).hexdigest()[:8]
        candidate = base
        index = 1
        while candidate in seen_ids:
            candidate = f"{base}-{index}"
            index += 1
        seen_ids.add(candidate)
        entry_id = candidate
        result.append(
            Entry(
                category=entry.category,
                question=entry.question,
                answer=entry.answer,
                sources=entry.sources,
                tags=entry.tags,
                raw_key=entry_id,
                order=entry.order,
            )
        )
    return result


def write_typescript(entries: List[Entry]) -> None:
    target = ROOT / 'src' / 'data' / 'knowledgeBase.ts'
    target.parent.mkdir(parents=True, exist_ok=True)
    records = [
        {
            'id': entry.raw_key,
            'category': entry.category,
            'question': entry.question,
            'answer': entry.answer,
            'sources': entry.sources,
            'tags': entry.tags,
        }
        for entry in entries
    ]
    data_json = json.dumps(records, ensure_ascii=False, indent=2)
    content = (
        "// ⚠️ 이 파일은 scripts/build_knowledge_base.py 스크립트로 생성되었습니다.\n"
        "// 문서를 갱신한 후에는 스크립트를 다시 실행해 주세요.\n\n"
        "export interface KnowledgeEntry {\n"
        "  id: string;\n"
        "  category: string;\n"
        "  question: string;\n"
        "  answer: string;\n"
        "  sources: string[];\n"
        "  tags: string[];\n"
        "}\n\n"
        f"const knowledgeEntries: KnowledgeEntry[] = {data_json};\n\n"
        "export default knowledgeEntries;\n"
    )
    target.write_text(content, encoding='utf-8')


def main() -> None:
    entries = build_entries()
    write_typescript(entries)


if __name__ == '__main__':
    main()
