import styles from './Description.module.css'

const FEATURES = [
  {
    icon: '◈',
    color: 'var(--cyan)',
    title: 'What is it?',
    body: 'Groovy is an esoteric programming language where MIDI is the source code. Instead of typing text, you build your own midi file. The compiler turns those notes into a working JavaScript program. Every Groovy program is simultaneously a piece of music you can listen to and a program a computer can run.',
  },
  {
    icon: '◉',
    color: 'var(--violet)',
    title: 'How it works',
    body: 'Programs are made by placing notes in a digital editor, with the channel a note lives on determining what kind of character it produces, and the pitch selecting the specific character via modulo arithmetic. Export the MIDI, run it through Groovy, and your performance becomes source code that compiles to JavaScript. A MIDI file contains 16 channels, with channels 1-4 encoding keywords, letters, digits, and punctuation, and channels 5-16 reserved for whitespaces, comments, and unicode characters',
  },
  {
    icon: '◆',
    color: 'var(--pink)',
    title: 'Who is it for?',
    body: 'Groovy is to give people a new way to think about programming. It\'s for musicians curious about programming, developers interested in unconventional language design, and students studying compilers or formal languages. If you\'ve ever wondered what your code would sound like or what a melody could look like as a running program, then this is for you.',
  },
  {
    icon: '◇',
    color: 'var(--lime)',
    title: 'Key goals',
    body: 'We want to find a way to prove that audio can serve as a programming medium, and to build a real, featured language (variables, functions, structs, loops, type checking) on top of that idea. We also want to make the whole thing interactive so that anyone can write Groovy code and hear it play right in the browser.',
  },
]


export default function Description() {
  return (
    <section id="description" className={styles.section}>
      <div className={styles.container}>
        <p className="section-label">About the Project</p>

        <div className={styles.header}>
          <h2 className={styles.title}>
            The development of <br />
            <span className={styles.accent}>Building a Language</span>
          </h2>
          <p className={styles.lead}>
            No matter who you are or where you're from, music is globally understood and enjoyed. It crosses language barriers, cultures, and borders. It's one of the few things that truly belongs to everyone.

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
            {['Note', 'key', 'chord', 'compose', 'fin', 'play', 'cue', 'alt', 'drop', 'vamp', 'ghost', 'open'].map((w, i) => (
              <span key={i} className={styles.bannerItem}>{w}</span>
            ))}
            {['Note', 'key', 'chord', 'compose', 'fin', 'play', 'cue', 'alt', 'drop', 'vamp', 'ghost', 'open', 'silence'].map((w, i) => (
              <span key={`dup-${i}`} className={styles.bannerItem}>{w}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
