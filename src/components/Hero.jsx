import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
        <div className={styles.grid} />
      </div>

      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <div className={styles.logoRing} />
          <img src="./logo.png" alt="groovy Logo" className={styles.logoImg} />
        </div>


        <p className={styles.eyebrow}>
          <span className={styles.dot} />
          Music In &gt; Software Out
        </p>

        <h1 className={styles.headline}>
          <span className={styles.gradientText}>GROOVY</span>
        </h1>

        <p className={styles.sub}>
          Programming Languages and Automata<br />
          <em>Building a compiler that takes in audio input and converts it into executable code.</em>
        </p>

        <div className={styles.actions}>
          <a href="#description" className={styles.btnPrimary}>
            Explore the Project
          </a>
          <a href="#examples" className={styles.btnGhost}>
            Listen &rarr;
          </a>
        </div>

        <div className={styles.eq}>
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className={styles.eqBar}
              style={{ '--delay': `${(i * 0.11).toFixed(2)}s`, '--h': `${20 + Math.sin(i * 0.8) * 18 + Math.random() * 20}px` }}
            />
          ))}
        </div>
      </div>

      <div className={styles.scrollHint}>
        <span />
        scroll
      </div>
    </section>
  )
}
