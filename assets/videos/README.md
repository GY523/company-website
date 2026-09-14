# Hero background videos

The About and Careers pages are wired up to play a looping background
video behind the page hero (`.page-hero-video` in `styles.css`).

- `about-hero.mp4` — used on `about.html`. **In place** (a CPU/circuit
  animation, compressed from 25.7MB to ~5MB — see below). Poster frame:
  `assets/images/about-hero-poster.jpg`, extracted straight from the
  video so there's no flash of a different image before playback starts.
- `careers-hero.mp4` — used on `careers.html`. **Not added yet** — until
  this file exists, visitors just see the poster image
  (`assets/images/home-background.jpg`), so the page still looks
  complete. Drop a clip in with this exact filename and it'll start
  playing automatically, no code changes needed.

The video element also gets `filter: brightness(0.4) saturate(1.05)`
plus a dark gradient scrim (both in `styles.css`, under
`.hero-video-media` / `.page-hero-video::before`) so bright or busy
footage never fights the heading text for contrast. Keep that in mind
if you swap in new footage — brighter source video is fine, the filter
absorbs it.

## Recommended specs

- Format: H.264 MP4 (widest browser support)
- Resolution: 1920x1080 is plenty; it's shown behind a dark overlay and
  text, so detail is not critical
- Length: 10-20s, loops seamlessly (no audio needed — it always plays
  muted)
- File size: keep it under ~6-8MB so the hero loads quickly. Trim/compress
  with `ffmpeg`, e.g.:
  `ffmpeg -i input.mov -vf scale=1920:-2 -an -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart careers-hero.mp4`
- Content ideas: clean room / fab floor, chip wafer close-ups, PCB or die
  macro shots, engineers at workstations — anything that reads as
  "silicon engineering" without distracting from the text on top

Free stock footage (check each clip's license) can be found on sites like
Pexels and Pixabay if you don't have your own B-roll.
