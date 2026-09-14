# Hero background videos

The About and Careers pages are wired up to play a looping background
video behind the page hero (`.page-hero-video` in `styles.css`). No
footage is checked into the repo yet — until a file is added, visitors
just see the poster image (`assets/images/home-background.jpg`), so the
site still looks complete.

Drop your clips in here with these exact filenames and they'll start
playing automatically, no code changes needed:

- `about-hero.mp4` — used on `about.html`
- `careers-hero.mp4` — used on `careers.html`

## Recommended specs

- Format: H.264 MP4 (widest browser support)
- Resolution: 1920x1080 is plenty; it's shown behind a dark overlay and
  text, so detail is not critical
- Length: 10-20s, loops seamlessly (no audio needed — it always plays
  muted)
- File size: keep it under ~6-8MB so the hero loads quickly. Trim/compress
  with `ffmpeg`, e.g.:
  `ffmpeg -i input.mov -vf scale=1920:-2 -an -c:v libx264 -crf 28 -preset slow -movflags +faststart about-hero.mp4`
- Content ideas: clean room / fab floor, chip wafer close-ups, PCB or die
  macro shots, engineers at workstations — anything that reads as
  "silicon engineering" without distracting from the text on top

Free stock footage (check each clip's license) can be found on sites like
Pexels and Pixabay if you don't have your own B-roll.
