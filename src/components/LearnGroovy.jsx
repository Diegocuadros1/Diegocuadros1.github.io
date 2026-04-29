import { useState, useRef, useCallback, useEffect, Fragment } from 'react'
import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'
import styles from './LearnGroovy.module.css'
import HighlightedCode from './HighlightedCode'

// ── Encoding data (mirrors preProcessing.js) ─────────────────────────────
const KEYWORDS = [
  'note', 'key', 'chord', 'play', 'measure', 'from', 'to', 'vamp', 'encore', 'cut',
  'compose', 'fin', 'cadence', 'cue', 'alt', 'drop', 'gate', 'open', 'closed', 'ghost',
  'level', 'lyric', 'silence', 'noise', 'sqrt', 'hypot', 'sharp', 'flat',
]
const ALPHABET   = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ']
const MATH_CHARS = [...'0123456789.+-*/%^=']
const SPECIALS   = [...`{}()[],;:<>!?&|"'\\_@#$~\``]
const WS_LABELS  = ['space', 'tab', 'newline']
const WS_SYMBOLS = ['·', '→', '↵']

const CH_META = [
  { ch: 1, label: 'Keywords',    color: 'var(--cyan)',       mod: 28,  data: KEYWORDS,   formula: 'KEYWORDS[pitch % 28]' },
  { ch: 2, label: 'Alphabet',    color: 'var(--violet)',     mod: 52,  data: ALPHABET,   formula: 'ALPHABET[pitch % 52]' },
  { ch: 3, label: 'Digits/Math', color: 'var(--lime)',       mod: 18,  data: MATH_CHARS, formula: 'MATH_CHARS[pitch % 18]' },
  { ch: 4, label: 'Punctuation', color: 'var(--pink)',       mod: 24,  data: SPECIALS,   formula: 'SPECIALS[pitch % 24]' },
  { ch: 5, label: 'Whitespace',  color: 'var(--yellow)',     mod: 3,   data: WS_LABELS,  formula: 'pitch % 3 → space/tab/newline' },
  { ch: 6, label: 'Comments',    color: 'var(--text-muted)', mod: null, data: null,      formula: 'Play anything' },
]

const TABLE_DEFS = [
  { label: 'Keywords (Ch 1)',    color: 'var(--cyan)',   data: KEYWORDS,   ch: 1 },
  { label: 'Alphabet (Ch 2)',    color: 'var(--violet)', data: ALPHABET,   ch: 2 },
  { label: 'Digits/Math (Ch 3)', color: 'var(--lime)',   data: MATH_CHARS, ch: 3 },
  { label: 'Punctuation (Ch 4)', color: 'var(--pink)',   data: SPECIALS,   ch: 4 },
  { label: 'Whitespace (Ch 5)',  color: 'var(--yellow)', data: WS_LABELS,  ch: 5 },
  { label: 'Unicode (Ch 7–16)', color: 'var(--blue)',   data: null,       ch: null, unicode: true },
]

// Approximate Unicode block names for each Ch 7–16 range (0x0000 step 0x4000)
const UNICODE_BLOCKS = [
  'Basic Latin, IPA, Greek, Cyrillic, Arabic, Hebrew, CJK Radicals…',
  'CJK Unified Ideographs (Chinese · Japanese · Korean)',
  'CJK continued, Hangul Syllables, Private Use Area',
  'Hangul continued, Specials, BMP Private Use Area',
  'Linear B, Gothic, Deseret, Byzantine Music, Math Alphanumeric…',
  'Cuneiform, Egyptian Hieroglyphs, Bamum Supplement',
  'Miao, Pahawh Hmong, Tangut',
  'Glagolitic Supplement, Nüshu, Duployan, Sutton SignWriting',
  'CJK Extension B',
  'CJK Extension B continued',
]

const TIMING_ROWS = [
  { gap: '≥ 0.2 s', ws: 'space',   sym: '·' },
  { gap: '≥ 1.0 s', ws: 'tab',     sym: '→' },
  { gap: '≥ 2.5 s', ws: 'newline', sym: '↵' },
]

const PIPE_STEPS = ['MIDI file', 'preprocessor', 'source text', 'lexer / parser', 'code gen', 'JavaScript']

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
function midiToName(p) { return NOTE_NAMES[p % 12] + (Math.floor(p / 12) - 1) }

function decodeNote(ch, pitch) {
  if (ch === 1) {
    const i = pitch % 28
    return { token: KEYWORDS[i], display: KEYWORDS[i], index: i, formula: `KEYWORDS[${pitch} % 28] = KEYWORDS[${i}]` }
  }
  if (ch === 2) {
    const i = pitch % 52
    return { token: ALPHABET[i], display: ALPHABET[i], index: i, formula: `ALPHABET[${pitch} % 52] = ALPHABET[${i}]` }
  }
  if (ch === 3) {
    const i = pitch % 18
    return { token: MATH_CHARS[i], display: MATH_CHARS[i], index: i, formula: `MATH_CHARS[${pitch} % 18] = MATH_CHARS[${i}]` }
  }
  if (ch === 4) {
    const i = pitch % 24
    return { token: SPECIALS[i], display: SPECIALS[i], index: i, formula: `SPECIALS[${pitch} % 24] = SPECIALS[${i}]` }
  }
  if (ch === 5) {
    const i = pitch % 3
    const actual = [' ', '\t', '\n'][i]
    return { token: actual, display: `${WS_SYMBOLS[i]} ${WS_LABELS[i]}`, index: i, formula: `${pitch} % 3 = ${i} → ${WS_LABELS[i]}` }
  }
  return { token: '', display: '— dropped —', index: null, formula: 'Channel 6: comment track, always dropped' }
}

// Audio engine 
// Mirrors the octave offsets from encoder.js so notes sound identical to
// what ends up in the exported MIDI file.
const CHANNEL_OFFSET = { 1: 48, 2: 48, 3: 60, 4: 72 }
const NOTE_DUR = 0.19
const NOTE_GAP = 0.1
const WS_GAPS  = [0.35, 0.8, 2.5]

function buildSequenceMidi(seq) {
  const midi = new Midi()
  const tracks = {}
  for (let ch = 1; ch <= 4; ch++) {
    const t = midi.addTrack()
    t.channel = ch
    tracks[ch] = t
  }
  // Ch 6 gets its own track — notes play as sound but are dropped by the compiler
  const ch6Track = midi.addTrack()
  ch6Track.channel = 6

  let time = 0
  for (const note of seq) {
    const { ch, pitch: p } = note
    if (ch === 5) { time += WS_GAPS[p % 3]; continue }
    if (ch === 6) {
      // pitch is used directly as MIDI note for Ch 6 (no channel offset — "play whatever you want")
      ch6Track.addNote({ midi: Math.min(127, p), time, duration: NOTE_DUR * 1.5, velocity: 0.55 })
      time += NOTE_DUR + NOTE_GAP
      continue
    }
    const offset = CHANNEL_OFFSET[ch]
    if (!offset) continue
    tracks[ch].addNote({ midi: Math.min(127, p + offset), time, duration: NOTE_DUR, velocity: 0.8 })
    time += NOTE_DUR + NOTE_GAP
  }
  return midi
}

function useNotePlayer() {
  const [playerState, setPlayerState] = useState('idle')
  const [elapsed, setElapsed]         = useState(0)
  const [duration, setDuration]       = useState(0)
  const synthsRef   = useRef([])
  const partsRef    = useRef([])
  const intervalRef = useRef(null)

  const teardown = useCallback(() => {
    partsRef.current.forEach(p => { try { p.dispose() } catch {} })
    partsRef.current = []
    synthsRef.current.forEach(s => { try { s.dispose() } catch {} })
    synthsRef.current = []
    clearInterval(intervalRef.current)
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
  }, [])

  const stop = useCallback(() => { teardown(); setPlayerState('idle'); setElapsed(0) }, [teardown])

  const playMidi = useCallback(async (midi) => {
    if (playerState === 'playing') { stop(); return }
    setPlayerState('loading')
    try {
      await Tone.start()
      setDuration(midi.duration)
      Tone.getTransport().cancel()
      Tone.getTransport().stop()
      const parts = []
      const synths = []
      midi.tracks.forEach(track => {
        if (!track.notes.length) return
        // Ch 6 = comment track: bell-like sine (distinct timbre, softer)
        const isCh6 = track.channel === 6
        const synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: isCh6 ? 'sine' : 'triangle' },
          envelope: isCh6
            ? { attack: 0.01, decay: 0.4, sustain: 0.0, release: 1.2 }
            : { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.8 },
          volume: isCh6 ? -20 : -14,
        }).toDestination()
        synths.push(synth)
        const part = new Tone.Part(
          (time, note) => synth.triggerAttackRelease(note.name, note.duration, time, note.velocity),
          track.notes.map(n => ({ time: n.time, name: n.name, duration: n.duration, velocity: n.velocity }))
        )
        part.start(0)
        parts.push(part)
      })
      partsRef.current = parts
      synthsRef.current = synths
      const startTime = Date.now()
      Tone.getTransport().start()
      setPlayerState('playing')
      intervalRef.current = setInterval(() => {
        const e = (Date.now() - startTime) / 1000
        setElapsed(Math.min(e, midi.duration))
        if (e >= midi.duration) { teardown(); setPlayerState('idle'); setElapsed(0) }
      }, 150)
    } catch (err) {
      console.error('Audio error:', err)
      setPlayerState('idle')
    }
  }, [playerState, stop, teardown])

  useEffect(() => () => teardown(), [teardown])
  return { playerState, elapsed, duration, playMidi, stop }
}

// White key offsets within an octave (semitone offsets from C)
const WHITE_OFFSETS = [0, 2, 4, 5, 7, 9, 11]
// Black key semitone offsets and their left position in units of white key widths
const BLACK_KEYS = [
  { offset: 1,  leftFrac: 0.6 },
  { offset: 3,  leftFrac: 1.6 },
  { offset: 6,  leftFrac: 3.6 },
  { offset: 8,  leftFrac: 4.6 },
  { offset: 10, leftFrac: 5.6 },
]

function PianoOctave({ base, activePitch, channelColor, onNote }) {
  return (
    <div className={styles.pianoOctave} style={{ '--ch-color': channelColor }}>
      {WHITE_OFFSETS.map(offset => {
        const midi = base + offset
        return (
          <div
            key={offset}
            className={`${styles.whiteKey} ${midi === activePitch ? styles.whiteKeyActive : ''}`}
            onClick={() => onNote(midi)}
            title={midiToName(midi)}
          />
        )
      })}
      {BLACK_KEYS.map(({ offset, leftFrac }) => {
        const midi = base + offset
        return (
          <div
            key={offset}
            className={`${styles.blackKey} ${midi === activePitch ? styles.blackKeyActive : ''}`}
            style={{ left: `calc(${leftFrac} * var(--wk-width))` }}
            onClick={() => onNote(midi)}
            title={midiToName(midi)}
          />
        )
      })}
    </div>
  )
}

// ── Language Guide data ───────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Variables & Types',
    body: 'Use note for mutable variables and key for constants. Types only appear in function parameters and struct fields, and never on declarations.',
    color: 'var(--cyan)',
    keywords: [
      { kw: 'note x = 5',   meaning: 'Declare a mutable variable' },
      { kw: 'key x = 5',    meaning: 'Declare an immutable constant' },
      { kw: 'level',         meaning: 'Number type  (int or float)' },
      { kw: 'lyric',         meaning: 'String type' },
      { kw: 'gate',          meaning: 'Boolean type' },
      { kw: 'silence',       meaning: 'Void — used as a return type when a function returns nothing' },
      { kw: 'noise',         meaning: 'Any type — no type constraint applied' },
      { kw: 'ghost T',       meaning: 'Optional wrapper — the value may be absent (null-like)' },
      { kw: 'open',          meaning: 'Boolean true' },
      { kw: 'closed',        meaning: 'Boolean false' },
      { kw: 'x sharp',       meaning: 'Increment  (x++)' },
      { kw: 'x flat',        meaning: 'Decrement  (x--)' },
      { kw: 'x ^ n',         meaning: 'Exponentiation  (x ** n in JS)' },
      { kw: 'play value',    meaning: 'Print a value to output' },
    ],
  },
  {
    num: '02',
    title: 'Functions',
    body: 'Declare functions with compose. Each parameter is written as name: Type. Specify a return type with -> Type. Return a value with fin and close the body with cadence.',
    color: 'var(--violet)',
    keywords: [
      { kw: 'compose f(p: T) -> R :', meaning: 'Declare a function with typed params and a return type' },
      { kw: 'compose f(p: T) :',      meaning: 'Declare a void function (omit -> Type when nothing is returned)' },
      { kw: 'fin value',              meaning: 'Return a value. Exits the function immediately' },
      { kw: 'cadence',                meaning: 'Close a block (every compose, loop, or conditional needs one)' },
      { kw: 'play value',             meaning: 'Print a value to stdout. Works anywhere, not just functions' },
    ],
  },
  {
    num: '03',
    title: 'Control Flow',
    body: 'Branch with cue / alt / drop. Loop with vamp (while), measure (range or for-each), or encore (repeat N times). Break early with cut.',
    color: 'var(--pink)',
    keywords: [
      { kw: 'cue condition :',            meaning: 'If: execute the block when condition is true' },
      { kw: 'alt condition :',            meaning: 'Else-if: checked only when the preceding cue was false' },
      { kw: 'drop :',                     meaning: 'Else: fallback block when no cue / alt matched' },
      { kw: 'vamp condition :',           meaning: 'While loop: repeat as long as condition holds' },
      { kw: 'measure i from A to B :',   meaning: 'Range loop: i goes from A up to B (inclusive)' },
      { kw: 'measure x in collection :', meaning: 'For-each loop: iterates over every element of an array' },
      { kw: 'encore N :',                meaning: 'Repeat the block body exactly N times' },
      { kw: 'cut',                        meaning: 'Break: immediately exit the enclosing loop' },
      { kw: 'cadence',                    meaning: 'Close the block (required after every control structure)' },
    ],
  },
  {
    num: '04',
    title: 'Structs & Arrays',
    body: 'Define custom shapes with chord. Array types are written [Type] and array literals are [a, b, c]. Use ?? to supply a fallback when an optional (ghost) value is absent.',
    color: 'var(--lime)',
    keywords: [
      { kw: 'chord Name :',       meaning: 'Define a struct type. Groups named fields together' },
      { kw: 'field : Type',       meaning: 'Required field inside a chord declaration' },
      { kw: 'field : ghost T',    meaning: 'Optional field. May be absent (ghost-typed)' },
      { kw: '[T]',                meaning: 'Array type annotation  (e.g. [level] for a number array)' },
      { kw: '[a, b, c]',          meaning: 'Array literal. All elements must share the same type' },
      { kw: 'arr[i]',             meaning: 'Subscript. Read element at index i' },
      { kw: 'value ?? fallback',  meaning: 'Unwrap-else: Evaluates to fallback when value is absent' },
      { kw: 'value?.field',       meaning: 'Optional member access: safe dot that skips if value is absent' },
    ],
  },
]

const LANG_TABS = [
  {
    label: 'Variables',
    code: `// note = mutable   key = immutable — no type annotation on declarations
note score = 0
key name = "Groovy"
note playing = open     // open = true, closed = false

// Increment / decrement shortcuts
score sharp    // score++
score flat     // score--

// Print any value
play score     // 0
play name      // Groovy`,
  },
  {
    label: 'Functions',
    code: `// compose <name>(<param>: <Type>) -> <ReturnType>:
compose add(a: level, b: level) -> level:
  fin a + b
cadence

// Omit -> <Type> when the function returns silence (void)
compose greet(name: lyric):
  play "Hello, " + name
cadence

note result = add(3, 4)
play result          // 7
greet("World")       // Hello, World`,
  },
  {
    label: 'Control Flow',
    code: `note score = 85

// if / else-if / else
cue score > 90:
  play "A"
alt score > 80:
  play "B"
drop:
  play "Try harder"
cadence

// while loop  (vamp)
vamp score < 90:
  score sharp
cadence

// range loop  (measure … from … to …)
measure i from 1 to 3:
  play i          // 1  2  3
cadence

// for-each loop  (measure … in …)
note nums = [10, 20, 30]
measure n in nums:
  play n
cadence`,
  },
  {
    label: 'Structs',
    code: `// chord defines a struct — fields DO use name: Type syntax
chord Song:
  title: lyric
  bpm: level
  active: gate
cadence

// ghost marks a field as optional (can be silence / null)
chord Track:
  name: lyric
  length: level
  artist: ghost lyric
cadence

// Functions can accept struct types as parameters
compose describe(s: Song):
  play s.title
  play s.bpm
cadence`,
  },
]

// ── Main component ────────────────────────────────────────────────────────

export default function LearnGroovy() {
  const [section, setSection]           = useState(0)
  const [activeTab, setActiveTab]       = useState(0)
  const [activeTable, setActiveTable]   = useState(0)
  const [expandedStep, setExpandedStep] = useState(null)
  const [channel, setChannel]           = useState(1)
  const [pitch, setPitch]               = useState(60)
  const [octave, setOctave]             = useState(4)
  const [sequence, setSequence]         = useState([])
  const [unicodeCh, setUnicodeCh]       = useState(7)
  const [unicodePitch, setUnicodePitch] = useState(60)
  const [unicodeVel, setUnicodeVel]     = useState(64)

  const { playerState, elapsed, duration, playMidi, stop: stopPlayer } = useNotePlayer()
  const previewSynthRef = useRef(null)

  useEffect(() => () => { previewSynthRef.current?.dispose() }, [])

  const triggerPreviewNote = useCallback(async (ch, p) => {
    if (ch === 5) return // whitespace has no sound
    // Ch 6: pitch used directly as MIDI note (no offset — "play whatever you want")
    const midiNote = ch === 6
      ? Math.min(127, p)
      : Math.min(127, p + (CHANNEL_OFFSET[ch] ?? 0))
    if (!midiNote && ch !== 6) return
    try {
      await Tone.start()
      if (!previewSynthRef.current || previewSynthRef.current.disposed) {
        previewSynthRef.current = new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.01, decay: 0.08, sustain: 0.3, release: 0.4 },
          volume: -10,
        }).toDestination()
      }
      previewSynthRef.current.triggerAttackRelease(
        Tone.Frequency(midiNote, 'midi').toNote(), ch === 6 ? '4n' : '8n'
      )
    } catch {}
  }, [])

  const chInfo  = CH_META[channel - 1]
  const decoded = decodeNote(channel, pitch)

  const activeIdx = (() => {
    if (channel === 0 || channel > 5) return -1
    const mod = CH_META[channel - 1].mod
    return mod ? pitch % mod : -1
  })()

  function handleChannelChange(ch) {
    setChannel(ch)
    if (ch >= 1 && ch <= 5) setActiveTable(ch - 1)
  }

  function addNote() {
    triggerPreviewNote(channel, pitch)
    if (channel === 6) {
      setSequence(prev => [
        ...prev.slice(-49),
        { ch: 6, pitch, color: 'var(--text-muted)', label: 'Comments',
          token: '', display: '♩', index: null,
          formula: 'Channel 6: comment track, always dropped by the compiler' },
      ])
      return
    }
    setSequence(prev => [
      ...prev.slice(-49),
      { ch: channel, pitch, color: chInfo.color, label: chInfo.label, ...decoded },
    ])
  }

  function playSequence() {
    if (playerState === 'playing') { stopPlayer(); return }
    if (sequence.length === 0) return
    playMidi(buildSequenceMidi(sequence))
  }

  const outputText = sequence.map(n => n.token).join('')
  const pct = duration > 0 ? (elapsed / duration) * 100 : 0
  const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  const unicodeCodepoint = (unicodeCh - 7) * 16384 + unicodePitch * 128 + unicodeVel
  const isSurrogate = unicodeCodepoint >= 0xD800 && unicodeCodepoint <= 0xDFFF
  const unicodeChar = (!isSurrogate && unicodeCodepoint <= 0x10FFFF)
    ? String.fromCodePoint(unicodeCodepoint) : '?'
  const unicodeHex = unicodeCodepoint.toString(16).toUpperCase().padStart(4, '0')

  // Base MIDI for current octave's C note
  const octaveBase = (octave + 1) * 12

  return (
    <section id="code-yourself" className={styles.section}>
      <div className={styles.container}>
        <p className="section-label">Syntax Guide</p>

        <h2 className={styles.title}>
          Learn <span className={styles.accent}>Groovy</span>
        </h2>
        <p className={styles.lead}>
          Groovy is a music-themed programming language. Write programs as plain text or compose
          them as MIDI files. Every note on every channel encodes a specific character.
        </p>

        {/* ── Top-level section tabs ── */}
        <div className={styles.sectionTabs}>
          {['Audio Encoding', 'Language Guide'].map((label, i) => (
            <button
              key={label}
              className={`${styles.sectionTab} ${section === i ? styles.sectionTabActive : ''}`}
              onClick={() => setSection(i)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════ AUDIO ENCODING ══════════════ */}
        {section === 0 && (
          <div className={styles.encodingSection}>

            <p className={styles.encodingLead}>
              Every Groovy program can be authored as a MIDI file. The preprocessor reads notes,
              decodes characters from <em>channel</em> and <em>pitch</em>, and reconstructs source
              text that flows into the normal compile pipeline.
            </p>

            {/* Pipeline */}
            <div className={styles.pipeline}>
              {PIPE_STEPS.map((step, i) => (
                <Fragment key={step}>
                  <div className={styles.pipeStep}>{step}</div>
                  {i < PIPE_STEPS.length - 1 && <span className={styles.pipeArrow}>›</span>}
                </Fragment>
              ))}
            </div>

            {/* Channel routing */}
            <h3 className={styles.subheading}>Channel Routing</h3>
            <p className={styles.encodingSublead}>
              The channel a note lives on determines what kind of character it encodes.
              Pitch selects the specific character within that category via modulo arithmetic.
            </p>
            <div className={styles.channelGrid}>
              {CH_META.map(({ ch, label, color, formula }) => (
                <div
                  key={ch}
                  className={`${styles.channelCard} ${channel === ch ? styles.channelCardActive : ''}`}
                  style={{ '--ch-color': color }}
                  onClick={() => handleChannelChange(ch)}
                >
                  <div className={styles.channelNum} style={{ color }}>Ch {ch}</div>
                  <div className={styles.channelCardLabel}>{label}</div>
                  <div className={styles.channelCardFormula}>{formula}</div>
                </div>
              ))}
              {/* Ch 7–16 Unicode card — clicking jumps to the Unicode index table */}
              <div
                className={`${styles.channelCard} ${styles.channelCardUnicode} ${activeTable === 5 ? styles.channelCardActive : ''}`}
                style={{ '--ch-color': 'var(--blue)' }}
                onClick={() => setActiveTable(5)}
              >
                <div className={styles.channelNum} style={{ color: 'var(--blue)' }}>Ch 7–16</div>
                <div className={styles.channelCardLabel}>Unicode</div>
                <div className={styles.channelCardFormula}>
                  (channel − 7) × 16384 + pitch × 128 + velocity
                </div>
              </div>
            </div>

            {/* Implicit whitespace */}
            <h3 className={styles.subheading}>Implicit Whitespace from Timing</h3>
            <p className={styles.encodingSublead}>
              Notes are sorted chronologically before decoding. The gap in time between consecutive
              notes automatically injects whitespace. How fast or slow you play shapes the
              indentation and structure of the output.
            </p>
            <div className={styles.timingGrid}>
              {TIMING_ROWS.map(({ gap, ws, sym }) => (
                <div key={ws} className={styles.timingCard}>
                  <div className={styles.timingSym}>{sym}</div>
                  <div className={styles.timingGap}>{gap}</div>
                  <div className={styles.timingWs}>{ws}</div>
                </div>
              ))}
            </div>

            {/* Character index tables */}
            <h3 className={styles.subheading}>Character Index Tables</h3>
            <p className={styles.encodingSublead}>
              Each channel maps pitches to specific tokens via modulo arithmetic. The highlighted
              entry reflects your current pitch selection in the encoder below.
            </p>
            <div className={styles.tableTabs}>
              {TABLE_DEFS.map((t, i) => (
                <button
                  key={t.label}
                  className={`${styles.tableTab} ${activeTable === i ? styles.tableTabActive : ''}`}
                  style={activeTable === i ? { color: t.color } : {}}
                  onClick={() => setActiveTable(i)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {TABLE_DEFS[activeTable].unicode ? (
              <div className={styles.unicodePanel}>
                {/* Formula */}
                <div className={styles.unicodeFormulaBox}>
                  <span className={styles.unicodeFormulaLabel}>Encoding formula</span>
                  <code className={styles.unicodeFormulaCode}>
                    codepoint = (channel − 7) × 16384 + pitch × 128 + velocity
                  </code>
                  <p className={styles.unicodeFormulaNote}>
                    Channels 7–16 each cover a 16,384-codepoint slice of Unicode.
                    Within a channel, pitch selects a 128-value block and velocity fine-tunes
                    the position. The full encoding spans U+0000 – U+27FFF.
                  </p>
                </div>

                {/* Interactive calculator */}
                <div className={styles.unicodeCalc}>
                  <div className={styles.unicodeSliders}>
                    {[
                      { label: 'Channel', min: 7,  max: 16,  val: unicodeCh,    set: setUnicodeCh },
                      { label: 'Pitch',   min: 0,  max: 127, val: unicodePitch, set: setUnicodePitch },
                      { label: 'Velocity',min: 0,  max: 127, val: unicodeVel,   set: setUnicodeVel },
                    ].map(({ label, min, max, val, set }) => (
                      <div key={label} className={styles.unicodeSliderRow}>
                        <span className={styles.unicodeSliderLabel}>{label}</span>
                        <input
                          type="range" min={min} max={max} value={val}
                          className={styles.unicodeSlider}
                          onChange={e => set(+e.target.value)}
                        />
                        <span className={styles.unicodeSliderVal}>{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.unicodeResult}>
                    <div className={styles.unicodeBigChar}>
                      {isSurrogate ? <span className={styles.unicodeSurrogate}>surrogate</span> : unicodeChar}
                    </div>
                    <div className={styles.unicodeResultMeta}>
                      <div className={styles.unicodeResultRow}>
                        <span className={styles.unicodeResultKey}>Codepoint</span>
                        <code className={styles.unicodeResultVal}>
                          U+{unicodeHex} ({unicodeCodepoint})
                        </code>
                      </div>
                      <div className={styles.unicodeResultRow}>
                        <span className={styles.unicodeResultKey}>Breakdown</span>
                        <code className={styles.unicodeResultVal}>
                          ({unicodeCh}−7)×16384 + {unicodePitch}×128 + {unicodeVel} = {unicodeCodepoint}
                        </code>
                      </div>
                      {isSurrogate && (
                        <div className={styles.unicodeResultRow}>
                          <span className={styles.unicodeResultKey}>Note</span>
                          <span className={styles.unicodeSurrogateNote}>
                            U+D800–U+DFFF are surrogate pairs — not valid standalone codepoints
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Channel range table */}
                <div className={styles.unicodeRangeTable}>
                  <div className={styles.unicodeRangeHeader}>
                    <span>Channel</span>
                    <span>Codepoint Range</span>
                    <span>Unicode Area</span>
                  </div>
                  {Array.from({ length: 10 }, (_, i) => {
                    const ch = i + 7
                    const lo = i * 16384
                    const hi = lo + 16383
                    const loHex = lo.toString(16).toUpperCase().padStart(4, '0')
                    const hiHex = hi.toString(16).toUpperCase().padStart(4, '0')
                    return (
                      <div
                        key={ch}
                        className={`${styles.unicodeRangeRow} ${ch === unicodeCh ? styles.unicodeRangeRowActive : ''}`}
                        onClick={() => setUnicodeCh(ch)}
                      >
                        <span className={styles.unicodeRangeCh}>Ch {ch}</span>
                        <code className={styles.unicodeRangeCode}>U+{loHex} – U+{hiHex}</code>
                        <span className={styles.unicodeRangeBlock}>{UNICODE_BLOCKS[i]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className={styles.chipGrid}>
                {TABLE_DEFS[activeTable].data.map((entry, i) => {
                  const def = TABLE_DEFS[activeTable]
                  const isActive = def.ch === channel && i === activeIdx
                  return (
                    <div
                      key={i}
                      className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
                      style={{ '--chip-color': def.color }}
                      title={`Click to select in encoder`}
                      onClick={() => {
                        handleChannelChange(def.ch)
                        setPitch(i)
                        setOctave(Math.max(0, Math.min(8, Math.floor(i / 12) - 1)))
                      }}
                    >
                      <span className={styles.chipIdx}>{i}</span>
                      <span className={styles.chipVal}>{entry}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Interactive encoder ── */}
            <h3 className={styles.subheading}>Interactive Note Encoder</h3>
            <p className={styles.encodingSublead}>
              Pick a channel, play a note on the piano or drag the pitch slider to watch the decoded
              character update live. Add notes to your sequence and see Groovy code assemble.
            </p>

            <div className={styles.encoderPanel}>

              {/* Channel picker */}
              <div className={styles.encoderRow}>
                <span className={styles.encoderLabel}>Channel</span>
                <div className={styles.channelPicker}>
                  {CH_META.map(({ ch, label, color }) => (
                    <button
                      key={ch}
                      className={`${styles.channelBtn} ${channel === ch ? styles.channelBtnActive : ''}`}
                      style={{ '--ch-color': color }}
                      onClick={() => handleChannelChange(ch)}
                    >
                      <span className={styles.channelBtnNum}>{ch}</span>
                      <span className={styles.channelBtnLbl}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pitch slider */}
              <div className={styles.encoderRow}>
                <span className={styles.encoderLabel}>Pitch</span>
                <div className={styles.pitchControl}>
                  <span className={styles.pitchNote}>{midiToName(pitch)}</span>
                  <input
                    type="range"
                    min={0}
                    max={127}
                    value={pitch}
                    className={styles.pitchSlider}
                    style={{ '--slider-color': chInfo.color }}
                    onChange={e => setPitch(Number(e.target.value))}
                  />
                  <span className={styles.pitchNum}>{pitch}</span>
                </div>
              </div>

              {/* Mini piano keyboard */}
              <div className={styles.encoderRow}>
                <span className={styles.encoderLabel}>Piano</span>
                <div className={styles.pianoArea}>
                  <div className={styles.pianoKeyboard}>
                    {[0, 1].map(oct => {
                      const base = octaveBase + oct * 12
                      if (base > 115) return null
                      return (
                        <PianoOctave
                          key={oct}
                          base={base}
                          activePitch={pitch}
                          channelColor={chInfo.color}
                          onNote={midi => {
                            const p = Math.min(127, midi)
                            setPitch(p)
                            triggerPreviewNote(channel, p)
                          }}
                        />
                      )
                    })}
                  </div>
                  <div className={styles.octaveNav}>
                    <button
                      className={styles.octaveBtn}
                      onClick={() => setOctave(o => Math.max(0, o - 1))}
                      disabled={octave === 0}
                    >
                      ◀
                    </button>
                    <span className={styles.octaveLabel}>Octave {octave} – {octave + 1}</span>
                    <button
                      className={styles.octaveBtn}
                      onClick={() => setOctave(o => Math.min(8, o + 1))}
                      disabled={octave >= 8}
                    >
                      ▶
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className={styles.previewRow}>
                <div className={styles.tokenDisplay} style={{ '--ch-color': chInfo.color }}>
                  <span className={styles.bigToken}>{decoded.display}</span>
                  <span className={styles.bigTokenLabel}>{chInfo.label}</span>
                </div>
                <div className={styles.formulaBox}>
                  <div className={styles.formulaLine}>
                    <span className={styles.formulaKey}>Channel</span>
                    <span className={styles.formulaVal} style={{ color: chInfo.color }}>
                      {channel} — {chInfo.label}
                    </span>
                  </div>
                  <div className={styles.formulaLine}>
                    <span className={styles.formulaKey}>Pitch</span>
                    <span className={styles.formulaVal}>{pitch} ({midiToName(pitch)})</span>
                  </div>
                  {decoded.index !== null && (
                    <div className={styles.formulaLine}>
                      <span className={styles.formulaKey}>Formula</span>
                      <span className={styles.formulaVal}>{decoded.formula}</span>
                    </div>
                  )}
                  <div className={styles.formulaLine}>
                    <span className={styles.formulaKey}>Output</span>
                    <span className={styles.formulaVal} style={{ color: chInfo.color }}>
                      "{decoded.display}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Sequence controls */}
              <div className={styles.seqControls}>
                <button
                  className={styles.addBtn}
                  style={{ '--ch-color': chInfo.color }}
                  onClick={addNote}
                >
                  + Add Note
                </button>
                {sequence.length > 0 && (
                  <>
                    <button
                      className={`${styles.playSeqBtn} ${playerState === 'playing' ? styles.playSeqBtnActive : ''}`}
                      onClick={playSequence}
                      disabled={playerState === 'loading'}
                    >
                      {playerState === 'loading'
                        ? <span className={styles.spinner} />
                        : playerState === 'playing'
                          ? <StopIcon />
                          : <PlayIcon />}
                      {playerState === 'loading' ? 'Loading…' : playerState === 'playing' ? 'Stop' : 'Play'}
                    </button>
                    <button className={styles.clearBtn} onClick={() => setSequence(prev => prev.slice(0, -1))}>
                      Delete
                    </button>
                    <button className={styles.clearBtn} onClick={() => { stopPlayer(); setSequence([]) }}>
                      Clear
                    </button>
                  </>
                )}
                <span className={styles.seqHint}>
                  {channel === 6
                    ? 'Ch 6 plays as sound but is dropped by the compiler — no code output'
                    : 'Piano keys & Add Note preview the note sound'}
                </span>
              </div>

              {/* Progress bar */}
              {playerState === 'playing' && duration > 0 && (
                <div className={styles.seqProgress}>
                  <span className={styles.seqProgressTime}>{fmtTime(elapsed)}</span>
                  <div className={styles.seqProgressTrack}>
                    <div className={styles.seqProgressFill} style={{ width: `${pct}%` }} />
                    <div className={styles.seqProgressHead} style={{ left: `${pct}%` }} />
                  </div>
                  <span className={styles.seqProgressTime}>{fmtTime(duration)}</span>
                </div>
              )}

              {/* Sequence */}
              {sequence.length > 0 && (
                <>
                  <div className={styles.noteSeq}>
                    {sequence.map((n, i) => (
                      <div key={i} className={styles.noteChip} style={{ '--ch-color': n.color }}>
                        <span className={styles.noteChipCh}>Ch{n.ch}</span>
                        <span className={styles.noteChipVal}>{n.display}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.outputBox}>
                    <span className={styles.outputLabel}>Code output</span>
                    <pre className={styles.outputText}>{outputText || ' '}</pre>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ LANGUAGE GUIDE ══════════════ */}
        {section === 1 && (
          <div className={styles.layout}>
            <div className={styles.steps}>
              {STEPS.map(({ num, title, body, color, keywords }) => {
                const isOpen = expandedStep === num
                return (
                  <div key={num} className={`${styles.step} ${isOpen ? styles.stepOpen : ''}`}>
                    <button
                      className={styles.stepHeader}
                      onClick={() => setExpandedStep(isOpen ? null : num)}
                      aria-expanded={isOpen}
                    >
                      <div className={styles.stepNum} style={{ color }}>{num}</div>
                      <div className={styles.stepContent}>
                        <h3 className={styles.stepTitle}>{title}</h3>
                        <p className={styles.stepBody}>{body}</p>
                      </div>
                      <div
                        className={`${styles.stepChevron} ${isOpen ? styles.stepChevronOpen : ''}`}
                        style={{ color }}
                      >
                        ›
                      </div>
                    </button>

                    <div className={`${styles.stepDetails} ${isOpen ? styles.stepDetailsOpen : ''}`}>
                      <div className={styles.stepDetailsInner}>
                        <div className={styles.kwTable}>
                          {keywords.map(({ kw, meaning }) => (
                            <div key={kw} className={styles.kwRow}>
                              <code className={styles.kwCode} style={{ '--kw-color': color }}>{kw}</code>
                              <span className={styles.kwMeaning}>{meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={styles.stepLine} style={{ background: color }} />
                  </div>
                )
              })}
            </div>

            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <div className={styles.codeDots}>
                  <span style={{ background: '#ff5f57' }} />
                  <span style={{ background: '#febc2e' }} />
                  <span style={{ background: '#28c840' }} />
                </div>
                <div className={styles.tabs}>
                  {LANG_TABS.map((tab, i) => (
                    <button
                      key={tab.label}
                      className={`${styles.tab} ${i === activeTab ? styles.tabActive : ''}`}
                      onClick={() => setActiveTab(i)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <pre className={styles.code}>
                <code><HighlightedCode code={LANG_TABS[activeTab].code} /></code>
              </pre>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className={styles.cta}>
          <div className={styles.ctaCard}>
            <h3 className={styles.ctaTitle}>Ready to compose?</h3>
            <p className={styles.ctaBody}>
              Explore the full Groovy source on GitHub — fork it, extend the grammar, or write
              your own programs.
            </p>
            <div className={styles.ctaActions}>
              <a
                href="https://github.com/jdillon96/Groovy"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaBtn}
              >
                View on GitHub
              </a>
              <a href="#description" className={styles.ctaBtnGhost}>
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────
function PlayIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z" /></svg>
}
function StopIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
}
