setcpm(27)

$: s("bd bd ~ sd").bank("RolandTR909").gain(.7)

$: s("hh hh ~ hh").gain(.2)

$: n("0 7 5 3").scale("c:minor").s("square").lpf(800).gain(.4)

$: n("0 3 7 4 5").scale("g:minor").s("sawtooth").lpf(2000).resonance(3).gain(.4)
