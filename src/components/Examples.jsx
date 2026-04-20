import { useState, useRef, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'
import { midi_files } from '../data/data'
import { encodeGroovy, noteCount } from '../encoder'
import HighlightedCode from './HighlightedCode'
import { validateGroovy } from '../validator'
import styles from './Examples.module.css'

// ─── Shared MIDI engine ────────────────────────────────────────────────────

function useMidiPlayer() {
  const [state, setState] = useState('idle') // idle | loading | playing
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(0)
  const synthsRef = useRef([])
  const partsRef = useRef([])
  const intervalRef = useRef(null)
  const startRef = useRef(0)
  const midiRef = useRef(null)

  const teardown = useCallback(() => {
    partsRef.current.forEach(p => { try { p.dispose() } catch {} })
    partsRef.current = []
    synthsRef.current.forEach(s => { try { s.dispose() } catch {} })
    synthsRef.current = []
    clearInterval(intervalRef.current)
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
  }, [])

  const stop = useCallback(() => {
    teardown()
    setState('idle')
    setElapsed(0)
  }, [teardown])

  // Shared scheduling logic — takes a parsed Midi object and starts playback
  const _run = useCallback((midi) => {
    setDuration(midi.duration)
    Tone.getTransport().cancel()
    Tone.getTransport().stop()

    const parts = []
    const synths = []
    midi.tracks.forEach(track => {
      if (!track.notes.length) return
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.8 },
        volume: -14,
      }).toDestination()
      synths.push(synth)
      const part = new Tone.Part((time, note) => {
        synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
      }, track.notes.map(n => ({ time: n.time, name: n.name, duration: n.duration, velocity: n.velocity })))
      part.start(0)
      parts.push(part)
    })
    partsRef.current = parts
    synthsRef.current = synths
    startRef.current = Date.now()
    Tone.getTransport().start()
    setState('playing')

    intervalRef.current = setInterval(() => {
      const e = (Date.now() - startRef.current) / 1000
      setElapsed(Math.min(e, midi.duration))
      if (e >= midi.duration) { teardown(); setState('idle'); setElapsed(0) }
    }, 200)
  }, [teardown])

  // Play from a URL (fetches + parses MIDI file)
  const play = useCallback(async (url) => {
    if (state === 'playing') { stop(); return }
    setState('loading')
    try {
      await Tone.start()
      if (!midiRef.current || midiRef.current._url !== url) {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buf = await res.arrayBuffer()
        const midi = new Midi(buf)
        midi._url = url
        midiRef.current = midi
      }
      _run(midiRef.current)
    } catch (err) {
      console.error('MIDI error:', err)
      setState('idle')
    }
  }, [state, stop, _run])

  // Play from an already-built @tonejs/midi Midi object (used by the encoder)
  const playMidi = useCallback(async (midi) => {
    if (state === 'playing') { stop(); return }
    setState('loading')
    try {
      await Tone.start()
      _run(midi)
    } catch (err) {
      console.error('MIDI error:', err)
      setState('idle')
    }
  }, [state, stop, _run])

  useEffect(() => () => teardown(), [teardown])

  return { state, elapsed, duration, play, playMidi, stop }
}

// ─── Progress bar ──────────────────────────────────────────────────────────

function ProgressBar({ elapsed, duration }) {
  const pct = duration > 0 ? (elapsed / duration) * 100 : 0
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  return (
    <div className={styles.progressRow}>
      <span className={styles.timeLabel}>{fmt(elapsed)}</span>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
        <div className={styles.head} style={{ left: `${pct}%` }} />
      </div>
      <span className={styles.timeLabel}>{fmt(duration)}</span>
    </div>
  )
}

// ─── Code block with Groovy / JS sub-tabs ─────────────────────────────────

function CodeBlock({ groovy, js }) {
  const [lang, setLang] = useState('groovy')
  const code = lang === 'groovy' ? groovy : js

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <div className={styles.codeDots}>
          <span style={{ background: '#ff5f57' }} />
          <span style={{ background: '#febc2e' }} />
          <span style={{ background: '#28c840' }} />
        </div>
        <div className={styles.codeTabs}>
          <button
            className={`${styles.codeTab} ${lang === 'groovy' ? styles.codeTabActive : ''}`}
            onClick={() => setLang('groovy')}
          >
            <GroovyIcon /> groovy
          </button>
          <button
            className={`${styles.codeTab} ${lang === 'js' ? styles.codeTabActive : ''}`}
            onClick={() => setLang('js')}
          >
            <JsIcon /> javascript
          </button>
        </div>
      </div>
      <pre className={styles.pre}><code className={styles.code}>
        {lang === 'groovy' ? <HighlightedCode code={code} /> : code}
      </code></pre>
    </div>
  )
}

// ─── Single song tab panel ─────────────────────────────────────────────────

function SongPanel({ entry }) {
  const { state, elapsed, duration, play } = useMidiPlayer()
  const playing = state === 'playing'
  const loading = state === 'loading'

  return (
    <div className={styles.panel}>
      <p className={styles.panelDesc}>{entry.description}</p>

      <div className={styles.playerCard}>
        <div className={styles.playerCardInner}>
          <button
            className={`${styles.bigPlayBtn} ${playing ? styles.bigPlayBtnActive : ''}`}
            onClick={() => play(entry.url)}
            disabled={loading}
            aria-label={playing ? 'Stop' : 'Play'}
          >
            {loading ? <SpinnerIcon /> : playing ? <StopIcon /> : <PlayIcon />}
          </button>
          <div className={styles.playerMeta}>
            <span className={styles.playerTitle}>{entry.title}</span>
            <span className={styles.playerStatus}>
              {loading ? 'Loading…' : playing ? 'Now playing' : 'Ready to play'}
            </span>
          </div>
        </div>
        <ProgressBar elapsed={elapsed} duration={duration} />
        <div className={styles.eqRow}>
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className={`${styles.eqBar} ${playing ? styles.eqBarActive : ''}`}
              style={{ '--i': i }}
            />
          ))}
        </div>
      </div>

      <CodeBlock groovy={entry.groovy} js={entry.js} />
    </div>
  )
}

// ─── Add-your-own panel ────────────────────────────────────────────────────

const DEFAULT_CODE = `// Each character maps to a MIDI note — hear your code!
note x = 10
note y = 3

cue x > y:
  play x
drop:
  play y
cadence

compose double(n: level) -> level:
  fin n + n
cadence

measure i from 1 to 4:
  play double(i)
cadence`

function AddYourOwnPanel() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [error, setError] = useState(null)
  const { state, elapsed, duration, playMidi, stop } = useMidiPlayer()
  const playing = state === 'playing'
  const loading = state === 'loading'
  const count = noteCount(code)

  const handlePlay = useCallback(() => {
    if (playing) { stop(); return }
    const result = validateGroovy(code)
    if (!result.ok) { setError(result.error); return }
    setError(null)
    playMidi(encodeGroovy(code))
  }, [playing, stop, code, playMidi])

  return (
    <div className={`${styles.panel} ${styles.panelOwn}`}>
      <div className={styles.ownGlow1} />
      <div className={styles.ownGlow2} />
      <div className={styles.ownGlow3} />

      <div className={styles.editorWrap}>
        <p className={styles.editorLabel}>
          Every character in your Groovy code maps to a MIDI note on a dedicated channel — keywords, letters,
          digits, and punctuation each get their own pitch range. Write a program and hear it play.
        </p>

        <div className={styles.editorBox}>
          <div className={styles.editorHeader}>
            <div className={styles.editorDots}>
              <span style={{ background: '#ff5f57' }} />
              <span style={{ background: '#febc2e' }} />
              <span style={{ background: '#28c840' }} />
            </div>
            <span className={styles.editorLang}>groovy</span>
          </div>
          <textarea
            className={styles.editorTextarea}
            value={code}
            onChange={e => { setCode(e.target.value); setError(null) }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        <div className={styles.editorActions}>
          <button
            className={`${styles.playEncodeBtn} ${playing ? styles.playEncodeBtnActive : ''}`}
            onClick={handlePlay}
            disabled={loading || !code.trim()}
          >
            {loading ? <SpinnerIcon /> : playing ? <StopIcon /> : <PlayIcon />}
            {loading ? 'Encoding…' : playing ? 'Stop' : 'Play'}
          </button>
          <button
            className={styles.clearBtn}
            onClick={() => { stop(); setCode('') }}
          >
            Clear
          </button>
          <span className={styles.noteCount}>{count} note{count !== 1 ? 's' : ''}</span>
        </div>

        {error && (
          <pre className={styles.syntaxError}>{error}</pre>
        )}

        {(playing || loading) && (
          <div className={styles.playerCard}>
            <div className={styles.playerCardInner}>
              <div className={`${styles.bigPlayBtn} ${playing ? styles.bigPlayBtnActive : ''}`} style={{ cursor: 'default' }}>
                {loading ? <SpinnerIcon /> : <StopIcon />}
              </div>
              <div className={styles.playerMeta}>
                <span className={styles.playerTitle}>My Composition</span>
                <span className={styles.playerStatus}>{loading ? 'Encoding…' : 'Now playing'}</span>
              </div>
            </div>
            <ProgressBar elapsed={elapsed} duration={duration} />
            <div className={styles.eqRow}>
              {[...Array(24)].map((_, i) => (
                <div key={i} className={`${styles.eqBar} ${playing ? styles.eqBarActive : ''}`} style={{ '--i': i }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Examples section ─────────────────────────────────────────────────

export default function Examples() {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = [...midi_files, { title: 'Add-your-own', _own: true }]

  return (
    <section id="examples" className={styles.section}>
      <div className={styles.container}>
        <p className="section-label">Listen &amp; Explore</p>
        <h2 className={styles.title}>
          MIDI <span className={styles.accent}>Playground</span>
        </h2>
        <p className={styles.lead}>
          Explore MIDI examples and see the Groovy source behind each song.
          Flip between Groovy and JavaScript to compare.
        </p>

        <div className={styles.tabBar}>
          {tabs.map((t, i) => (
            <button
              key={t.title}
              className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''} ${t._own ? styles.tabOwn : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {t._own && <span className={styles.tabOwnDot} />}
              {t.title}
            </button>
          ))}
          <div className={styles.tabIndicator} style={{ '--count': tabs.length, '--idx': activeTab }} />
        </div>

        <div className={styles.tabContent}>
          {tabs[activeTab]._own
            ? <AddYourOwnPanel />
            : <SongPanel key={tabs[activeTab].title} entry={tabs[activeTab]} />
          }
        </div>
      </div>
    </section>
  )
}

// ─── Icons ─────────────────────────────────────────────────────────────────

function PlayIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z" /></svg>
}
function StopIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
}
function SpinnerIcon() {
  return <span className={styles.spinner} />
}
function GroovyIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" /><circle cx="6" cy="6" r="2" fill="currentColor" /></svg>
}
function JsIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect width="12" height="12" rx="2" fill="currentColor" opacity="0.2"/><text x="2" y="10" fontSize="8" fontWeight="bold" fill="currentColor" fontFamily="monospace">JS</text></svg>
}
