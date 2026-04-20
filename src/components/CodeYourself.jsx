import styles from './CodeYourself.module.css'

const STEPS = [
  {
    num: '01',
    title: 'Step One',
    body: 'Placeholder — describe the first step a user should take to start coding or using the project themselves.',
    color: 'var(--cyan)',
  },
  {
    num: '02',
    title: 'Step Two',
    body: 'Placeholder — explain what comes next. Installation? Configuration? A starter template? Be specific.',
    color: 'var(--violet)',
  },
  {
    num: '03',
    title: 'Step Three',
    body: 'Placeholder — guide them toward a working example or first experiment. What does success look like?',
    color: 'var(--pink)',
  },
  {
    num: '04',
    title: 'Go Further',
    body: 'Placeholder — point to documentation, community resources, or advanced use cases for those who want more.',
    color: 'var(--lime)',
  },
]

const CODE_SNIPPET = `// Placeholder — replace with a real code example
// that shows the core API or usage of your project.

import { YourLibrary } from 'your-library'

const instance = new YourLibrary({
  option: 'value',
  // more options here...
})

// Do something cool
instance.doSomething()
  .then(result => console.log(result))
`

export default function CodeYourself() {
  return (
    <section id="code-yourself" className={styles.section}>
      <div className={styles.container}>
        <p className="section-label">Get Started</p>

        <h2 className={styles.title}>
          Code it <span className={styles.accent}>yourself</span>
        </h2>
        <p className={styles.lead}>
          Placeholder — encourage users to try the project themselves.
          What can they build, remix, or learn? Give them a reason to dive in.
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
              <span className={styles.codeLang}>javascript</span>
            </div>
            <pre className={styles.code}><code>{CODE_SNIPPET}</code></pre>
          </div>
        </div>

        <div className={styles.cta}>
          <div className={styles.ctaCard}>
            <h3 className={styles.ctaTitle}>Ready to build?</h3>
            <p className={styles.ctaBody}>
              Placeholder — add a call to action. Link to the repo, docs, or a tutorial.
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
