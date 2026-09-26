# Handoff: Gnist — fingerspill-app for gitar

## Overview
Gnist is a desktop web app for learning songs on guitar, with the focus on fingerstyle (fingerspill). It is aimed at a beginner who knows a few chords. The core is a **practice view (øvingsvisning)** where an animated fretboard shows the left-hand chord shape and lights up the string being plucked right now, in time with synthesized audio, a following tab, and tempo and loop controls. Around it sit Home, Library, Technique, Progress and Tuner screens. **All UI copy is Norwegian (bokmål)** and must stay that way.

## About the Design Files
The files in `prototype/` are **design references built in HTML**. They are prototypes that show the intended look and behavior, not production code to copy. The task is to **recreate the design in a real app**. No codebase exists yet, so pick a suitable stack. The recommendation is **React + TypeScript + Vite**, with the Web Audio API for sound. Use plain CSS or CSS modules with the tokens below; no UI library is needed.

To open the prototype, serve the `prototype/` folder (e.g. `npx serve prototype`) and open `Gnist.dc.html`. `support.js` is only the prototype runtime and should not be ported. All the relevant logic is in the `class Component` block inside `Gnist.dc.html`: the chord data, pattern data, song list, audio synthesis and state.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii and interactions are final. Recreate them pixel-accurately. The exceptions are placeholder content, listed under *Out of scope / placeholders*.

---

## Global layout
- CSS grid with two columns: a `232px` sidebar and a `minmax(0,1fr)` main area. Minimum height 100vh.
- **Sidebar** (`#241a13`, padding `28px 16px`, sticky, full height, flex column, gap 32px):
  - Logo: a 10px glowing dot (`#ffb35c`, `box-shadow 0 0 14px 4px rgba(255,160,60,.55)`) followed by "Gnist" in Newsreader italic, 30px.
  - Nav with 5 items: Hjem, Bibliotek, Teknikk, Fremdrift, Stemmer. Each is 15px/500 with padding `10px 12px` and radius 8. The active item gets bg `rgba(233,220,196,.09)`, text `#f3e6cc`, and a 3×16px bar in `#e8963f` on the left. Inactive text is `#b7a58b`.
  - Streak card at the bottom (bg `rgba(233,220,196,.06)`, radius 12, padding 16): a big number "4" (Newsreader 34px) followed by "dager på rad" (14px `#c9b89c`), then 7 day dots of 14px (M T O T F L S). A practiced day is a filled dot in `#ffb35c` with a glow. Today is a filled dot with a 2px `#f3e6cc` ring. An unpracticed day is an outline dot (`1px rgba(233,220,196,.25)`).
- **Main area**: padding `40px 48px 72px`, max-width 1240px.
- When the practice view is open, the nav highlights its origin: Teknikk for exercises, Hjem if the user came from Home, otherwise Bibliotek.

## Screens

### 1. Hjem (Home) — `screenshots/01-hjem.png`
- Eyebrow: "LØRDAG 26. SEPTEMBER" in JetBrains Mono 13px, letter-spacing .04em, `#6b5a4a`. In production, use the real date.
- H1 "God kveld." in Newsreader 56px/400, letter-spacing -.02em. The greeting should vary with the time of day.
- Lede (18px `#6b5a4a`, max 560px): "Atten rolige minutter i kveld. Du er snart gjennom introen til Dust in the Wind."
- Grid `1.35fr / 1fr`, gap 24:
  - **Kveldens økt** card (paper): title Newsreader 28px with "18 MIN" in mono on the right. It lists 3 rows separated by `1px #e3d7c0` top borders. Each row has a numbered 32px circle, a title (17/600), a subtitle (14 `#6b5a4a`) and minutes (mono 13). Clicking a row opens that item in the practice view. The rows are:
    1. "Tommelen alene" / "Oppvarming · vekselbass" / 3 MIN
    2. "Pinch" / "Teknikk · tommel og finger samtidig" / 5 MIN
    3. "Dust in the Wind" / "Låt · takt 1–4 i loop" / 10 MIN
  - Primary button "Start økten" (pill, `#d9822b`, text `#241a13`, 16/600, padding 14×24, hover `#e8963f`). It opens item 1.
  - **Fortsett der du slapp** card (dark `#241a13`, a radial amber glow in the top-right corner): eyebrow in mono 12px, then "Dust in the Wind" (Newsreader 36), "Kansas · Travis-picking", "Takt 3 av 8" and "70 % tempo", and a 6px progress bar with a `#ffb35c` glowing fill at 38%. The ghost button "Fortsett" opens the song at bar 3.
- "Passer der du er nå": a grid of song cards (`auto-fill, minmax(240px,1fr)`) showing chords in mono, the title in Newsreader 22px, and "artist · nivå". Hovering changes the border to `#d9822b`.

### 2. Bibliotek (Library) — `02-bibliotek.png`, `03-bibliotek-ingen-treff.png`
- H1 "Bibliotek" in Newsreader 52px.
- Search input (max 560px, padding 14×18, radius 12, bg `#f7f0e2`, border `#cdbfa4`, 17px), placeholder "Søk etter låt, artist eller sjanger". It filters live on title, artist and genre.
- Two chip groups (pills, 8×14, 14/500). Selected chips are `#2b2019` with text `#f3e6cc`. Unselected chips are transparent with a `#cdbfa4` border.
  - Genre: Alle, Folk, Klassisk, Rock, Metal, Pop
  - Level: Alle nivåer, Nybegynner, Litt øvd, Utfordrende
- Card grid (`auto-fill, minmax(250px,1fr)`, gap 18). Each card has:
  - a 108px colored top band tinted by genre, showing the pattern name in uppercase (mono 12) and up to 5 unique chords (mono 14);
  - a body with the title (Newsreader 22), the artist, a level meter made of 3 bars of 14×5px (`#b8661c` on, `#dccfb6` off) plus a label, and BPM on the right.
  - Hover: border `#d9822b` and shadow `0 10px 24px -14px rgba(36,26,19,.45)`.
- **Empty state**: a dashed card showing "Ingen treff på «{søk}» ennå." and "Vi lager forenklede fingerspill-arrangementer av låtene du ønsker deg." with the button "Ønsk deg låten". After clicking, the text changes to "Lagt til i ønskelisten. Du får beskjed når et forenklet arrangement er klart."

### 3. Teknikk (Technique) — `04-teknikk.png`
- H1 followed by the lede "Fingerspill bygges nedenfra: tommelen først, så én finger av gangen. Hver øvelse tar under fem minutter."
- Card grid (`minmax(320px,1fr)`). Each card has:
  - a number (01–05, mono) and a status pill:
    - "Ikke startet": `#e3d7c0` / `#6b5a4a`
    - "I gang": `#f6dfbd` / `#8a4a10`
    - "Mestret": `#dfe3cf` / `#4a5530`
  - the title (Newsreader 26) and a description;
  - the fingers used, as 30px dark circles with an amber letter (p, i, m, a);
  - the outline button "Øv nå", which inverts on hover and opens the exercise in the practice view.
- The 5 exercises are defined in the `EX` array in the prototype.

### 4. Fremdrift (Progress) — `05-fremdrift.png`
- 3 stat cards: "4 / dager på rad", "1 t 37 min / øvd denne uka" and "3 / låter i gang". Values are Newsreader 44.
- "Siste tolv uker": a heatmap of 12 columns × 7 rows with 16px cells, gap 5 and radius 4. It uses 4 levels: `#e3d7c0`, `#efc896`, `#e3a35c`, `#b8661c`, with a legend reading Mindre … Mer.
- "Denne uka": a bar chart per day (Man–Søn) with a height of 150px, scaled to the max value. Today is `#d9822b`, other practiced days are `#e3a35c`, and empty days are a 3px `#e3d7c0` stub. The minutes are shown above each bar in mono.
- "Låter du lærer": rows with the title, artist, an 8px progress bar (`#d9822b` on `#e3d7c0`) and a %. Clicking a row opens the song.

### 5. Stemmer (Tuner) — `06-stemmer.png`
- A dark panel (`#241a13`, radius 18) holding:
  - the note name (Newsreader 120px) and "E2 · 82,41 Hz" in mono;
  - a semicircle gauge of 340×170px with ticks every 5 cents from −50 to +50 (the long tick at 0 is green `#9fb07a`), a 4px needle that rotates 1.8°/cent with `transition: transform .14s linear`, and a glow in the needle color;
  - a status line: "Stemt" (green) when |cents| < 2, otherwise "Litt lavt — stram strengen" or "Litt høyt — slakk strengen" (amber `#ffb35c`), plus a readout like "+3.2 cent";
  - 6 string buttons (56px circles: E A D G B e). The selected button is filled `#ffb35c`.
- Clicking a string plays its reference tone. **In the prototype the needle movement is simulated.** Production should use `getUserMedia` plus pitch detection (e.g. autocorrelation or YIN).
- Standard tuning: E2 82.41, A2 110.00, D3 146.83, G3 196.00, B3 246.94, E4 329.63 Hz.

### 6. Øvingsvisning (Practice view) — `07`–`10`
This is the heart of the app. The screen is laid out top to bottom:

1. **Back link**: "← Bibliotek", "← Teknikk" or "← Hjem", depending on where the user came from.
2. **Header**:
   - left: the title (Newsreader 48) and "{artist} · Forenklet arrangement · {mønster} · {BPM} BPM";
   - right: chord chips for each bar (mono 13, radius 8, min-width 44). The current bar is dark. Bars inside the loop get an amber tint (`rgba(217,130,43,.14)` bg, `#e3a35c` border). Clicking a chip jumps to that bar.
3. **Fretboard** (height 300, radius 16):
   - Wood background: `linear-gradient(180deg,#3d271a,#2c1b12)` with a subtle vertical grain made of repeating 1px lines at rgba(0,0,0,.06) every 11px. Shadow: `0 24px 48px -24px rgba(36,26,19,.7)`.
   - Nut: 9px wide, `#e9dfc8`, at left 52px.
   - Frets 1–5: 4px metallic gradient `#7d6238 → #d8bd82 → #7d6238`. The fret area runs from `61px` to `100% − 72px`, and the last fret sits at the right edge.
   - Inlay dots (16px, `#d9cdb5` at 45% opacity) mid-fret 3 and 5.
   - A 72px darker right-hand zone on the right edge (rgba(0,0,0,.28)).
   - 6 strings: high e at the top, low E at the bottom, at 14/28.4/42.8/57.2/71.6/86% height, with thickness 1.2 → 3.4px.
   - Left of the nut, an open-string marker per string: a 24px ring means open, "×" means muted, nothing means fretted.
   - **Finger dots**: 38px circles centered mid-fret, showing the left-hand finger number (1–4) in 16/700 `#2b2019`, bg `#efe2c8`.
   - **Right-hand zone**: a 30px circle per string showing p/i/m/a when that string is played.
   - Fret numbers 1–5 below the board (mono 12), with "høyre" under the right-hand zone.
4. **Chord line**: the current chord (Newsreader 44), "neste: X", 8 beat cells (30px, "1 & 2 & 3 & 4 &"; the current cell is dark with amber text), and the hint "Hold {akkord}-grepet med venstre hånd. Høyre hånd plukker strengene som lyser."
5. **Transport bar** (paper card):
   - ⏮ (44px);
   - Play/Pause (60px amber circle with a glow shadow);
   - ⏭;
   - "Tempo {n} %" with the live BPM and a range slider (40–120, step 5, default 70);
   - the "Loop" toggle, which reads "Loop takt A–B" when active (dark bg, amber text);
   - the "Lyd på" / "Lyd av" toggle;
   - a helper text while the loop is active: "Klikk to takter for å velge ny loop" / "Klikk sluttakten".
6. **Tab + video** (grid `1fr / 300px`):
   - **Tab**: 8 bar cards in a 4-column grid. Each card has 6 string rows × 8 step columns of 18px height, with a 1px `#c9b89c` string line through the middle and fret numbers in mono 12/600 on a paper chip. The current step column is highlighted `rgba(217,130,43,.28)` and the current note chip turns `#ffb35c`. The current bar has an amber border. Loop bars get bg `#f6dfbd`. Clicking a bar jumps to it (or sets the loop).
   - **Video**: a 4:3 placeholder (striped dark background, play icon, "video · {vinkel}"), then a segmented control with Høyre hånd, Venstre hånd and Begge, then the caption "Videoen følger tempoet og loopen din."

#### Fretboard highlight modes (important)
The user found the original detailed/glowy mode too busy. **The default must be "Enkel" (simple).**

- **Enkel (default)**: accent `#e8963f`.
  - Finger dots always stay the same (`#efe2c8`, shadow `0 2px 6px rgba(0,0,0,.35)`, no scaling).
  - The plucked string turns `#e8963f`, gets +0.6px thickness and a faint `0 0 6px rgba(232,150,63,.45)` glow.
  - Unplayed strings are `rgba(207,196,174,.55)`. Muted strings are `rgba(185,173,151,.25)`.
  - A plucked open string fills its ring with the accent color.
  - The right-hand letter appears only on the plucked string, as a filled accent circle. Idle circles have no outline.
- **Detaljert** (optional setting): strong glows (`#ffd08a` string with a 10px/2px amber glow; the active finger dot scales to 1.18 with a 30px glow). Glow strength is adjustable from 0.3 to 1.6. See `renderVals()` in the prototype.
- Other settings: show/hide finger numbers, and show/hide right-hand letters.
- All highlight transitions use `all .18s ease-out`.

## Interactions & behavior
- **Playback clock**: an interval of `60000 / (bpm × tempo/100) / 2` ms, so each step is an 8th note. There are 8 steps per bar and one chord per bar. At the end of a bar the clock moves to the next bar and wraps to bar 0 after the last bar. **Use a Web Audio lookahead scheduler in production** rather than setInterval, so audio and visuals stay tight.
- **Tempo** changes apply immediately while playing.
- **⏮ / ⏭**: previous or next bar, resetting to step 0.
- **Loop**: turning the loop on sets A = current bar and B = next bar. While the loop is on, the first click on a bar sets A = B = that bar, and the second click sets B (sorted automatically). Playback cycles A→B.
- **When paused**, clicking a bar or chord chip strums the full chord (low→high, 28ms apart) so the user hears how it should sound.
- **Navigation**: opening a song resets the bar to 0, stops playback and turns the loop off. Leaving the practice view stops playback.

### Picking patterns (per song)
Each pattern is 8 steps. Tokens: `b1` is the chord's root bass string, `b2` is its alternate bass string (both played by the thumb, p), and `0/1/2` are strings e/B/G played by the a/m/i fingers.
```
travis: [b1+1] [2] [b2] [0] [b1] [1] [b2] [2]
arp:    [b1]   [2] [1] [0] [1] [2] [b2] [2]
pinch:  [b1+0] [ ] [b2+1] [ ] [b1+0] [ ] [b2+1] [ ]
thumb:  [b1]   [ ] [b2] [ ] [b1] [ ] [b2] [ ]
pima:   [b1]   [2] [1] [0] [b1] [2] [1] [0]
```
Notes on muted strings (fret −1) are dropped.

### Chord data
Strings are indexed 0 = high e … 5 = low E. `f` = fret (−1 muted, 0 open), `g` = fretting finger, `b` = [bass1, bass2].
C, Cmaj7, Cadd9, G, Am, Am7, Em, Fmaj7, D, A, Asus2, Asus4, E, Bm7, and "Åpen" (all open). The exact values are in `const CH` in the prototype.

### Audio
- The prototype uses a Karplus-Strong plucked string built in Web Audio. Each MIDI note is rendered once into a buffer (a 2.6s decay) and cached. Output runs through a 0.7 master gain and a 3.2kHz lowpass.
- Open-string MIDI notes from e down to E: 64, 59, 55, 50, 45, 40. Note = open + fret.
- Thumb (p) notes play at velocity 0.85, fingers at 0.6, and strums at 0.5.
- The AudioContext is created or resumed on the first user gesture (Play, a tuner string, or a bar click).
- **Production recommendation**: replace the synthesis with real nylon/steel guitar samples (e.g. a small sampled soundfont per string, pitched per fret), and keep the same timing model.

## State
```
view: 'home'|'lib'|'tech'|'prog'|'tune'|'play'
from: view the user came from (for back link + nav highlight)
songId, bar (0–7), step (0–7), playing, tempo (40–120), muted
loopOn, loopA, loopB, pick (0|1 – loop selection stage)
q, genre, lvl (library filters), wished
cam: 'Høyre hånd'|'Venstre hånd'|'Begge'
tuneS (0–5), cents
settings: fretMode ('Enkel'|'Detaljert'), showFingerNumbers, showRightHand, glow
```
**Data to persist** in production: streak, practice minutes per day, per-song progress (bar reached, mastered %, last tempo), exercise status, wishlist, and settings.

**Song model**: `{id, title, artist, genre, level 1–3, bpm, pattern, bars: chord[]}`. In production, extend it with sections (intro/verse/chorus) and per-bar custom tab so that real arrangements can override the generated pattern.

## Design tokens
**Colors**
- `#efe6d4`: page background (warm paper)
- `#f7f0e2`: card surface
- `#dccfb6`: card border · `#e3d7c0`: dividers, empty tracks · `#cdbfa4`: input and chip borders · `#c9b89c`: tab string lines, muted text on dark
- `#2b2019`: ink / primary text · `#6b5a4a`: secondary text · `#8a7864`: placeholder
- `#241a13`: dark surfaces (sidebar, tuner, dark cards)
- `#e9dcc4` / `#f3e6cc`: text on dark · `#b7a58b` / `#a8977d`: muted text on dark
- `#d9822b`: primary accent · `#e8963f`: accent hover and the Enkel-mode highlight · `#ffb35c`: glow amber · `#ffc27a`: amber text on dark · `#ffd08a`: detailed-mode string glow
- `#b8661c`: deep amber (meters, heatmap max) · `#e3a35c`, `#efc896`: heatmap mid levels · `#f6dfbd`: loop / "I gang" tint
- `#9fb07a`: in-tune green · `#dfe3cf` / `#4a5530`: "Mestret" pill
- Fretboard: wood `#3d271a → #2c1b12`, nut `#e9dfc8`, frets `#7d6238 / #d8bd82`, strings `#cfc4ae`, finger dots `#efe2c8`
- Genre tints for library cards: Folk `#6b4a2e`, Klassisk `#4f5a3c`, Rock `#7a3b22`, Metal `#2f2a26`, Pop `#85562a`, Teknikk `#5a4636`

**Typography** (Google Fonts)
- **Newsreader** (400/500, italic): headings, display numbers and song titles. H1 52–56px, letter-spacing -.02em, line-height ~1.05.
- **Hanken Grotesk** (400–700): UI and body text. Body 15–18px, labels 13–14px, buttons 15–16/600.
- **JetBrains Mono** (400/600): eyebrows, chord names, BPM, tab numbers, durations. 11–15px.

**Radii**: 3–6 (tab chips, beats), 8 (nav, chord chips), 12 (small cards, inputs), 14 (cards), 16 (fretboard, home cards), 18 (tuner), 999 (pills and buttons).

**Spacing**: gaps of 6/8/10/12/14/16/18/20/22/24/28/32/36. Card padding is 18–28. The main padding is 40/48.

**Shadows**: card hover `0 10px 24px -14px rgba(36,26,19,.45)` · play button `0 6px 18px -6px rgba(217,130,43,.8)` · fretboard `0 24px 48px -24px rgba(36,26,19,.7)`.

## Out of scope / placeholders in the prototype
- **Arrangements are auto-generated** from chord + pattern and are **not accurate transcriptions**. Real licensed or hand-made arrangements are needed.
- **Video** is a placeholder. Production needs hand-cam videos for three angles, synced to tempo (playbackRate) and loop.
- **Tuner** input is simulated (see above).
- Stats, heatmap, streak and dates are static mock data.
- There is no auth or backend. The only responsive target is desktop, down to about 1000px wide.

## Files
- `prototype/Gnist.dc.html`: the complete interactive prototype (all screens, logic, data and audio)
- `prototype/support.js`: the prototype runtime only (do not port)
- `screenshots/`:
  - `01-hjem.png`
  - `02-bibliotek.png`
  - `03-bibliotek-ingen-treff.png`
  - `04-teknikk.png`
  - `05-fremdrift.png`
  - `06-stemmer.png`
  - `07-ovingsvisning.png`
  - `08-ovingsvisning-loop.png`
  - `09-ovingsvisning-spiller.png`
  - `10-ovingsvisning-tab-video.png`
