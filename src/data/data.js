export const midi_files = [
    {
        title: "hello",
        url: "/midi/hello.mid",
        description: "The classic Hello World program — prints a string using the play statement.",
        groovy: `play "Hello world!"`,
        js: `console.log("Hello world!");`
    },
    {
        title: "vars",
        url: "/midi/vars.mid",
        description: "Shows variable declarations using note (mutable) and key (immutable constant), with different types.",
        groovy: `// Small example to show variables

note score = 100
key maxScore = 999
note name = "Alice"
note active = open`,
        js: `let score_1 = 100;
const maxScore_2 = 999;
let name_3 = "Alice";
let active_4 = true;`
    },
    {
        title: "arithmetic",
        url: "/midi/arithmetic.mid",
        description: "Demonstrates arithmetic operators including exponentiation (^), sharp/flat (++ / --), and expression printing.",
        groovy: `// Small example to show basic arithmetic

note x = 4
note y = x ^ 3
x sharp
x flat
play x + y`,
        js: `let x_1 = 4;
let y_2 = (x_1 ** 3);
x_1++;
x_1--;
console.log((x_1 + y_2));`
    },
    {
        title: "conditionals",
        url: "/midi/conditionals.mid",
        description: "Shows if/else-if/else using Groovy's cue, alt, and drop keywords with a cadence block terminator.",
        groovy: `// Small example to show conditionals

note x = 5

cue x < 0:
  play "negative"
alt x == 0:
  play "zero"
drop:
  play "positive"
cadence`,
        js: `let x_1 = 5;
if ((x_1 < 0)) {
  console.log("negative");
} else
if ((x_1 === 0)) {
  console.log("zero");
} else {
  console.log("positive");
}`
    },
    {
        title: "arrays",
        url: "/midi/arrays.mid",
        description: "Creates an array of MIDI note numbers, accesses an element by index, then iterates over all elements.",
        groovy: `// Small example to show basic array logic

note notes = [60, 62, 64, 65, 67]
play notes[0]
measure n in notes:
  play n
cadence`,
        js: `let notes_1 = [60, 62, 64, 65, 67];
console.log(notes_1[0]);
for (let n_2 of notes_1) {
  console.log(n_2);
}`
    },
    {
        title: "collection",
        url: "/midi/collection.mid",
        description: "Loops through a collection using a measure...in loop — Groovy's equivalent of a for-of loop.",
        groovy: `// Small example to show looping through a collection

note beats = [1, 2, 3, 4]
measure beat in beats:
  play beat
cadence`,
        js: `let beats_1 = [1, 2, 3, 4];
for (let beat_2 of beats_1) {
  console.log(beat_2);
}`
    },
    {
        title: "functions",
        url: "/midi/functions.mid",
        description: "Defines two functions using compose: one that returns a value (add) and one that returns silence (greet).",
        groovy: `// Small example to show functions

compose add(x: level, y: level) -> level:
  fin x + y
cadence

compose greet(name: lyric):
  play name
cadence

play add(3, 7)
greet("Groovy")`,
        js: `function add_1(x_2, y_3) {
  return (x_2 + y_3);
}
function greet_4(name_5) {
  console.log(name_5);
}
console.log(add_1(3, 7));
greet_4("Groovy");`
    },
    {
        title: "range",
        url: "/midi/range.mid",
        description: "Iterates over a numeric range using measure...from...to — Groovy's range-based for loop.",
        groovy: `// Small example to show looping over a range

measure i from 1 to 10:
  play i
cadence`,
        js: `for (let i_1 = 1; i_1 <= 10; i_1++) {
  console.log(i_1);
}`
    },
    {
        title: "repeat",
        url: "/midi/repeat.mid",
        description: "Uses encore to repeat a block a fixed number of times — the optimizer unrolls this at compile time.",
        groovy: `// Small example to show looping a set amount of times

encore 4:
  play "drop the beat"
cadence`,
        js: `console.log("drop the beat");
console.log("drop the beat");
console.log("drop the beat");
console.log("drop the beat");`
    },
    {
        title: "while",
        url: "/midi/while.mid",
        description: "A basic while loop using vamp — runs while the condition holds, incrementing each iteration.",
        groovy: `// Small example to show a while loop

note i = 0
vamp i < 5:
  play i
  i = i + 1
cadence`,
        js: `let i_1 = 0;
while ((i_1 < 5)) {
  console.log(i_1);
  i_1 = (i_1 + 1);
}`
    },
    {
        title: "break",
        url: "/midi/break.mid",
        description: "Shows the cut statement (break) inside a vamp loop — exits early when i reaches 5.",
        groovy: `// Small example to show break functionality

note i = 0
vamp i < 100:
  cue i == 5:
    cut
  cadence
  i = i + 1
cadence`,
        js: `let i_1 = 0;
while ((i_1 < 100)) {
  if ((i_1 === 5)) {
    break;
  }
  i_1 = (i_1 + 1);
}`
    },
    {
        title: "fibonacci",
        url: "/midi/fibonacci.mid",
        description: "Computes Fibonacci numbers iteratively inside a recursive-style function using a vamp loop.",
        groovy: `// A fibonacci implementation in Groovy

compose fib(n: level, a: level, b: level) -> level:
  note currentN = n
  note currentA = a
  note currentB = b

  vamp open:
    cue currentN == 0:
      fin currentA
    cadence

    note nextB = currentA + currentB

    currentA = currentB
    currentB = nextB

    currentN flat
  cadence
cadence

play "First 15 Fibonacci numbers:"

measure i from 0 to 14:
  play fib(i, 0, 1)
cadence

play "The 50th Fibonacci number is:"
play fib(50, 0, 1)`,
        js: `function fib_1(n_2, a_3, b_4) {
  let currentN_5 = n_2;
  let currentA_6 = a_3;
  let currentB_7 = b_4;
  while (true) {
    if ((currentN_5 === 0)) {
      return currentA_6;
    }
    let nextB_8 = (currentA_6 + currentB_7);
    currentA_6 = currentB_7;
    currentB_7 = nextB_8;
    currentN_5--;
  }
}
console.log("First 15 Fibonacci numbers:");
for (let i_9 = 0; i_9 <= 14; i_9++) {
  console.log(fib_1(i_9, 0, 1));
}
console.log("The 50th Fibonacci number is:");
console.log(fib_1(50, 0, 1));`
    },
    {
        title: "gcd",
        url: "/midi/gcd.mid",
        description: "Implements Euclid's GCD algorithm using a vamp loop with variable swapping.",
        groovy: `// Euclid's GCD algorithm in Groovy

compose gcd(a: level, b: level) -> level:
  note currentA = a
  note currentB = b

  vamp currentB != 0:
    note temp = currentB
    currentB = currentA % currentB
    currentA = temp
  cadence

  fin currentA
cadence

note num1 = 48
note num2 = 18

play "The GCD of 48 and 18 is:"
play gcd(num1, num2)

play "The GCD of 1071 and 462 is:"
play gcd(1071, 462)`,
        js: `function gcd_1(a_2, b_3) {
  let currentA_4 = a_2;
  let currentB_5 = b_3;
  while ((currentB_5 !== 0)) {
    let temp_6 = currentB_5;
    currentB_5 = (currentA_4 % currentB_5);
    currentA_4 = temp_6;
  }
  return currentA_4;
}
let num1_7 = 48;
let num2_8 = 18;
console.log("The GCD of 48 and 18 is:");
console.log(gcd_1(num1_7, num2_8));
console.log("The GCD of 1071 and 462 is:");
console.log(gcd_1(1071, 462));`
    },
    {
        title: "bubble",
        url: "/midi/bubble.mid",
        description: "A full Bubble Sort implementation using nested vamp loops, array indexing, and swapping.",
        groovy: `// A Bubble Sort implementation in Groovy

compose bubbleSort(arr: [level], size: level):
  note swapped = open
  note limit = size

  vamp swapped:
    swapped = closed
    note i = 0

    vamp i < limit - 1:
      cue arr[i] > arr[i + 1]:
        note temp = arr[i]
        arr[i] = arr[i + 1]
        arr[i + 1] = temp

        swapped = open
      cadence

      i sharp
    cadence

    limit flat
  cadence
cadence

note numbers = [64, 34, 25, 12, 22, 11, 90]

play "Before sorting:"
measure item in numbers:
  play item
cadence

bubbleSort(numbers, 7)

play "After sorting:"
measure item in numbers:
  play item
cadence`,
        js: `function bubbleSort_1(arr_2, size_3) {
  let swapped_4 = true;
  let limit_5 = size_3;
  while (swapped_4) {
    swapped_4 = false;
    let i_6 = 0;
    while ((i_6 < (limit_5 - 1))) {
      if ((arr_2[i_6] > arr_2[(i_6 + 1)])) {
        let temp_7 = arr_2[i_6];
        arr_2[i_6] = arr_2[(i_6 + 1)];
        arr_2[(i_6 + 1)] = temp_7;
        swapped_4 = true;
      }
        i_6++;
    }
      limit_5--;
  }
}
let numbers_8 = [64, 34, 25, 12, 22, 11, 90];
console.log("Before sorting:");
for (let item_9 of numbers_8) {
  console.log(item_9);
}
bubbleSort_1(numbers_8, 7);
console.log("After sorting:");
for (let item_10 of numbers_8) {
  console.log(item_10);
}`
    },
    {
        title: "struct",
        url: "/midi/struct.mid",
        description: "Defines a custom chord (struct) with typed fields, a constructor function, and member access.",
        groovy: `// Small example to showcase making and accessing a struct

chord Point:
  x: level
  y: level
cadence

compose makePoint(a: level, b: level) -> Point:
  fin Point(a, b)
cadence

note p = makePoint(3, 4)
play p.x`,
        js: `class Point {
constructor(x, y) {
this.x = x;
this.y = y;
}
}
function makePoint_1(a_2, b_3) {
  return new Point(a_2, b_3);
}
let p_4 = makePoint_1(3, 4);
console.log(p_4.x);`
    },
    {
        title: "optional",
        url: "/midi/optional.mid",
        description: "Shows the ghost optional type and the ?? unwrap-or-else operator.",
        groovy: `// Small example to showcase optionals

note maybeScore = ghost 5
note result = maybeScore ?? 0
play result`,
        js: `let maybeScore_1 = 5;
let result_2 = (maybeScore_1 ?? 0);
console.log(result_2);`
    },
    {
        title: "optimization",
        url: "/midi/optimization.mid",
        description: "Showcases the Groovy optimizer: constant folding, dead code elimination, loop unrolling, and strength reduction.",
        groovy: `// A showcase of many optimizations present in the optimizer

compose heavilyOptimized(x: level, y: level) -> level:

  vamp closed:
    play "This will never run"
  cadence

  encore 0:
    play "Neither will this"
  cadence

  cue closed:
    play "Dead if-statement block"
  cadence

  encore 3:
    play "Unroll me!"
  cadence

  note mathMagic = (5 * 8) + (10 % 3) + (2 ^ 3)

  note logicMagic = !(!open) && (closed || open)

  note strength = (x * 0) + (y * 1) + (x - x) + (y / y)

  note flipped = !(x < y)
  note isSame = (x == x)

  note stdLib = sqrt(16) + hypot(3, 4)

  fin stdLib + strength
  play "This is completely eliminated because it's after a return"

cadence

play heavilyOptimized(10, 20)`,
        js: `function heavilyOptimized_1(x_2, y_3) {
  console.log("Unroll me!");
  console.log("Unroll me!");
  console.log("Unroll me!");
  let mathMagic_4 = 49;
  let logicMagic_5 = true;
  let strength_6 = (y_3 + 1);
  let flipped_7 = (x_2 >= y_3);
  let isSame_8 = true;
  let stdLib_9 = 9;
  return (stdLib_9 + strength_6);
}
console.log(heavilyOptimized_1(10, 20));`
    },
    {
        title: "bachToBasics",
        url: "/midi/bachToBasics.mid",
        description: "A short musical program: iterates over beats 1–4 playing a kick, then bumps the tempo.",
        groovy: `note tempo = 120
note kick = "Boom"

measure beat from 1 to 4:
  play kick
cadence

tempo sharp`,
        js: `let tempo_1 = 120;
let kick_2 = "Boom";
for (let beat_3 = 1; beat_3 <= 4; beat_3++) {
console.log(kick_2);
}
tempo_1++;`
    },
    {
        title: "808sAndNoHeartbreaks",
        url: "/midi/808sAndNoHeartbreaks.mid",
        description: "A chord struct with a status gate and temperature level, looping until the drum machine threshold.",
        groovy: `// In the night, I hear them talk
chord Heart:
  status: gate
  temperature: level
cadence

compose heartbreak() -> silence:
  note myHeart = Heart(closed, 0)
  note drumMachine = 808

  vamp myHeart.temperature < drumMachine:
    cue myHeart.status == closed:
      play "How could you be so cold?"
      cut
    drop:
      myHeart.temperature sharp
    cadence
  cadence

  fin
cadence`,
        js: `class Heart {
  constructor(status, temperature) {
    this.status = status;
    this.temperature = temperature;
  }
}
function heartbreak_1() {
  let myHeart_2 = new Heart(false, 0);
  let drumMachine_3 = 808;
  while ((myHeart_2.temperature < drumMachine_3)) {
    if ((myHeart_2.status === false)) {
      console.log("How could you be so cold?");
      break;
    } else {
      myHeart_2.temperature++;
    }
  }
  return;
}`
    },
    {
        title: "groovyMouth",
        url: "/midi/groovyMouth.mid",
        description: "A function with boolean parameters, nested conditionals, and a string return — inspired by All Star.",
        groovy: `// Somebody once told me
key world = "gonna roll me"
note sharpestTool = closed

compose getYourGameOn(isStar: gate, hasMoney: gate) -> lyric:
  cue isStar == open && hasMoney == open:
    play "Hey now, you're an All Star!"
    play "Get your show on, get paid."
  alt isStar == open:
    play "Go play."
  cadence

  note shootingStar = "breaks the mold"
  fin "All that glitters is gold"
cadence

getYourGameOn(open, closed)`,
        js: `const world_1 = "gonna roll me";
let sharpestTool_2 = false;
function getYourGameOn_3(isStar_4, hasMoney_5) {
  if (((isStar_4 === true) && (hasMoney_5 === true))) {
    console.log("Hey now, you're an All Star!");
    console.log("Get your show on, get paid.");
  } else
    if ((isStar_4 === true)) {
      console.log("Go play.");
  }
  let shootingStar_6 = "breaks the mold";
  return "All that glitters is gold";
}
getYourGameOn_3(true, false);`
    }
];
