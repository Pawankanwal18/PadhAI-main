#!/usr/bin/env python3
import os
import re

root = os.getcwd()
allowed_exts = None  # process all files
renamed = []

for dirpath, dirs, files in os.walk(root):
    # skip virtual envs, git metadata
    if '.git' in dirpath or 'node_modules' in dirpath:
        continue
    for f in files:
        # skip this script
        if os.path.abspath(os.path.join(dirpath, f)) == os.path.abspath(__file__):
            continue
        if ' ' in f:
            old = os.path.join(dirpath, f)
            # replace spaces with hyphens, collapse multiple hyphens
            new_name = re.sub(r"[\s_]+", '-', f).strip('-')
            new_name = re.sub(r'-+', '-', new_name)
            new = os.path.join(dirpath, new_name)
            if os.path.abspath(old) == os.path.abspath(new):
                continue
            if os.path.exists(new):
                base, ext = os.path.splitext(new)
                i = 1
                candidate = f"{base}-{i}{ext}"
                while os.path.exists(candidate):
                    i += 1
                    candidate = f"{base}-{i}{ext}"
                new = candidate
            os.rename(old, new)
            renamed.append((old, new))
            print(f"Renamed: {old} -> {new}")

if not renamed:
    print("No files with spaces found to rename.")
