# Hero background video

Neither the About nor Careers page currently uses a background video
-- both use a static image instead (`assets/images/about.png` and
`assets/images/careers-background.jpeg`). `.page-hero-video` in
`styles.css` still supports a `<video class="hero-video-media">`
background if a page wants one again.

- `careers-hero.mp4` — **currently unused.** Sitting here in case it's
  wanted again (a CPU/circuit animation, compressed from 25.7MB to
  ~5MB — see below; it's moved between the About and Careers pages a
  couple of times already). Poster frame:
  `assets/images/careers-hero-poster.jpg`, extracted straight from the
  video so there's no flash of a different image before playback
  starts.

To wire a video back in on a page, add the `<video>` markup (see the
`about.html`/`careers.html` git history for the exact pattern) and
give the section's `page-hero-video--*` modifier class a
`.hero-video-media` filter instead of a background-image. The video
element gets `filter: brightness(0.4) saturate(1.05)` plus a dark
gradient scrim (both in `styles.css`, under `.hero-video-media` /
`.page-hero-video::before`) so bright or busy footage never fights the
heading text for contrast. Keep that in mind if you swap in new
footage — brighter source video is fine, the filter absorbs it.

## Recommended specs

- Format: H.264 MP4 (widest browser support)
- Resolution: 1920x1080 is plenty; it's shown behind a dark overlay and
  text, so detail is not critical
- Length: 10-20s, loops seamlessly (no audio needed — it always plays
  muted)
- File size: keep it under ~6-8MB so the hero loads quickly. Trim/compress
  with `ffmpeg`, e.g.:
  `ffmpeg -i input.mov -vf scale=1920:-2 -an -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart hero.mp4`
- Content ideas: clean room / fab floor, chip wafer close-ups, PCB or die
  macro shots, engineers at workstations — anything that reads as
  "silicon engineering" without distracting from the text on top

Free stock footage (check each clip's license) can be found on sites like
Pexels and Pixabay if you don't have your own B-roll.
