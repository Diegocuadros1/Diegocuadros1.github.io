import * as ohm from 'ohm-js'
// Vite inlines the .ohm file as a string at build time — no Node fs needed
import grammarSource from '/src/groovy.ohm?raw'

const grammar = ohm.grammar(grammarSource)

// Returns { ok: true } or { ok: false, error: string }
export function validateGroovy(source) {
  const match = grammar.match(source)
  if (match.failed()) {
    return { ok: false, error: match.message }
  }
  return { ok: true, error: null }
}
