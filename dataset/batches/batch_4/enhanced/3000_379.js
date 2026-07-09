setcpm(28)

$: s("bd cp sd cp").bank("RolandTR909").gain(.7)

$: s("hh*8").gain(.2)

$: n("0 3 7 5").scale("g:minor").s("sawtooth").lpf(800).gain(.4)

$: n("0 4 7 2 5").scale("d:dorian").s("sawtooth").lpf(2000).resonance(3).gain(.4)
