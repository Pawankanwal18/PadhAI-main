import os
root = r'c:/Users/niran/Desktop/HELPINGHAND'
bad = []
for dirpath, dirs, files in os.walk(root):
    for f in files:
        if ' ' in f:
            bad.append(os.path.join(dirpath, f))
if bad:
    for p in bad:
        print(p)
else:
    print('No filenames with spaces found.')
