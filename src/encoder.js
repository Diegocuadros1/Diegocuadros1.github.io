import { Midi } from '@tonejs/midi'

// Must match the order in preProcessing.js getKeyword()
const KEYWORDS = [
  'note', 'key', 'chord', 'play', 'measure', 'from', 'to', 'vamp', 'encore', 'cut',
  'compose', 'fin', 'cadence', 'cue', 'alt', 'drop', 'gate', 'open', 'closed', 'ghost',
  'level', 'lyric', 'silence', 'noise', 'sqrt', 'hypot', 'sharp', 'flat',
]
const ALPHABET  = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MATH_CHARS = '0123456789.+-*/%^='
const SPECIALS   = `{}()[],;:<>!?&|"'\\_@#$~\``

// Octave offsets keep each channel in a distinct, audible pitch range
const OFFSET = { 1: 48, 2: 48, 3: 60, 4: 72 }

const NOTE_DUR   = 0.19
const NOTE_GAP   = 0.1
const GAP_SPACE  = 0.35
const GAP_NEWLINE = 2.7

function isAlnum(c) {
  return c !== undefined && /[a-zA-Z0-9_]/.test(c)
}

// Tokenize Groovy source into [{channel, pitch, gap}] note descriptors.
// gap = seconds of silence before this note (mirrors preProcessing.js time-gap logic).
function tokenize(source) {
  const notes = []
  let i = 0
  let pending = 0 // gap accumulated from whitespace before the next token

  while (i < source.length) {
    const ch = source[i]

    // Line comments — skip to newline
    if (ch === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++
      continue
    }

    // Whitespace — accumulate gap (take the larger of space/newline)
    if (ch === '\n')            { pending = Math.max(pending, GAP_NEWLINE); i++; continue }
    if (ch === ' ' || ch === '\t') { pending = Math.max(pending, GAP_SPACE);  i++; continue }

    // Keyword — longest-match, word-boundary check
    const kw = KEYWORDS.find(k => source.startsWith(k, i) && !isAlnum(source[i + k.length]))
    if (kw) {
      notes.push({ channel: 1, pitch: KEYWORDS.indexOf(kw), gap: pending })
      pending = 0
      i += kw.length
      continue
    }

    // Letter (a-z A-Z)
    const ai = ALPHABET.indexOf(ch)
    if (ai !== -1) { notes.push({ channel: 2, pitch: ai, gap: pending }); pending = 0; i++; continue }

    // Math / digit
    const mi = MATH_CHARS.indexOf(ch)
    if (mi !== -1) { notes.push({ channel: 3, pitch: mi, gap: pending }); pending = 0; i++; continue }

    // Punctuation
    const si = SPECIALS.indexOf(ch)
    if (si !== -1) { notes.push({ channel: 4, pitch: si, gap: pending }); pending = 0; i++; continue }

    // Unknown char (e.g. `"`, `!`) — skip silently
    i++
  }

  return notes
}

function buildMidi(notes) {
  const midi = new Midi()

  // One track per channel so the player can route them independently
  const tracks = {}
  for (let ch = 1; ch <= 4; ch++) {
    const t = midi.addTrack()
    t.channel = ch
    tracks[ch] = t
  }

  let time = 0
  for (const n of notes) {
    time += n.gap
    tracks[n.channel].addNote({
      midi: Math.min(127, n.pitch + OFFSET[n.channel]),
      time,
      duration: NOTE_DUR,
      velocity: 0.8,
    })
    time += NOTE_DUR + NOTE_GAP
  }

  return midi
}

export function encodeGroovy(source) {
  return buildMidi(tokenize(source))
}

export function noteCount(source) {
  return tokenize(source).length
}
