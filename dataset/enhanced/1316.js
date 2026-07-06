setcpm(120/4)

$: s("bd ~ sd ~").bank("Linn9000").gain(.85)

$: s("~ cp ~ cp").gain(.35)

$: note("b4 a#4 f#4 g#4 f#4 f4 d#4 d4 c4 a4 g#3 g3 f3 c3").s("sawtooth")
  .lpf(2400).resonance(6).release(.15).gain(.4)

$: note("<b2 f#2 d#2 g#1>").s("square")
  .lpf(600).release(.3).gain(.5)
