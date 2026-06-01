#!/usr/bin/env python3
import sys
import os
import re
import hashlib
import argparse

try:
    from pdfminer.high_level import extract_text
except Exception as e:
    print("pdfminer.six is required. Install with: pip install pdfminer.six", file=sys.stderr)
    raise

import pandas as pd


def extract_text_from_pdf(path):
    try:
        text = extract_text(path)
    except Exception as e:
        print("Error extracting text:", e, file=sys.stderr)
        return ""
    return text


def find_headings(lines):
    headings = {}
    for idx, line in enumerate(lines):
        s = line.strip()
        if not s:
            continue
        if re.match(r'^(UNIT|MODULE|CHAPTER|TOPIC|SECTION)\b', s, flags=re.I):
            headings[idx] = s
        elif s.isupper() and len(s) > 2 and len(s.split()) <= 10:
            headings[idx] = s
    return headings


def find_questions(lines):
    questions = []
    enumerator_re = re.compile(r'^\s*(\d{1,3}|[A-Z])[\.|\)\-]\s*(.*)')
    question_words = re.compile(r'^(Explain|Define|Discuss|What|Why|How|State|Describe|Compare|Differentiate|Give|List)\b', flags=re.I)
    i = 0
    while i < len(lines):
        line = lines[i]
        m = enumerator_re.match(line)
        if m:
            q_lines = [m.group(2).strip()]
            j = i + 1
            while j < len(lines):
                if enumerator_re.match(lines[j]) or lines[j].strip() == '':
                    break
                q_lines.append(lines[j].strip())
                j += 1
            q_text = ' '.join(q_lines).strip()
            questions.append((i, q_text))
            i = j
            continue
        if '?' in line:
            sentences = re.split(r'(?<=[?])\s+', line)
            for s in sentences:
                s = s.strip()
                if s:
                    questions.append((i, s))
            i += 1
            continue
        if question_words.match(line):
            q_lines = [line.strip()]
            j = i + 1
            while j < len(lines) and lines[j].strip() != '' and not re.match(r'^\s*\d', lines[j]):
                q_lines.append(lines[j].strip())
                j += 1
            q_text = ' '.join(q_lines).strip()
            questions.append((i, q_text))
            i = j
            continue
        i += 1
    return questions


def normalize_q(text):
    text = text.lower()
    text = re.sub(r'\([^)]*\)', '', text)
    text = re.sub(r'[\d\.|\)\(-]+', ' ', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def nearest_heading(headings, q_idx):
    keys = [k for k in headings.keys() if k <= q_idx]
    if not keys:
        return None
    k = max(keys)
    return headings[k]


def extract_year_from_filename(filename: str) -> str:
    # Try patterns like '3rd year', '1st year' or 'year 2023'
    m = re.search(r'(\d+)(st|nd|rd|th)?[-_\s]*year', filename, flags=re.I)
    if m:
        num = m.group(1)
        suffix = m.group(2) or ''
        return f"{num}{suffix.lower()} Year"
    m2 = re.search(r'year[-_\s]*(\d{4})', filename, flags=re.I)
    if m2:
        return m2.group(1)
    return 'Unknown'


def extract_questions_from_pdf(path, out_csv):
    rows = []
    paths = []
    if os.path.isdir(path):
        for dirpath, dirs, files in os.walk(path):
            for f in files:
                if f.lower().endswith('.pdf'):
                    paths.append(os.path.join(dirpath, f))
    else:
        paths = [path]

    for p in paths:
        text = extract_text_from_pdf(p)
        if not text:
            print(f"No text extracted from {p}", file=sys.stderr)
            continue
        raw_lines = [l for l in text.splitlines()]
        headings = find_headings(raw_lines)
        candidates = find_questions(raw_lines)
        year = extract_year_from_filename(os.path.basename(p))
        for idx, q in candidates:
            norm = normalize_q(q)
            if not norm:
                continue
            qid = hashlib.sha1(norm.encode('utf-8')).hexdigest()[:12]
            topic = nearest_heading(headings, idx) or "Unknown"
            rows.append({
                "question_id": qid,
                "question_text": q,
                "normalized_question": norm,
                "topic": topic,
                "source_file": os.path.basename(p),
                "year": year,
                "line_index": idx
            })

    if not rows:
        print("No questions found in provided path(s).", file=sys.stderr)
        return

    df = pd.DataFrame(rows)
    # Group by year so counts are per-year (do not combine across years)
    agg = df.groupby(['year','normalized_question','question_text','topic','source_file']).agg(
        occurrence_count=('question_id','count'),
        sample_question_id=('question_id','first'),
        first_line=('line_index','min')
    ).reset_index().sort_values(['year','occurrence_count'], ascending=[False,False])

    out_cols = ['year','sample_question_id','normalized_question','question_text','topic','source_file','occurrence_count','first_line']
    agg = agg[out_cols]
    os.makedirs(os.path.dirname(out_csv) or '.', exist_ok=True)
    agg.to_csv(out_csv, index=False, encoding='utf-8')
    print(f"Wrote {len(agg)} aggregated questions to {out_csv}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Extract questions and topics from PDFs into a per-year CSV")
    parser.add_argument('pdf_or_dir', help='Path to a PDF file or a directory containing PDFs')
    parser.add_argument('--out', default='data/training-dataset.csv', help='Output CSV path')
    args = parser.parse_args()
    extract_questions_from_pdf(args.pdf_or_dir, args.out)
