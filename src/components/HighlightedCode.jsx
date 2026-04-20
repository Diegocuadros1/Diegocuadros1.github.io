import styles from './HighlightedCode.module.css'

const KEYWORDS = new Set([
  'note','key','chord','play','measure','from','to','vamp','encore','cut',
  'compose','fin','cadence','cue','alt','drop','gate','open','closed','ghost',
  'level','lyric','silence','noise','sqrt','hypot','sharp','flat',
])

function tokenize(code) {
  const tokens = []
  let i = 0

  while (i < code.length) {
    // Line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      let j = i
      while (j < code.length && code[j] !== '\n') j++
      tokens.push({ type: 'comment', value: code.slice(i, j) })
      i = j
      continue
    }

    // String literal
    if (code[i] === '"') {
      let j = i + 1
      while (j < code.length && code[j] !== '"' && code[j] !== '\n') j++
      const end = code[j] === '"' ? j + 1 : j
      tokens.push({ type: 'string', value: code.slice(i, end) })
      i = end
      continue
    }

    // Number literal
    if (/\d/.test(code[i])) {
      let j = i
      while (j < code.length && /[\d.]/.test(code[j])) j++
      tokens.push({ type: 'number', value: code.slice(i, j) })
      i = j
      continue
    }

    // Word — keyword or identifier
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++
      const word = code.slice(i, j)
      tokens.push({ type: KEYWORDS.has(word) ? 'keyword' : 'plain', value: word })
      i = j
      continue
    }

    // Everything else — merge into the previous plain token when possible
    if (tokens.length > 0 && tokens[tokens.length - 1].type === 'plain') {
      tokens[tokens.length - 1].value += code[i]
    } else {
      tokens.push({ type: 'plain', value: code[i] })
    }
    i++
  }

  return tokens
}

export default function HighlightedCode({ code }) {
  return (
    <>
      {tokenize(code).map((tok, i) => (
        <span key={i} className={styles[tok.type]}>{tok.value}</span>
      ))}
    </>
  )
}
