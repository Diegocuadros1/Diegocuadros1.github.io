export const midi_files = [
    {
        title: "count",
        url: "/midi/count.mid",
        description: "A simple MIDI file that counts from 1 to 10 using a Groovy range loop.",
        groovy: `measure i from 1 to 10:
    play i
cadence`,
        js: `for (let i_1 = 1; i_1 <= 10; i_1++) {
    console.log(i_1);
}`
    },
    {
        title: "varops",
        url: "/midi/varops.mid",
        description: "A MIDI example showing variable assignment, arithmetic, pitch adjustment, and note playback.",
        groovy: `note x = 5
key y = 3
note z = x + y
x = z - 1
note w = z / 2
x sharp
x flat
play x
play w`,
        js: `let x = 5;
let y = 3;
let z = x + y;
x = z - 1;
let w = z / 2;
// apply pitch adjustments to x
const xSharp = x + 1;
const xFlat = x - 1;
console.log(xSharp);
console.log(w);`
    },
    {
        title: "branching",
        url: "/midi/branching.mid",
        description: "A MIDI branch example with conditional cue/alt/drop control flow based on comparisons.",
        groovy: `note a = 8
note b = closed
cue a >= 5:
    play a
alt a == 8:
    play 0
drop:
    play b
cadence`,
        js: `const a = 8;
const b = "closed";
if (a >= 5) {
    console.log(a);
} else if (a == 8) {
    console.log(0);
} else {
    console.log(b);
}`
    },
    {
        title: "loops",
        url: "/midi/loops.mid",
        description: "A MIDI loop example combining a vamp loop, nested cue condition, encore, and array iteration.",
        groovy: `note n = 0
vamp n <= 3:
    cue n == 2:
        cut
    cadence
    n sharp
cadence
encore 3:
    play n
cadence
note arr = [1,2,3]
measure x in arr:
    play x
cadence`,
        js: `let n = 0;
while (n <= 3) {
    if (n == 2) {
        break;
    }
    n += 1;
}
for (const x of [1, 2, 3]) {
    console.log(x);
}`
    },
    {
        title: "functions",
        url: "/midi/functions.mid",
        description: "A MIDI example defining two Groovy functions and using them to compute and play values.",
        groovy: `compose log(n:level)->silence:
    play n
    fin
cadence
log(7)
compose add(a:level,b:level)->level:
    fin a + b
cadence
note r = add(3,4)
play r`,
        js: `function log(n) {
    console.log(n);
}
log(7);
function add(a, b) {
    return a + b;
}
const r = add(3, 4);
console.log(r);`
    },
    {
        title: "advanced",
        url: "/midi/advanced.mid",
        description: "A more advanced MIDI program with custom chords, arrays, indexing, exponentiation, and modulo arithmetic.",
        groovy: `chord Pt:
    v : level
cadence
note a = [10,20,30]
note n = a[0]
note p = n ^ 2
play p
note j = p % n
play j`,
        js: `const a = [10, 20, 30];
const n = a[0];
const p = n ** 2;
console.log(p);
const j = p % n;
console.log(j);`
    }
];
