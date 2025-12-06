from pathlib import Path
lines = Path('frontend/src/screens/ProfileScreen.js').read_text(encoding='utf-8').splitlines()
for i,line in enumerate(lines,1):
    if 'return (' in line:
        print('return at',i)
    if line.strip() == ');' and i>400:
        print('closing',i,line)
