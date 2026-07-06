setcpm(120/4)

$: s("bd ~ sd ~").bank("BossDR550").gain(.85)

$: s("~ cp ~ cp").gain(.4).room(.2)

$: n("0 3 5 3 7 5 3 0").scale("a:minor").s("sawtooth").lpf(2400).resonance(6).release(.2).delay(.3).gain(.4)

$: n("<a1 e2 c2 g1>").scale("a:minor").s("square").lpf(600).release(.3).gain(.5)
