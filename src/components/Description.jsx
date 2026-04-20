import styles from './Description.module.css'

const FEATURES = [
  {
    icon: '◈',
    color: 'var(--cyan)',
    title: 'What is it?',
    body: 'Groovy is a programming language where MIDI is the source code. Instead of typing text, you play music — and the compiler turns those notes into a working JavaScript program. Every Groovy program is simultaneously a piece of music you can listen to and a program a computer can run.',
  },
  {
    icon: '◉',
    color: 'var(--violet)',
    title: 'How it works',
    body: 'A MIDI file has multiple channels. Groovy assigns each one a role: Channel 1 notes decode into keywords (compose, cadence, vamp…), Channel 2 into letters for identifiers, Channel 3 into digits and operators, Channel 4 into punctuation. The pitch of each note selects the exact character via modulo arithmetic. Silence between notes becomes whitespace — a short gap is a space, a longer pause is a newline. The decoded text then flows through a full compiler pipeline: parse → analyze → optimize → generate JavaScript.',
  },
  {
    icon: '◆',
    color: 'var(--pink)',
    title: 'Who is it for?',
    body: 'Groovy lives at the intersection of music and code. It\'s for musicians curious about programming, developers interested in unconventional language design, and students studying compilers or formal languages. If you\'ve ever wondered what your code would sound like — or what a melody could look like as a running program — this is for you.',
  },
  {
    icon: '◇',
    color: 'var(--lime)',
    title: 'Key goals',
    body: 'Prove that audio can serve as a programming medium. Build a real, full-featured language (variables, functions, structs, loops, type checking) on top of that idea. Explore compiler construction through a hands-on project for CMSI 3802 at LMU. And make the whole thing interactive — so anyone can write Groovy code and hear it play, right in the browser.',
  },
]

export default function Description() {
  return (
    <section id="description" className={styles.section}>
      <div className={styles.container}>
        <p className="section-label">About the Project</p>

        <div className={styles.header}>
          <h2 className={styles.title}>
            Built at the edge of<br />
            <span className={styles.accent}>sound & code</span>
          </h2>
          <p className={styles.lead}>
            Groovy is a language where music is the source code. Play the right notes
            in the right order, and the compiler turns your performance into a running JavaScript program.
          </p>
        </div>

        <div className={styles.grid}>
          {FEATURES.map(({ icon, color, title, body }) => (
            <div key={title} className={styles.card}>
              <div className={styles.cardMeta}>
                <span className={styles.cardIcon} style={{ color }}>{icon}</span>
                <h3 className={styles.cardTitle}>{title}</h3>
              </div>
              <p className={styles.cardBody}>{body}</p>
              <div className={styles.cardGlow} style={{ background: color }} />
            </div>
          ))}
        </div>

        <div className={styles.banner}>
          <div className={styles.bannerTrack}>
            {['MIDI', 'COMPOSE', 'CADENCE', 'MEASURE', 'VAMP', 'ENCORE', 'PLAY', 'GROOVY'].map((w, i) => (
              <span key={i} className={styles.bannerItem}>{w}</span>
            ))}
            {['MIDI', 'COMPOSE', 'CADENCE', 'MEASURE', 'VAMP', 'ENCORE', 'PLAY', 'GROOVY'].map((w, i) => (
              <span key={`dup-${i}`} className={styles.bannerItem}>{w}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
