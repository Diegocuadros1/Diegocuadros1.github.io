import * as ohm from "ohm-js"
import grammarSource from "/src/groovy.ohm?raw"

const grammar = ohm.grammar(grammarSource)

export default function parse(sourceCode, sourceMap = []) {
  const match = grammar.match(sourceCode)

  if (match.failed()) {
    const errorIndex = match.rightmostFailurePosition ?? 99999
    const reversedMap = [...sourceMap].reverse()
    const errorData = reversedMap.find(entry => entry.index <= errorIndex)

    let errorMessage = `\nSYNTAX ERROR\n${match.message}\n`

    if (errorData) {
      errorMessage += `\nAUDIO TRACEBACK:\nTimestamp: ${errorData.time}s\nChannel:   ${errorData.channel}\nPitch:     ${errorData.pitch}\nCharacter: '${errorData.char}'\n`
    }

    throw new Error(errorMessage)
  }

  return match
}
