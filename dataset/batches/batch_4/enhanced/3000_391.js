setcpm(31)

$: s("bd*4 ~").bank("RolandTR909").gain(.7)

$: s("~ hh ~ hh").gain(.2)

$: n("0 7 3 5").scale("f:minor").s("sawtooth").lpf(800).gain(.4)

$: n("0 7 4 3 5").scale("e:minor").s("sawtooth").lpf(2000).resonance(3).gain(.4)
