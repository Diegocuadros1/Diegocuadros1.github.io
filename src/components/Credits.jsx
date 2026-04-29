import styles from './Credits.module.css'

const CREDITS = [
  {
    role: 'Developer and Project Lead',
    name: 'Jay Dillon',
    detail: '',
    color: 'var(--cyan)',
  },
  {
    role: 'Developer',
    name: 'Diego Cuadros',
    detail: '',
    color: 'var(--violet)',
  },
  {
    role: 'Developer',
    name: 'Jesus Lopez',
    detail: '',
    color: 'var(--pink)',
  },
  {
    role: 'Developer',
    name: 'Westley Holmes',
    detail: '',
    color: 'var(--lime)',
  },
  {
    role: 'Special Thanks',
    name: 'Ray Toal',
    detail: 'Inspired and motivated the project',
    color: 'var(--yellow)',
  },
]

export default function Credits() {
  return (
    <section id="credits" className={styles.section}>
      <div className={styles.container}>
        <p className="section-label">Acknowledgements</p>

        <h2 className={styles.title}>
          <span className={styles.accent}>Credits</span>
        </h2>

        <div className={styles.grid}>
          {CREDITS.map(({ role, name, detail, color }) => (
            <div key={role} className={styles.card}>
              <div className={styles.cardAccent} style={{ background: color }} />
              <p className={styles.role} style={{ color }}>{role}</p>
              <h3 className={styles.name}>{name}</h3>
              <p className={styles.detail}>{detail}</p>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLogo}>
            <img src="/logo.png" alt="Logo" className={styles.footerLogoImg} />
            <span className={styles.footerBrand}>GROOVY</span>
          </div>
          <p className={styles.footerText}>
            April 2026 | Made with 💜 by the Groovy Team
          </p>
          <div className={styles.footerLinks}>
            <a
              href="https://github.com/jdillon96/Groovy"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              GitHub
            </a>
            <span className={styles.footerDot} />
            <a href="#hero" className={styles.footerLink}>
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
