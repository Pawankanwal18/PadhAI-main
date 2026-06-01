#!/usr/bin/env python3
import os
import re
from pypdf import PdfReader, PdfWriter

root = os.getcwd()


def extract_year_from_filename(filename: str) -> str:
    m = re.search(r'(\d+)(st|nd|rd|th)?\s*year', filename, flags=re.I)
    if m:
        num = m.group(1)
        suffix = m.group(2) or ''
        return f"{num}{suffix.lower()} Year"
    m2 = re.search(r'year\s*(\d{4})', filename, flags=re.I)
    if m2:
        return m2.group(1)
    return 'Unknown'

pdfs_by_year = {}
for dirpath, dirs, files in os.walk(root):
    # skip .git
    if '.git' in dirpath:
        continue
    for f in files:
        if f.lower().endswith('.pdf'):
            year = extract_year_from_filename(f)
            pdfs_by_year.setdefault(year, []).append(os.path.join(dirpath, f))

out_dir = os.path.join(root, 'merged-pdfs')
os.makedirs(out_dir, exist_ok=True)

for year, files in pdfs_by_year.items():
    if not files:
        continue
    files = sorted(files)
    if len(files) == 1:
        print(f"Only one PDF for {year}: {files[0]} (skipping merge)")
        continue
    writer = PdfWriter()
    for p in files:
        try:
            reader = PdfReader(p)
            for pg in reader.pages:
                writer.add_page(pg)
        except Exception as e:
            print(f"Failed to append {p}: {e}")
    out_path = os.path.join(out_dir, f"{year}-Combined.pdf")
    try:
        with open(out_path, 'wb') as fout:
            writer.write(fout)
        print(f"Created {out_path} with {len(files)} files")
    except Exception as e:
        print(f"Failed to write merged PDF for {year}: {e}")
