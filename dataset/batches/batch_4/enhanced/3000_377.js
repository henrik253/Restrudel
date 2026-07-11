setcpm(28)

$: s("bd ~ sd sd").bank("RolandTR909").gain(.7)

$: s("hh*4").gain(.2)

$: n("0 2 7 5").scale("e:minor").s("square").lpf(800).gain(.4)

$: n("0 4 7 5 3").scale("c:minor").s("sawtooth").lpf(2000).resonance(3).gain(.4)
