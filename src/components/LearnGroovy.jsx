import { useState } from 'react'
import styles from './LearnGroovy.module.css'
import HighlightedCode from './HighlightedCode'

const STEPS = [
  {
    num: '01',
    title: 'Variables & Types',
    body: 'Use note for mutable variables and key for constants. Types are inferred — no annotation on the declaration. Type names (level, lyric, gate…) only appear in function parameters and struct fields.',
    color: 'var(--cyan)',
  },
  {
    num: '02',
    title: 'Functions',
    body: 'Declare functions with compose. Each parameter is written as name: Type. Specify a return type with -> Type. Return a value with fin and close the body with cadence.',
    color: 'var(--violet)',
  },
  {
    num: '03',
    title: 'Control Flow',
    body: 'Branch with cue (if), alt (else if), and drop (else). Loop with vamp (while), encore (do-while), or measure (range / for-each). Exit a loop early with cut.',
    color: 'var(--pink)',
  },
  {
    num: '04',
    title: 'Structs & Arrays',
    body: 'Define custom shapes with chord. Array types are written [Type] and array literals are [a, b, c]. Use ?? to supply a fallback when an optional (ghost) value is silence.',
    color: 'var(--lime)',
  },
]

const TABS = [
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

export default function LearnGroovy() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section id="code-yourself" className={styles.section}>
      <div className={styles.container}>
        <p className="section-label">Syntax Guide</p>

        <h2 className={styles.title}>
          Learn <span className={styles.accent}>Groovy</span>
        </h2>
        <p className={styles.lead}>
          Groovy is a music-themed programming language with a clean, expressive syntax.
          Every keyword is borrowed from music — compose a function, play a value, vamp through a loop.
        </p>

        <div className={styles.layout}>
          <div className={styles.steps}>
            {STEPS.map(({ num, title, body, color }) => (
              <div key={num} className={styles.step}>
                <div className={styles.stepNum} style={{ color }}>{num}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{title}</h3>
                  <p className={styles.stepBody}>{body}</p>
                </div>
                <div className={styles.stepLine} style={{ background: color }} />
              </div>
            ))}
          </div>

          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <div className={styles.codeDots}>
                <span style={{ background: '#ff5f57' }} />
                <span style={{ background: '#febc2e' }} />
                <span style={{ background: '#28c840' }} />
              </div>
              <div className={styles.tabs}>
                {TABS.map((tab, i) => (
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
            <pre className={styles.code}><code><HighlightedCode code={TABS[activeTab].code} /></code></pre>
          </div>
        </div>

        <div className={styles.cta}>
          <div className={styles.ctaCard}>
            <h3 className={styles.ctaTitle}>Ready to compose?</h3>
            <p className={styles.ctaBody}>
              Explore the full Groovy source on GitHub — fork it, extend the grammar, or write your own programs.
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
