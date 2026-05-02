import { Midi } from '@tonejs/midi'
import MidiWriter from 'midi-writer-js'
import { REVERSE_MAP } from './compiler/preProcessing.js'

const dictionary = Array.from(REVERSE_MAP.keys()).sort((a, b) => b.length - a.length)

// Builds a MIDI track using the same channel/pitch encoding as the Groovy compiler's
// textToMidi.js, then converts the binary buffer into a @tonejs/midi Midi object
// so it can be played directly by the useMidiPlayer hook.
export function generateMidi(sourceCode) {
  const track = new MidiWriter.Track()

  let i = 0
  while (i < sourceCode.length) {
    let matched = false

    for (const token of dictionary) {
      if (sourceCode.startsWith(token, i)) {
        const { channel, pitch } = REVERSE_MAP.get(token)

        track.addEvent(
          new MidiWriter.NoteEvent({
            pitch: [pitch],
            duration: "8",
            channel: channel + 1,
            velocity: 100,
          })
        )

        i += token.length
        matched = true
        break
      }
    }

    if (!matched) {
      const codepoint = sourceCode.codePointAt(i)
      const velocity = codepoint % 128
      const remainder = Math.floor(codepoint / 128)
      const pitch = remainder % 128

      let channel = Math.floor(remainder / 128) + 7
      if (channel > 15) channel = 15

      // Bypass midi-writer-js's percentage rounding to preserve exact base-128 data
      const writerVelocity = Math.max(1, velocity / 1.27)

      track.addEvent(
        new MidiWriter.NoteEvent({
          pitch: [pitch],
          duration: "8",
          channel: channel + 1,
          velocity: writerVelocity,
        })
      )

      i += codepoint > 0xffff ? 2 : 1
    }
  }

  const writer = new MidiWriter.Writer(track)
  return new Midi(writer.buildFile())
}

export function noteCount(sourceCode) {
  let count = 0
  let i = 0
  while (i < sourceCode.length) {
    let matched = false
    for (const token of dictionary) {
      if (sourceCode.startsWith(token, i)) {
        count++
        i += token.length
        matched = true
        break
      }
    }
    if (!matched) {
      const codepoint = sourceCode.codePointAt(i)
      count++
      i += codepoint > 0xffff ? 2 : 1
    }
  }
  return count
}
