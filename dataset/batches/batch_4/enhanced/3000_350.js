setcpm(36)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.7)

$: s("hh*16").gain(.2)

$: n("0 5 7 3").scale("d:dorian").s("square").lpf(800).gain(.4)

$: n("0 3 5 7 4").scale("f:minor").s("sawtooth").lpf(2000).resonance(3).gain(.4)
